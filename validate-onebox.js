#!/usr/bin/env node

require('dotenv').config();

const https = require('https');
const querystring = require('querystring');

const clientSecret = process.env.ONEBOX_CLIENT_SECRET;
const channelId = process.env.ONEBOX_CHANNEL_ID;
const apiEndpoint = process.env.ONEBOX_API_ENDPOINT;

if (!clientSecret || !channelId || !apiEndpoint) {
  console.error('❌ Error: Missing ONEBOX credentials in .env file');
  console.error('Required: ONEBOX_CLIENT_SECRET, ONEBOX_CHANNEL_ID, ONEBOX_API_ENDPOINT');
  process.exit(1);
}

console.log('🔐 ONEBOX API Validator\n');
console.log(`📍 Endpoint: ${apiEndpoint}`);
console.log(`🔑 Channel ID: ${channelId}`);
console.log(`🔒 Client Secret: ${clientSecret.substring(0, 8)}...${clientSecret.substring(-8)}\n`);
console.log('═'.repeat(60) + '\n');

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : apiEndpoint.replace('/oauth/token', '') + path);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data, parseError: true });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  try {
    // Step 1: Authenticate
    console.log('📋 Step 1: Authenticating with ONEBOX...\n');

    const authBody = querystring.stringify({
      grant_type: 'client_credentials',
      channel_id: channelId,
      client_id: 'seller-channel-client',
      client_secret: clientSecret
    });

    const authResponse = await makeRequest('POST', apiEndpoint, {
      'Content-Type': 'application/x-www-form-urlencoded'
    }, authBody);

    if (authResponse.statusCode === 200 && authResponse.data.access_token) {
      console.log('✅ Authentication Successful!');
      console.log(`📦 Token Type: ${authResponse.data.token_type}`);
      console.log(`⏱️  Expires In: ${authResponse.data.expires_in}s\n`);

      const accessToken = authResponse.data.access_token;
      const authHeader = { 'Authorization': `Bearer ${accessToken}` };

      // Step 2: Get Sessions
      console.log('═'.repeat(60));
      console.log('📋 Step 2: Fetching Sessions...\n');

      const sessionsUrl = apiEndpoint.replace('/oauth/token', '') + '/catalog-api/v1/sessions';
      const sessionsResponse = await makeRequest('GET', sessionsUrl, authHeader);

      if (sessionsResponse.statusCode === 200) {
        console.log('✅ Sessions Fetched Successfully!');
        const sessions = sessionsResponse.data.sessions || sessionsResponse.data || [];

        if (Array.isArray(sessions) && sessions.length > 0) {
          console.log(`📊 Total Sessions: ${sessions.length}\n`);
          console.log('Recent Sessions:');
          sessions.slice(0, 3).forEach((session, i) => {
            console.log(`  ${i + 1}. ${session.matchName || session.name} (ID: ${session.id || session.sessionId})`);
            if (session.date) console.log(`     📅 ${session.date}`);
            if (session.time) console.log(`     🕐 ${session.time}`);
          });
          console.log(`\n   ... and ${sessions.length - 3} more\n`);

          // Step 3: Get Availability for first session
          if (sessions[0]) {
            console.log('═'.repeat(60));
            console.log(`📋 Step 3: Fetching Availability for "${sessions[0].matchName || sessions[0].name}"...\n`);

            const sessionId = sessions[0].id || sessions[0].sessionId;
            const availUrl = apiEndpoint.replace('/oauth/token', '') + `/catalog-api/v1/sessions/${sessionId}/availability`;
            const availResponse = await makeRequest('GET', availUrl, authHeader);

            if (availResponse.statusCode === 200) {
              console.log('✅ Availability Data Fetched Successfully!');
              console.log('\n📦 Availability Response:');
              console.log(JSON.stringify(availResponse.data, null, 2).substring(0, 1000));
              if (JSON.stringify(availResponse.data).length > 1000) {
                console.log('   ... (truncated)');
              }
            } else {
              console.error(`⚠️  Status: ${availResponse.statusCode}`);
              console.log('Response:', JSON.stringify(availResponse.data, null, 2));
            }
          }
        } else {
          console.log('ℹ️  No sessions found or unexpected format');
          console.log('📦 Response:', JSON.stringify(sessionsResponse.data, null, 2));
        }
      } else {
        console.error(`❌ Failed to fetch sessions (Status: ${sessionsResponse.statusCode})`);
        console.log('Response:', JSON.stringify(sessionsResponse.data, null, 2));
      }

      console.log('\n' + '═'.repeat(60));
      console.log('✅ All API endpoints validated successfully!');
    } else {
      console.error('❌ Authentication Failed\n');
      console.error('API Error Response:');
      console.error(JSON.stringify(authResponse.data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
