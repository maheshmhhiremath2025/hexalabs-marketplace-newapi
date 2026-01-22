import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { labManager } from '@/lib/azure/lab-manager';
import { MOCK_COURSES } from '@/lib/mock-data';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, purchaseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
        }

        if (!purchaseId) {
            return NextResponse.json({ message: 'Purchase ID is required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        // Find the specific purchase by purchaseId (MongoDB _id)
        const labEntry = user.purchasedLabs.id(purchaseId);

        if (!labEntry || labEntry.courseId !== courseId) {
            return NextResponse.json({ message: 'Lab not purchased or invalid purchase ID' }, { status: 403 });
        }

        // Initialize access expiry if not set (for existing purchases)
        if (!labEntry.accessExpiresAt) {
            const expiryDate = new Date(labEntry.purchaseDate);
            expiryDate.setDate(expiryDate.getDate() + 180); // 180 days from purchase
            labEntry.accessExpiresAt = expiryDate;
        }

        // Check if access has expired (180 days)
        if (new Date() > new Date(labEntry.accessExpiresAt)) {
            // Auto-destroy expired lab
            if (labEntry.activeSession) {
                try {
                    await labManager.deleteLab(
                        labEntry.activeSession.id,
                        labEntry.activeSession.guacamoleUsername
                    );
                } catch (error) {
                    console.error('[Launch] Failed to delete expired lab:', error);
                }
                labEntry.activeSession = null;
            }
            // Delete snapshot if exists
            if (labEntry.snapshotName) {
                labEntry.snapshotId = undefined;
                labEntry.snapshotName = undefined;
                labEntry.snapshotCreatedAt = undefined;
            }
            await user.save();
            return NextResponse.json({
                message: 'Lab access has expired (180 days). Please contact support to renew access.',
                expired: true
            }, { status: 403 });
        }

        // Check launch limit (10 launches)
        if (labEntry.launchCount >= labEntry.maxLaunches) {
            // Auto-destroy lab that reached launch limit
            if (labEntry.activeSession) {
                try {
                    await labManager.deleteLab(
                        labEntry.activeSession.id,
                        labEntry.activeSession.guacamoleUsername
                    );
                } catch (error) {
                    console.error('[Launch] Failed to delete lab at launch limit:', error);
                }
                labEntry.activeSession = null;
            }
            // Delete snapshot if exists
            if (labEntry.snapshotName) {
                labEntry.snapshotId = undefined;
                labEntry.snapshotName = undefined;
                labEntry.snapshotCreatedAt = undefined;
            }
            await user.save();
            return NextResponse.json({
                message: `Launch limit reached (${labEntry.maxLaunches}/${labEntry.maxLaunches}). Lab has been deactivated.`,
                limitReached: true
            }, { status: 403 });
        }

        // Increment launch count BEFORE provisioning
        labEntry.launchCount = (labEntry.launchCount || 0) + 1;
        console.log(`[Launch] Launch count: ${labEntry.launchCount}/${labEntry.maxLaunches}`);

        // Check if snapshot exists - if yes, we'll restore from it
        const hasSnapshot = !!(labEntry.snapshotId && labEntry.snapshotName);
        const existingRG = labEntry.resourceGroupName; // Reuse existing RG if available

        console.log(`[Launch] Snapshot exists: ${hasSnapshot}`);
        console.log(`[Launch] Existing RG: ${existingRG || 'none - will create new'}`);

        // NEW: Check if course requires Azure Portal access
        const course = MOCK_COURSES.find(c => c.id === courseId);
        let azurePortalAccess = null;

        if (course?.requiresAzurePortal) {
            console.log('[Launch] Course requires Azure Portal access - provisioning Azure AD user');

            try {
                // Import Azure managers
                const { adManager } = await import('@/lib/azure/ad-manager');

                // 1. Create Azure AD User
                // @ts-ignore
                const adUser = await adManager.createLabUser(session.user.id as string, courseId);
                console.log(`[Launch] Azure AD user created: ${adUser.userPrincipalName}`);

                // 2. Store for later RBAC assignment (after RG is created)
                azurePortalAccess = {
                    username: adUser.userPrincipalName,
                    password: adUser.password,
                    objectId: adUser.objectId,
                    resourceGroup: '', // Will be set after RG creation
                    portalUrl: 'https://portal.azure.com'
                };

                console.log(`[Launch] Azure Portal access prepared for ${adUser.userPrincipalName}`);
            } catch (error) {
                console.error('[Launch] Failed to provision Azure AD user:', error);
                // Continue with VM-only provisioning if AD fails
            }
        }

        // Trigger Azure VM Provisioning
        // Pass existing RG and snapshot info if available
        // @ts-ignore
        const labSession = await labManager.launchLab(
            session.user.id as string,
            courseId,
            hasSnapshot ? {
                snapshotId: labEntry.snapshotId,
                snapshotName: labEntry.snapshotName
            } : undefined,
            existingRG // Pass existing RG to reuse
        );

        // NEW: Assign RBAC role and policies AFTER RG is created
        if (azurePortalAccess) {
            try {
                const { rbacManager } = await import('@/lib/azure/rbac-manager');
                const { policyManager } = await import('@/lib/azure/policy-manager');

                // Assign custom role (from environment variable)
                await rbacManager.assignCustomRole(
                    azurePortalAccess.username,
                    labSession.id // Resource Group name
                );
                console.log(`[Launch] Custom role assigned to ${azurePortalAccess.username}`);

                // Apply custom initiative (from environment variable)
                await policyManager.assignCustomInitiative(labSession.id);
                console.log(`[Launch] Custom initiative applied to ${labSession.id}`);

                // Update azurePortalAccess with actual RG name
                azurePortalAccess.resourceGroup = labSession.id;
            } catch (error) {
                console.error('[Launch] Failed to assign RBAC/Policies:', error);
                // Continue anyway - user still has AD account
            }
        }

        // Calculate session expiry (4 hours from now)
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + (labEntry.sessionDurationHours || 4));

        // Save session to user profile
        console.log('[Launch] Saving session with authToken:', {
            hasAuthToken: !!labSession.guacamoleAuthToken,
            tokenPreview: labSession.guacamoleAuthToken ? labSession.guacamoleAuthToken.substring(0, 20) + '...' : 'MISSING'
        });

        labEntry.activeSession = {
            id: labSession.id, // Resource Group Name
            vmName: labSession.vmName,
            guacamoleConnectionId: labSession.guacamoleConnectionId,
            guacamoleUsername: labSession.guacamoleUsername,
            guacamolePassword: labSession.guacamolePassword,
            guacamoleAuthToken: labSession.guacamoleAuthToken,
            // NEW: Azure Portal Access
            azureUsername: azurePortalAccess?.username,
            azurePassword: azurePortalAccess?.password,
            azureObjectId: azurePortalAccess?.objectId,
            azureResourceGroup: azurePortalAccess?.resourceGroup,
            status: labSession.status,
            startTime: new Date(),
            expiresAt: sessionExpiry,
        };

        // ALWAYS update RG name to match what was actually used in this launch
        // This ensures we track the correct RG even if a new one was created
        labEntry.resourceGroupName = labSession.id;

        // Track last access time
        labEntry.lastAccessedAt = new Date();

        await user.save();

        return NextResponse.json({
            ...labSession,
            launchCount: labEntry.launchCount,
            maxLaunches: labEntry.maxLaunches,
            remainingLaunches: labEntry.maxLaunches - labEntry.launchCount,
            sessionExpiresAt: sessionExpiry,
            accessExpiresAt: labEntry.accessExpiresAt,
            restoredFromSnapshot: hasSnapshot,
            reusedResourceGroup: !!existingRG,
            // NEW: Azure Portal Access
            azurePortalAccess: azurePortalAccess ? {
                username: azurePortalAccess.username,
                password: azurePortalAccess.password,
                portalUrl: azurePortalAccess.portalUrl,
                resourceGroup: azurePortalAccess.resourceGroup
            } : null
        });
    } catch (error: any) {
        console.error('Lab Launch Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to launch lab' },
            { status: 500 }
        );
    }
}
