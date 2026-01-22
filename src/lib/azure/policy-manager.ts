import { PolicyClient } from '@azure/arm-policy';
import { DefaultAzureCredential } from '@azure/identity';

export class PolicyManager {
    private policyClient: PolicyClient;
    private subscriptionId: string;

    constructor() {
        const credential = new DefaultAzureCredential();
        this.subscriptionId = process.env.AZURE_SUBSCRIPTION_ID!;
        this.policyClient = new PolicyClient(credential, this.subscriptionId);

        console.log(`[PolicyManager] Initialized for subscription: ${this.subscriptionId}`);
    }

    /**
     * Assign custom initiative to Resource Group
     * Uses initiative ID from environment variable
     */
    async assignCustomInitiative(resourceGroupName: string): Promise<void> {
        const customInitiativeId = process.env.AZURE_CUSTOM_INITIATIVE_ID;

        if (!customInitiativeId) {
            throw new Error('AZURE_CUSTOM_INITIATIVE_ID environment variable not set');
        }

        console.log(`[PolicyManager] Assigning custom initiative to ${resourceGroupName}`);

        const scope = `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}`;

        try {
            // Assign the custom initiative
            await this.policyClient.policyAssignments.create(
                scope,
                'lab-custom-initiative',
                {
                    displayName: 'Lab Custom Initiative',
                    description: 'Custom initiative for lab resource groups',
                    policyDefinitionId: customInitiativeId,
                    // You can add parameters here if your initiative requires them
                    parameters: {}
                }
            );
            console.log(`[PolicyManager] ✓ Custom initiative assigned successfully`);
        } catch (error: any) {
            console.error(`[PolicyManager] Failed to assign initiative:`, error);
            throw new Error(`Failed to assign custom initiative: ${error.message}`);
        }
    }

    /**
     * Remove custom initiative from Resource Group
     */
    async removeCustomInitiative(resourceGroupName: string): Promise<void> {
        console.log(`[PolicyManager] Removing custom initiative from ${resourceGroupName}`);

        const scope = `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}`;

        try {
            await this.policyClient.policyAssignments.delete(scope, 'lab-custom-initiative');
            console.log(`[PolicyManager] ✓ Custom initiative removed`);
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log(`[PolicyManager] Initiative not found (already removed)`);
            } else {
                console.error(`[PolicyManager] Failed to remove initiative:`, error);
            }
        }
    }

    /**
     * Remove all policy assignments from Resource Group
     */
    async removePolicyAssignments(resourceGroupName: string): Promise<void> {
        console.log(`[PolicyManager] Removing policy assignments from ${resourceGroupName}`);

        const scope = `/subscriptions/${this.subscriptionId}/resourceGroups/${resourceGroupName}`;

        try {
            const policyNames = ['allowed-vm-sizes', 'allowed-locations', 'require-lab-tag'];

            for (const policyName of policyNames) {
                try {
                    await this.policyClient.policyAssignments.delete(scope, policyName);
                    console.log(`[PolicyManager] ✓ Removed policy: ${policyName}`);
                } catch (error: any) {
                    if (error.statusCode === 404) {
                        console.log(`[PolicyManager] Policy ${policyName} not found (already removed)`);
                    } else {
                        console.error(`[PolicyManager] Failed to remove policy ${policyName}:`, error);
                    }
                }
            }

            console.log(`[PolicyManager] Policy cleanup complete`);
        } catch (error: any) {
            console.error(`[PolicyManager] Failed to remove policies:`, error);
            // Don't throw - continue with cleanup
        }
    }
}

// Export singleton instance
export const policyManager = new PolicyManager();
