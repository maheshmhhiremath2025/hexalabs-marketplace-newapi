// Guacamole REST API Client
// Manages dynamic RDP connections to lab VMs

interface GuacamoleConnection {
    identifier: string;
    name: string;
    protocol: string;
    parameters: {
        hostname: string;
        port: string;
        username: string;
        password: string;
        'ignore-cert': string;
        security: string;
    };
}

export class GuacamoleClient {
    private baseUrl: string;
    private username: string;
    private password: string;
    private authToken: string | null = null;

    constructor() {
        this.baseUrl = process.env.GUACAMOLE_URL || 'http://20.193.146.110:8080/guacamole';
        this.username = process.env.GUACAMOLE_USERNAME || 'guacadmin';
        this.password = process.env.GUACAMOLE_PASSWORD || 'guacadmin';
    }

    // Authenticate and get token
    private async authenticate(): Promise<string> {
        if (this.authToken) return this.authToken;

        const response = await fetch(`${this.baseUrl}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: this.username,
                password: this.password
            })
        });

        if (!response.ok) {
            throw new Error('Guacamole authentication failed');
        }

        const data = await response.json();
        this.authToken = data.authToken;
        if (!this.authToken) {
            throw new Error('No auth token received from Guacamole');
        }
        return this.authToken;
    }

    // Create RDP connection for a lab VM
    async createConnection(vmPublicIP: string, labId: string): Promise<string> {
        const token = await this.authenticate();

        const connection = {
            parentIdentifier: 'ROOT',
            name: `Lab-${labId}-${Date.now()}`, // Add timestamp for uniqueness
            protocol: 'rdp',
            parameters: {
                hostname: vmPublicIP,
                port: '3389',
                username: 'azureuser',
                password: 'P@ssw0rd1234!',
                'ignore-cert': 'true',
                security: 'any',
                'enable-drive': 'true',
                'create-drive-path': 'true'
            },
            attributes: {
                'max-connections': '5',
                'max-connections-per-user': '1'
            }
        };

        const response = await fetch(`${this.baseUrl}/api/session/data/mysql/connections?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(connection)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Guacamole] Connection creation failed:', error);
            throw new Error('Failed to create Guacamole connection');
        }

        const result = await response.json();
        console.log(`[Guacamole] Created connection: ${result.identifier} for ${vmPublicIP}`);
        return result.identifier;
    }

    // Create a Guacamole user for the lab session
    async createUser(username: string, password: string): Promise<void> {
        const token = await this.authenticate();

        const user = {
            username: username,
            password: password,
            attributes: {
                disabled: '',
                expired: '',
                'access-window-start': '',
                'access-window-end': '',
                'valid-from': '',
                'valid-until': '',
                timezone: null
            }
        };

        const response = await fetch(`${this.baseUrl}/api/session/data/mysql/users?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Guacamole] User creation failed:', error);
            throw new Error('Failed to create Guacamole user');
        }

        console.log(`[Guacamole] Created user: ${username}`);
    }

    // Assign connection to user
    async assignConnectionToUser(username: string, connectionId: string): Promise<void> {
        const token = await this.authenticate();

        const response = await fetch(`${this.baseUrl}/api/session/data/mysql/users/${username}/permissions?token=${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{
                op: 'add',
                path: `/connectionPermissions/${connectionId}`,
                value: 'READ'
            }])
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Guacamole] Connection assignment failed:', error);
            throw new Error('Failed to assign connection to user');
        }

        console.log(`[Guacamole] Assigned connection ${connectionId} to user ${username}`);
    }

    // Create complete lab session (user + connection + assignment)
    async createLabSession(vmPublicIP: string, labId: string, userId: string): Promise<{ connectionId: string; username: string; password: string; authToken: string }> {
        // Create unique username per lab session (not per user)
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 6);
        const username = `lab-${timestamp}-${random}`;
        const password = Math.random().toString(36).substring(2, 15);

        // Create user
        await this.createUser(username, password);

        // Create connection
        const connectionId = await this.createConnection(vmPublicIP, labId);

        // Assign connection to user
        await this.assignConnectionToUser(username, connectionId);

        // Generate auth token for this user
        const authToken = await this.generateUserToken(username, password);

        return { connectionId, username, password, authToken };
    }

    // Generate authentication token for a specific user
    private async generateUserToken(username: string, password: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate token for user ${username}`);
        }

        const data = await response.json();
        if (!data.authToken) {
            throw new Error('No auth token received from Guacamole');
        }

        return data.authToken;
    }

    // Delete user (which also removes their connections)
    async deleteUser(username: string): Promise<void> {
        try {
            const token = await this.authenticate();

            const response = await fetch(`${this.baseUrl}/api/session/data/mysql/users/${username}?token=${token}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log(`[Guacamole] Deleted user: ${username}`);
            }
        } catch (error) {
            console.error('[Guacamole] Failed to delete user:', error);
        }
    }

    // Generate direct connection URL with auto-login
    getConnectionUrl(connectionId: string, username: string, password: string): string {
        return `${this.baseUrl}/#/client/${connectionId}?username=${username}&password=${password}`;
    }

    // Get connection details
    async getConnection(connectionId: string): Promise<GuacamoleConnection | null> {
        try {
            const token = await this.authenticate();

            const response = await fetch(`${this.baseUrl}/api/session/data/mysql/connections/${connectionId}?token=${token}`);

            if (!response.ok) return null;

            return await response.json();
        } catch (error) {
            console.error('[Guacamole] Failed to get connection:', error);
            return null;
        }
    }
}

// Singleton instance
export const guacamoleClient = new GuacamoleClient();
