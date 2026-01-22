const https = require('https');

const accessToken = '1000.555fde402492c7644440ca603c2c000c.3d97d265216f44a4f72758b2408d0a90';

const options = {
    hostname: 'www.zohoapis.in',
    port: 443,
    path: '/books/v3/organizations',
    method: 'GET',
    headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        try {
            const response = JSON.parse(data);
            if (response.organizations && response.organizations.length > 0) {
                console.log('\n✅ Organization Found!');
                console.log('\nOrganization ID:', response.organizations[0].organization_id);
                console.log('Organization Name:', response.organizations[0].name);
            } else {
                console.log('\n❌ No organizations found');
            }
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.end();
