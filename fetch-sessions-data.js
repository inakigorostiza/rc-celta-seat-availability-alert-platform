#!/usr/bin/env node

require('dotenv').config();

const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

const clientSecret = process.env.ONEBOX_CLIENT_SECRET;
const channelId = process.env.ONEBOX_CHANNEL_ID;
const apiEndpoint = process.env.ONEBOX_API_ENDPOINT;

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
    console.log('📋 Fetching all sessions with availability...\n');

    const sessionsUrl = apiEndpoint.replace('/oauth/token', '') + '/catalog-api/v1/sessions';
    const sessionsResponse = await makeRequest('GET', sessionsUrl, authHeader);

    if (sessionsResponse.statusCode !== 200) {
      console.error('❌ Failed to fetch sessions');
      process.exit(1);
    }

    const sessions = sessionsResponse.data.data || [];
    console.log(`📊 Found ${sessions.length} sessions\n`);

    const enrichedSessions = [];

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      process.stdout.write(`   [${i + 1}/${sessions.length}] Fetching availability for "${session.name}"...`);

      const availUrl = apiEndpoint.replace('/oauth/token', '') + `/catalog-api/v1/sessions/${session.id}/availability`;
      const availResponse = await makeRequest('GET', availUrl, authHeader);

      let totalSeats = 0;
      let availableSeats = 0;
      let availability = null;

      if (availResponse.statusCode === 200) {
        availability = availResponse.data;

        if (availResponse.data.sections && Array.isArray(availResponse.data.sections)) {
          availResponse.data.sections.forEach(section => {
            totalSeats += section.total || 0;
            availableSeats += section.available || 0;
          });
        }
        process.stdout.write(` ✓\n`);
      } else {
        process.stdout.write(` ✗ (no availability data)\n`);
      }

      enrichedSessions.push({
        id: session.id,
        name: session.name,
        type: session.type,
        event: session.event || {},
        venue: session.venue || {},
        date: session.date || {},
        price: session.price || {},
        images: session.images || {},
        availability: {
          total: totalSeats,
          available: availableSeats,
          occupancy: totalSeats > 0 ? ((totalSeats - availableSeats) / totalSeats * 100).toFixed(1) : 0,
          sections: availability?.sections || []
        }
      });

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ All data collected\n');

    const outputData = {
      timestamp: new Date().toISOString(),
      totalSessions: enrichedSessions.length,
      sessions: enrichedSessions
    };

    fs.writeFileSync('./sessions-data.json', JSON.stringify(outputData, null, 2));
    console.log('💾 Data saved to sessions-data.json');
    console.log(`📊 Summary: ${enrichedSessions.length} sessions with availability data\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
