import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const purchaseId = searchParams.get('purchaseId');

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

        if (!labEntry) {
            return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
        }

        console.log(`[DELETE Lab] Permanently destroying lab: ${labEntry.courseId} (Purchase ID: ${purchaseId})`);

        // Delete snapshot if exists
        if (labEntry.snapshotName && labEntry.activeSession?.id) {
            try {
                console.log(`[DELETE Lab] Deleting snapshot: ${labEntry.snapshotName}`);
                await labManager.deleteSnapshot(labEntry.snapshotName, labEntry.activeSession.id);
            } catch (error) {
                console.error('[DELETE Lab] Failed to delete snapshot:', error);
                // Continue with deletion
            }
        }

        // Delete Azure resources and Guacamole user
        if (labEntry.activeSession) {
            const resourceGroupName = labEntry.activeSession.id;
            const guacamoleUsername = labEntry.activeSession.guacamoleUsername;
            const azureUsername = labEntry.activeSession.azureUsername;
            const azureResourceGroup = labEntry.activeSession.azureResourceGroup;

            // NEW: Delete Azure Portal resources first (if user created Azure account)

            if (azureUsername && azureResourceGroup) {
                try {
                    const { adManager } = await import('@/lib/azure/ad-manager');
                    const { rbacManager } = await import('@/lib/azure/rbac-manager');
                    const { policyManager } = await import('@/lib/azure/policy-manager');

                    // Remove policy initiative
                    await policyManager.removeCustomInitiative(azureResourceGroup);
                    console.log(`[DELETE Lab] Policy initiative removed from ${azureResourceGroup}`);

                    // Remove RBAC assignments
                    await rbacManager.removeUserRoleAssignments(azureUsername, azureResourceGroup);
                    console.log(`[DELETE Lab] RBAC assignments removed for ${azureUsername}`);

                    // Delete Azure Portal Resource Group
                    await labManager.deleteResourceGroup(azureResourceGroup);
                    console.log(`[DELETE Lab] Azure Portal RG deleted: ${azureResourceGroup}`);

                    // Delete Azure AD user
                    await adManager.deleteLabUser(azureUsername);
                    console.log(`[DELETE Lab] Azure AD user deleted: ${azureUsername}`);
                } catch (error) {
                    console.error('[DELETE Lab] Failed to delete Azure Portal resources:', error);
                    // Continue with deletion
                }
            }

            // Delete lab VM's Resource Group (with Guacamole cleanup)
            try {
                console.log(`[DELETE Lab] Deleting lab resource group: ${resourceGroupName}`);
                await labManager.deleteLab(resourceGroupName, guacamoleUsername);
            } catch (error) {
                console.error('[DELETE Lab] Failed to delete lab resources:', error);
            }
        }

        // Delete snapshot if exists
        if (labEntry.snapshotName && labEntry.resourceGroupName) {
            try {
                console.log(`[DELETE Lab] Deleting snapshot: ${labEntry.snapshotName}`);
                await labManager.deleteSnapshot(labEntry.snapshotName, labEntry.resourceGroupName);
            } catch (error) {
                console.error('[DELETE Lab] Failed to delete snapshot:', error);
            }
        }

        // Clear session and snapshot data but KEEP the lab in purchasedLabs
        labEntry.activeSession = null;
        labEntry.snapshotId = undefined;
        labEntry.snapshotName = undefined;
        labEntry.snapshotCreatedAt = undefined;
        labEntry.resourceGroupName = undefined;

        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Lab session destroyed. You can launch it again from the dashboard.'
        }, { status: 200 });

    } catch (error) {
        console.error('Lab deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete lab' }, { status: 500 });
    }
}
