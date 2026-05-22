#!/usr/bin/env node

require('dotenv').config();

const https = require('https');
const querystring = require('querystring');

const clientSecret = process.env.ONEBOX_CLIENT_SECRET;
const channelId = process.env.ONEBOX_CHANNEL_ID;
const apiEndpoint = process.env.ONEBOX_API_ENDPOINT;

if (!clientSecret || !channelId || !apiEndpoint) {
  console.error('❌ Error: Missing ONEBOX credentials in .env file');
  process.exit(1);
}

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
    console.log('🔐 Authenticating...\n');

    const authBody = querystring.stringify({
      grant_type: 'client_credentials',
      channel_id: channelId,
      client_id: 'seller-channel-client',
      client_secret: clientSecret
    });

    const authResponse = await makeRequest('POST', apiEndpoint, {
      'Content-Type': 'application/x-www-form-urlencoded'
    }, authBody);

    if (authResponse.statusCode !== 200 || !authResponse.data.access_token) {
      console.error('❌ Authentication failed');
      process.exit(1);
    }

    const accessToken = authResponse.data.access_token;
    const authHeader = { 'Authorization': `Bearer ${accessToken}` };

    console.log('✅ Authenticated\n');
    console.log('📋 Fetching all available matches...\n');

    const sessionsUrl = apiEndpoint.replace('/oauth/token', '') + '/catalog-api/v1/sessions';
    const sessionsResponse = await makeRequest('GET', sessionsUrl, authHeader);

    if (sessionsResponse.statusCode === 200) {
      const sessions = sessionsResponse.data.data || [];
      const total = sessionsResponse.data.metadata?.total || sessions.length;

      console.log(`✅ Success!\n`);
      console.log(`📊 Total matches available: ${total}`);
      console.log(`📥 Returned in this response: ${sessions.length}\n`);

      if (sessions.length > 0) {
        console.log('🎯 First match:');
        const firstMatch = sessions[0];
        console.log(`   Name: ${firstMatch.name}`);
        if (firstMatch.event?.name) console.log(`   Event: ${firstMatch.event.name}`);
        if (firstMatch.venue?.name) console.log(`   Venue: ${firstMatch.venue.name}`);
        if (firstMatch.date?.start) console.log(`   Date: ${firstMatch.date.start}`);
        console.log(`   ID: ${firstMatch.id}`);

        if (sessions.length > 1) {
          console.log(`\n📑 All ${sessions.length} matches:`);
          sessions.forEach((match, index) => {
            console.log(`   ${index + 1}. ${match.name}${match.event?.name ? ` (${match.event.name})` : ''}`);
          });
        }
      }
    } else {
      console.error(`❌ Failed to fetch matches (Status: ${sessionsResponse.statusCode})`);
      console.error('Response:', JSON.stringify(sessionsResponse.data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
