import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { adManager } from '@/lib/azure/ad-manager';
import { rbacManager } from '@/lib/azure/rbac-manager';
import { policyManager } from '@/lib/azure/policy-manager';
import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';

/**
 * Create Azure Portal Account for Lab User
 * This is separate from the lab VM - creates a dedicated RG for Azure Portal access
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        // Verify purchase
        const labEntry = user.purchasedLabs.find((lab: any) => lab.courseId === courseId);

        if (!labEntry) {
            return NextResponse.json({ message: 'Lab not purchased' }, { status: 403 });
        }

        // Check if Azure account already exists
        if (labEntry.activeSession?.azureUsername) {
            return NextResponse.json({
                message: 'Azure account already exists',
                azurePortalAccess: {
                    username: labEntry.activeSession.azureUsername,
                    password: labEntry.activeSession.azurePassword,
                    portalUrl: 'https://portal.azure.com',
                    resourceGroup: labEntry.activeSession.azureResourceGroup
                }
            });
        }

        console.log('[Create Azure Account] Starting provisioning...');

        // 1. Create Azure AD User
        // @ts-ignore
        const adUser = await adManager.createLabUser(session.user.id as string, courseId);
        console.log(`[Create Azure Account] Azure AD user created: ${adUser.userPrincipalName}`);

        // 2. Create dedicated Resource Group for user's Azure Portal work
        const credential = new DefaultAzureCredential();
        const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
        const resourceClient = new ResourceManagementClient(credential, subscriptionId);

        const uniqueId = Math.random().toString(36).substring(2, 7);
        // @ts-ignore
        const azureRGName = `azure-portal-${(session.user.id as string).substring(0, 5)}-${courseId}-${uniqueId}`;
        const location = process.env.AZURE_LOCATION || 'centralus';

        console.log(`[Create Azure Account] Creating Resource Group: ${azureRGName}`);
        await resourceClient.resourceGroups.createOrUpdate(azureRGName, {
            location: location,
            tags: {
                purpose: 'lab-azure-portal',
                courseId: courseId,
                // @ts-ignore
                userId: session.user.id as string,
                createdAt: new Date().toISOString()
            }
        });

        // 3. Assign custom role to user (scoped to this RG)
        await rbacManager.assignCustomRole(adUser.userPrincipalName, azureRGName);
        console.log(`[Create Azure Account] Custom role assigned to ${adUser.userPrincipalName}`);

        // 4. Apply custom initiative to RG
        await policyManager.assignCustomInitiative(azureRGName);
        console.log(`[Create Azure Account] Custom initiative applied to ${azureRGName}`);

        // 5. Save Azure credentials to user session
        if (!labEntry.activeSession) {
            labEntry.activeSession = {};
        }

        labEntry.activeSession.azureUsername = adUser.userPrincipalName;
        labEntry.activeSession.azurePassword = adUser.password;
        labEntry.activeSession.azureObjectId = adUser.objectId;
        labEntry.activeSession.azureResourceGroup = azureRGName; // Separate RG for Azure Portal

        await user.save();

        console.log('[Create Azure Account] Azure account provisioned successfully');

        return NextResponse.json({
            success: true,
            message: 'Azure Portal account created successfully!',
            azurePortalAccess: {
                username: adUser.userPrincipalName,
                password: adUser.password,
                portalUrl: 'https://portal.azure.com',
                resourceGroup: azureRGName
            }
        });

    } catch (error: any) {
        console.error('Azure Account Creation Error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to create Azure account' },
            { status: 500 }
        );
    }
}
