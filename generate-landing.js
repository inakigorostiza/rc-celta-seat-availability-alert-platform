#!/usr/bin/env node

require('dotenv').config();

const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const clientSecret = process.env.ONEBOX_CLIENT_SECRET;
const channelId = process.env.ONEBOX_CHANNEL_ID;
const apiEndpoint = process.env.ONEBOX_API_ENDPOINT;

const SESSION_ID = 240895;
const LANDING_FILE = path.join(__dirname, 'landing.html');

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
    console.log(`🔐 Generating landing.html for session ${SESSION_ID}\n`);

    // Step 1: Authenticate
    console.log('1️⃣  Authenticating with ONEBOX...');
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
    console.log('   ✅ Authenticated\n');

    // Step 2: Get availability data
    console.log(`2️⃣  Fetching availability for session ${SESSION_ID}...`);
    const authHeader = { 'Authorization': `Bearer ${accessToken}` };
    const availUrl = apiEndpoint.replace('/oauth/token', '') + `/catalog-api/v1/sessions/${SESSION_ID}/availability`;
    const availResponse = await makeRequest('GET', availUrl, authHeader);

    if (availResponse.statusCode !== 200) {
      console.error(`❌ Failed to fetch availability (Status: ${availResponse.statusCode})`);
      process.exit(1);
    }

    const sectors = availResponse.data.sectors || [];
    if (sectors.length === 0) {
      console.error('❌ No sectors found in availability response');
      process.exit(1);
    }

    console.log(`   ✅ Found ${sectors.length} sectors\n`);

    // Step 3: Generate option elements
    console.log('3️⃣  Generating option elements...');
    let optionsHtml = '            <option value="">Selecciona tu grada</option>\n';

    sectors.forEach(sector => {
      const sectorId = sector.id || '';
      const sectorName = sector.name || '';
      optionsHtml += `            <option value="${sectorId}">${sectorName}</option>\n`;
    });

    console.log(`   ✅ Generated ${sectors.length} options\n`);

    // Step 4: Read landing.html
    console.log('4️⃣  Reading landing.html...');
    if (!fs.existsSync(LANDING_FILE)) {
      console.error(`❌ File not found: ${LANDING_FILE}`);
      process.exit(1);
    }

    let html = fs.readFileSync(LANDING_FILE, 'utf-8');
    console.log('   ✅ File read\n');

    // Step 5: Replace the select options
    console.log('5️⃣  Updating grada dropdown...');

    // Find and replace the entire select element's content
    const selectPattern = /<select\s+id="grada"\s+name="grada"\s+required>([\s\S]*?)<\/select>/;
    const selectMatch = html.match(selectPattern);

    if (!selectMatch) {
      console.error('❌ Could not find <select id="grada"> in landing.html');
      process.exit(1);
    }

    const oldSelect = selectMatch[0];
    const newSelect = `<select id="grada" name="grada" required>\n${optionsHtml}        </select>`;

    html = html.replace(oldSelect, newSelect);

    console.log('   ✅ Dropdown updated\n');

    // Step 6: Write back to landing.html
    console.log('6️⃣  Writing updated landing.html...');
    fs.writeFileSync(LANDING_FILE, html, 'utf-8');
    console.log('   ✅ File written\n');

    // Summary
    console.log('═'.repeat(60));
    console.log(`✅ SUCCESS: landing.html updated with ${sectors.length} real gradas`);
    console.log('═'.repeat(60));
    console.log('\n📋 Sectors baked in:');
    sectors.forEach((sector, i) => {
      console.log(`   ${i + 1}. ${sector.name} (ID: ${sector.id})`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
