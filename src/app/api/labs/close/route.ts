import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { purchaseId } = await request.json();

        if (!purchaseId) {
            return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Find lab by purchaseId (MongoDB _id)
        const labEntry = user.purchasedLabs?.id(purchaseId);

        if (!labEntry || !labEntry.activeSession) {
            return NextResponse.json({ error: 'No active session found' }, { status: 404 });
        }

        const resourceGroupName = labEntry.activeSession.id;
        const vmName = labEntry.activeSession.vmName;
        const guacamoleUsername = labEntry.activeSession.guacamoleUsername;

        console.log(`[CLOSE Lab] Starting close process for: ${resourceGroupName}`);

        // Step 1: Create snapshot (this will deallocate VM first)
        let snapshotCreated = false;
        try {
            if (vmName) {
                console.log(`[CLOSE Lab] Creating snapshot (will deallocate VM first)...`);
                const snapshotData = await labManager.createSnapshot(resourceGroupName, vmName);

                // Save new snapshot info
                labEntry.snapshotId = snapshotData.snapshotId;
                labEntry.snapshotName = snapshotData.snapshotName;
                labEntry.snapshotCreatedAt = new Date();
                snapshotCreated = true;

                console.log(`[CLOSE Lab] Snapshot created: ${snapshotData.snapshotName}`);

                // Rotate old snapshots (keep only latest 1)
                await labManager.deleteOldSnapshots(resourceGroupName, vmName, 1);
            }
        } catch (error) {
            console.error('[CLOSE Lab] Failed to create snapshot:', error);
            // Continue with VM deletion even if snapshot fails
        }

        // Step 2: Delete VM resources (VM already deallocated by snapshot creation)
        try {
            if (vmName) {
                console.log(`[CLOSE Lab] Deleting VM resources (keeping RG and snapshot)...`);
                await labManager.deleteVMResources(resourceGroupName, vmName);
            }
        } catch (error) {
            console.error('[CLOSE Lab] Failed to delete VM resources:', error);
            // Continue anyway to clear session
        }

        // Step 3: Delete Guacamole user
        if (guacamoleUsername) {
            try {
                const { guacamoleClient } = await import('@/lib/guacamole/client');
                await guacamoleClient.deleteUser(guacamoleUsername);
                console.log(`[CLOSE Lab] Guacamole user deleted: ${guacamoleUsername}`);
            } catch (error) {
                console.error('[CLOSE Lab] Failed to delete Guacamole user:', error);
            }
        }


        // NEW Step 4: Delete Azure Portal resources (if user created Azure account)
        const azureUsername = labEntry.activeSession.azureUsername;
        const azureResourceGroup = labEntry.activeSession.azureResourceGroup;

        if (azureUsername && azureResourceGroup) {
            try {
                const { adManager } = await import('@/lib/azure/ad-manager');
                const { rbacManager } = await import('@/lib/azure/rbac-manager');
                const { policyManager } = await import('@/lib/azure/policy-manager');

                console.log(`[CLOSE Lab] Deleting Azure Portal resources...`);

                // Remove policy initiative from Azure Portal RG
                await policyManager.removeCustomInitiative(azureResourceGroup);
                console.log(`[CLOSE Lab] Policy initiative removed from ${azureResourceGroup}`);

                // Remove RBAC assignments
                await rbacManager.removeUserRoleAssignments(azureUsername, azureResourceGroup);
                console.log(`[CLOSE Lab] RBAC assignments removed for ${azureUsername}`);

                // Delete the Azure Portal Resource Group (NOT the lab VM's RG)
                await labManager.deleteResourceGroup(azureResourceGroup);
                console.log(`[CLOSE Lab] Azure Portal RG deleted: ${azureResourceGroup}`);

                // Delete Azure AD user
                await adManager.deleteLabUser(azureUsername);
                console.log(`[CLOSE Lab] Azure AD user deleted: ${azureUsername}`);

            } catch (error) {
                console.error('[CLOSE Lab] Failed to delete Azure Portal resources:', error);
                // Continue anyway
            }
        }

        // Step 5: Calculate session duration and update usage tracking
        const sessionStartTime = labEntry.activeSession.startTime;
        const sessionEndTime = new Date();
        const durationMinutes = sessionStartTime
            ? Math.floor((sessionEndTime.getTime() - new Date(sessionStartTime).getTime()) / 60000)
            : 0;

        console.log(`[CLOSE Lab] Session duration: ${durationMinutes} minutes`);

        // Update total time spent
        labEntry.totalTimeSpent = (labEntry.totalTimeSpent || 0) + durationMinutes;

        // Add to launch history
        if (!labEntry.launchHistory) {
            labEntry.launchHistory = [];
        }
        labEntry.launchHistory.push({
            launchedAt: sessionStartTime,
            closedAt: sessionEndTime,
            duration: durationMinutes
        });

        // Clear active session (but keep lab VM's RG name for next launch)
        const preservedRG = labEntry.activeSession.id; // Keep RG name
        labEntry.activeSession = null;

        // Always store the current RG name for reuse on next launch
        labEntry.resourceGroupName = preservedRG;

        await user.save();

        return NextResponse.json({
            success: true,
            message: snapshotCreated
                ? 'Lab closed and snapshot created. Your work has been saved! Resource group preserved for next launch.'
                : 'Lab closed successfully. Resource group preserved.',
            snapshotCreated,
            resourceGroupPreserved: true
        }, { status: 200 });

    } catch (error) {
        console.error('Lab close error:', error);
        return NextResponse.json({
            error: 'Failed to close lab',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
