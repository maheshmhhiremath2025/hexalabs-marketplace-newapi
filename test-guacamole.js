// Test Guacamole API Connection
// Run this with: node test-guacamole.js

const GUACAMOLE_URL = 'http://20.193.146.110:8080/guacamole';
const USERNAME = 'guacadmin';
const PASSWORD = 'guacadmin';

async function testGuacamoleAPI() {
    console.log('🔍 Testing Guacamole API Connection...\n');
    console.log(`Server: ${GUACAMOLE_URL}`);
    console.log(`Username: ${USERNAME}\n`);

    try {
        // Test 1: Authenticate
        console.log('Test 1: Authenticating...');
        const authResponse = await fetch(`${GUACAMOLE_URL}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                username: USERNAME,
                password: PASSWORD
            })
        });

        console.log(`Status: ${authResponse.status} ${authResponse.statusText}`);

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            console.error('❌ Authentication failed!');
            console.error('Response:', errorText);
            console.error('\n💡 Possible issues:');
            console.error('   1. Wrong username/password (default: guacadmin/guacadmin)');
            console.error('   2. Guacamole not fully initialized');
            console.error('   3. Database connection issue');
            return;
        }

        const authData = await authResponse.json();
        console.log('✅ Authentication successful!');
        console.log(`Auth Token: ${authData.authToken.substring(0, 20)}...\n`);

        const token = authData.authToken;

        // Test 2: List existing connections
        console.log('Test 2: Listing connections...');
        const connectionsResponse = await fetch(`${GUACAMOLE_URL}/api/session/data/mysql/connections?token=${token}`);

        if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            console.log(`✅ Found ${Object.keys(connections).length} existing connections`);
            console.log('Connections:', Object.keys(connections));
        } else {
            console.log('⚠️  Could not list connections');
        }

        // Test 3: Create test RDP connection
        console.log('\nTest 3: Creating test RDP connection...');
        const testConnection = {
            parentIdentifier: 'ROOT',
            name: `Test-RDP-${Date.now()}`,
            protocol: 'rdp',
            parameters: {
                hostname: '20.17.200.104', // Your VM IP
                port: '3389',
                username: 'azureuser',
                password: 'P@ssw0rd1234!',
                'ignore-cert': 'true',
                security: 'any'
            },
            attributes: {
                'max-connections': '5',
                'max-connections-per-user': '1'
            }
        };

        const createResponse = await fetch(`${GUACAMOLE_URL}/api/session/data/mysql/connections?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testConnection)
        });

        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('✅ Test connection created successfully!');
            console.log(`Connection ID: ${result.identifier}`);
            console.log(`\n🎉 Guacamole API is working perfectly!`);
            console.log(`\n📋 Connection URL: ${GUACAMOLE_URL}/#/client/${result.identifier}`);
        } else {
            const errorText = await createResponse.text();
            console.error('❌ Failed to create connection');
            console.error('Response:', errorText);
        }

    } catch (error) {
        console.error('❌ Error testing Guacamole API:', error.message);
        console.error('\n💡 Possible issues:');
        console.error('   1. Guacamole server is not running');
        console.error('   2. Network/firewall blocking access');
        console.error('   3. CORS issues (if running from browser)');
    }
}

testGuacamoleAPI();
