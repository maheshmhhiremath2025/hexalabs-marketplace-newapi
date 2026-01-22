const https = require('https');
const querystring = require('querystring');

const postData = querystring.stringify({
    code: '1000.7bc2152c23ae51437b25ba3578287164.535ef43ba56db935ea089e23899b1c2c',
    client_id: '1000.5PIAMTZQTJSQEECLY86RN4KXM4ANJC',
    client_secret: '958aa25c472ed21128e8bc08855aa46e8eb4d672eb',
    redirect_uri: 'https://hexalabs.online',
    grant_type: 'authorization_code'
});

const options = {
    hostname: 'accounts.zoho.in',
    port: 443,
    path: '/oauth/v2/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
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
            if (response.refresh_token) {
                console.log('\n✅ SUCCESS!');
                console.log('\nRefresh Token:', response.refresh_token);
                console.log('Access Token:', response.access_token);
                console.log('\nSave this refresh token - it never expires!');
            } else {
                console.log('\n❌ Error:', response);
            }
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.write(postData);
req.end();
