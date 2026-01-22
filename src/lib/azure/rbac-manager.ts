import { AuthorizationManagementClient } from '@azure/arm-authorization';
import { DefaultAzureCredential } from '@azure/identity';

export class RBACManager {
    private authClient: AuthorizationManagementClient;
    private subscriptionId: string;

    constructor() {
        const credential = new DefaultAzureCredential();
        this.subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
        this.authClient = new AuthorizationManagementClient(credential, this.subscriptionId);

        console.log(`[RBACManager] Initialized for subscription: ${this.subscriptionId}`);
    }

    /**
     * Assign custom role to user scoped to specific Resource Group
     * Uses role ID from environment variable
     */
    async assignCustomRole(
        userPrincipalName: string,
        resourceGroupName: string
    ): Promise<void> {
        const customRoleId = process.env.AZURE_CUSTOM_ROLE_ID;

        if (!customRoleId) {
            throw new Error('AZURE_CUSTOM_ROLE_ID environment variable not set');
        }

        console.log(`[RBACManager] Assigning custom role to ${userPrincipalName} for RG: ${resourceGroupName}`);

        try {
            // Get user's object ID from UPN
            const userObjectId = await this.getUserObjectId(userPrincipalName);

            // Use custom role definition ID from environment (already includes full path)
            const roleDefinitionId = customRoleId;

            // Scope to specific resource group (no leading slash to avoid double slash in API call)
            const scope = `subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}`;

            // Create role assignment
            const roleAssignmentName = this.generateGuid();

            const roleAssignmentParams = {
                roleDefinitionId: roleDefinitionId,
                principalId: userObjectId,
                principalType: 'User' as const
            };

            console.log(`[RBACManager] Creating role assignment with:`, {
                scope,
                roleAssignmentName,
                params: roleAssignmentParams
            });

            await this.authClient.roleAssignments.create(scope, roleAssignmentName, roleAssignmentParams);

            console.log(`[RBACManager] Custom role assigned successfully`);
        } catch (error: any) {
            console.error(`[RBACManager] Failed to assign role:`, error);
            throw new Error(`Failed to assign custom role: ${error.message}`);
        }
    }

    /**
     * Remove all role assignments for a user in a Resource Group
     */
    async removeUserRoleAssignments(
        userPrincipalName: string,
        resourceGroupName: string
    ): Promise<void> {
        console.log(`[RBACManager] Removing role assignments for ${userPrincipalName} in RG: ${resourceGroupName}`);

        try {
            const userObjectId = await this.getUserObjectId(userPrincipalName);
            const scope = `subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}`;

            // List all role assignments for this scope
            const assignments = await this.authClient.roleAssignments.listForScope(scope);

            for await (const assignment of assignments) {
                if (assignment.principalId === userObjectId) {
                    console.log(`[RBACManager] Removing assignment: ${assignment.id}`);
                    await this.authClient.roleAssignments.deleteById(assignment.id!);
                }
            }

            console.log(`[RBACManager] All role assignments removed`);
        } catch (error: any) {
            console.error(`[RBACManager] Failed to remove role assignments:`, error);
            // Don't throw - continue with cleanup
        }
    }

    /**
     * Get user's Azure AD object ID from User Principal Name
     */
    private async getUserObjectId(userPrincipalName: string): Promise<string> {
        // Import adManager to get user details
        const { adManager } = await import('./ad-manager');
        const user = await adManager.getLabUser(userPrincipalName);

        if (!user) {
            throw new Error(`User not found: ${userPrincipalName}`);
        }

        return user.id;
    }

    /**
     * Generate a GUID for role assignment name
     */
    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}

// Export singleton instance
export const rbacManager = new RBACManager();
