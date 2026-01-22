import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

interface LabUser {
    username: string;
    password: string;
    userPrincipalName: string;
    objectId: string;
}

export class AzureADManager {
    private graphClient: Client;
    private domain: string;

    constructor() {
        this.domain = process.env.AZURE_AD_DOMAIN || 'hexalabs.online';

        // Create credential for Microsoft Graph
        const credential = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID!,
            process.env.AZURE_CLIENT_ID!,
            process.env.AZURE_CLIENT_SECRET!
        );

        // Initialize Graph client
        this.graphClient = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const token = await credential.getToken('https://graph.microsoft.com/.default');
                    return token.token;
                }
            }
        });

        console.log(`[ADManager] Initialized with domain: ${this.domain}`);
    }

    /**
     * Create a temporary Azure AD user for lab access
     */
    async createLabUser(userId: string, labId: string): Promise<LabUser> {
        const uniqueId = Math.random().toString(36).substring(2, 10);
        const username = `lab-user-${uniqueId}`;
        const password = this.generateSecurePassword();
        const userPrincipalName = `${username}@${this.domain}`;

        console.log(`[ADManager] Creating Azure AD user: ${userPrincipalName}`);

        try {
            const user = await this.graphClient.api('/users').post({
                accountEnabled: true,
                displayName: `Lab User ${uniqueId}`,
                mailNickname: username,
                userPrincipalName: userPrincipalName,
                passwordProfile: {
                    forceChangePasswordNextSignIn: false,
                    password: password
                },
                usageLocation: 'US', // Required for license assignment
                // Store metadata in extension attributes (requires schema extension setup)
                // For now, we'll use displayName to track
                jobTitle: `Lab: ${labId}`,
                department: `User: ${userId}`
            });

            console.log(`[ADManager] User created successfully: ${user.id}`);

            return {
                username,
                password,
                userPrincipalName,
                objectId: user.id
            };
        } catch (error: any) {
            console.error(`[ADManager] Failed to create user:`, error);
            throw new Error(`Failed to create Azure AD user: ${error.message}`);
        }
    }

    /**
     * Delete Azure AD user
     */
    async deleteLabUser(userPrincipalName: string): Promise<void> {
        console.log(`[ADManager] Deleting Azure AD user: ${userPrincipalName}`);

        try {
            await this.graphClient.api(`/users/${userPrincipalName}`).delete();
            console.log(`[ADManager] User deleted successfully`);
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log(`[ADManager] User not found (already deleted)`);
            } else {
                console.error(`[ADManager] Failed to delete user:`, error);
                throw new Error(`Failed to delete Azure AD user: ${error.message}`);
            }
        }
    }

    /**
     * Get user details
     */
    async getLabUser(userPrincipalName: string): Promise<any> {
        try {
            const user = await this.graphClient.api(`/users/${userPrincipalName}`).get();
            return user;
        } catch (error: any) {
            if (error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * List all lab users (for cleanup/monitoring)
     */
    async listLabUsers(): Promise<any[]> {
        try {
            const response = await this.graphClient
                .api('/users')
                .filter(`startswith(userPrincipalName, 'lab-user-')`)
                .select('id,userPrincipalName,displayName,createdDateTime,jobTitle,department')
                .get();

            return response.value || [];
        } catch (error: any) {
            console.error(`[ADManager] Failed to list users:`, error);
            return [];
        }
    }

    /**
     * Generate secure random password
     * Requirements: Min 8 chars, uppercase, lowercase, number, special char
     */
    private generateSecurePassword(): string {
        const length = 16;
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*';
        const all = uppercase + lowercase + numbers + special;

        let password = '';

        // Ensure at least one of each type
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += special.charAt(Math.floor(Math.random() * special.length));

        // Fill rest randomly
        for (let i = 4; i < length; i++) {
            password += all.charAt(Math.floor(Math.random() * all.length));
        }

        // Shuffle to randomize positions
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Cleanup orphaned lab users (older than 24 hours)
     */
    async cleanupOrphanedUsers(): Promise<number> {
        console.log(`[ADManager] Checking for orphaned lab users...`);

        try {
            const users = await this.listLabUsers();
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            let deletedCount = 0;

            for (const user of users) {
                const createdDate = new Date(user.createdDateTime);

                if (createdDate < oneDayAgo) {
                    console.log(`[ADManager] Deleting orphaned user: ${user.userPrincipalName} (created ${createdDate.toISOString()})`);
                    try {
                        await this.deleteLabUser(user.userPrincipalName);
                        deletedCount++;
                    } catch (error) {
                        console.error(`[ADManager] Failed to delete orphaned user ${user.userPrincipalName}:`, error);
                    }
                }
            }

            console.log(`[ADManager] Cleanup complete. Deleted ${deletedCount} orphaned users.`);
            return deletedCount;
        } catch (error) {
            console.error(`[ADManager] Cleanup failed:`, error);
            return 0;
        }
    }
}

// Export singleton instance
export const adManager = new AzureADManager();
