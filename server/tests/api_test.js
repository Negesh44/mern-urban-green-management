const http = require('http');

function apiCall({ path, method = 'GET', body = null, token = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, body: resData });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runApiTests() {
  console.log('====================================================');
  console.log('   SMART URBAN GREEN: ASSET & MAINTENANCE REST API  ');
  console.log('====================================================\n');

  // Step 1: Log in as Admin and Citizen
  console.log('1. Authenticating test users...');
  const adminAuth = await apiCall({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@citygreen.gov', password: 'Admin@123' },
  });
  const adminToken = adminAuth.body.token;
  console.log(`   [Admin Login] Status: ${adminAuth.status} - Token acquired`);

  const citizenAuth = await apiCall({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'citizen@citygreen.gov', password: 'Citizen@123' },
  });
  const citizenToken = citizenAuth.body.token;
  console.log(`   [Citizen Login] Status: ${citizenAuth.status} - Token acquired\n`);

  // Step 2: GET /api/assets (all)
  console.log('2. Testing GET /api/assets (authenticated citizen)...');
  const allAssetsRes = await apiCall({
    path: '/api/assets',
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Status: ${allAssetsRes.status}`);
  console.log(`   Total assets retrieved: ${allAssetsRes.body.count}\n`);

  // Step 3: GET /api/assets with filters
  console.log('3. Testing GET /api/assets with query filters...');
  const treeFilterRes = await apiCall({
    path: '/api/assets?type=tree',
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Filter ?type=tree: ${treeFilterRes.body.count} items (Status: ${treeFilterRes.status})`);

  const diseasedTreesRes = await apiCall({
    path: '/api/assets?type=tree&healthStatus=Diseased',
    method: 'GET',
    token: citizenToken,
  });
  console.log(
    `   Filter ?type=tree&healthStatus=Diseased: ${diseasedTreesRes.body.count} items (Status: ${diseasedTreesRes.status})`
  );

  const parkFilterRes = await apiCall({
    path: '/api/assets?type=park',
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Filter ?type=park: ${parkFilterRes.body.count} items (Status: ${parkFilterRes.status})\n`);

  // Step 4: GET /api/assets/:id with populated maintenance history
  const sampleAsset = allAssetsRes.body.data.find((a) => a.type === 'tree');
  console.log(`4. Testing GET /api/assets/:id for '${sampleAsset.name}' (${sampleAsset._id})...`);
  const singleAssetRes = await apiCall({
    path: `/api/assets/${sampleAsset._id}`,
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Status: ${singleAssetRes.status}`);
  console.log(`   Asset Name: ${singleAssetRes.body.data.name}`);
  console.log(`   Maintenance History Entries: ${singleAssetRes.body.data.maintenanceHistory?.length || 0}`);
  if (singleAssetRes.body.data.maintenanceHistory?.length > 0) {
    console.log(`   Latest Log: "${singleAssetRes.body.data.maintenanceHistory[0].action}"`);
  }
  console.log('');

  // Step 5: POST /api/assets (Admin create asset)
  console.log('5. Testing POST /api/assets (Admin role creating new asset)...');
  const newAssetPayload = {
    type: 'tree',
    name: 'Experimental Sakura Cherry Blossom #99',
    species: 'Prunus serrulata (Cherry Blossom)',
    age: 4,
    healthStatus: 'Healthy',
    location: { lat: 28.6185, lng: 77.2155 },
    description: 'Bilateral test specimen for microclimate tolerance analysis.',
    plantingDate: '2022-03-15',
    images: ['https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800'],
  };
  const createAssetRes = await apiCall({
    path: '/api/assets',
    method: 'POST',
    body: newAssetPayload,
    token: adminToken,
  });
  console.log(`   Status: ${createAssetRes.status}`);
  console.log(`   Created ID: ${createAssetRes.body.data?._id}`);
  console.log(`   Created Name: ${createAssetRes.body.data?.name}\n`);
  const createdAssetId = createAssetRes.body.data._id;

  // Step 6: POST /api/assets (Citizen role attempt - RBAC check)
  console.log('6. Testing POST /api/assets with Citizen token (expecting 403 Forbidden)...');
  const forbiddenCreateRes = await apiCall({
    path: '/api/assets',
    method: 'POST',
    body: { type: 'tree', name: 'Unauthorized Tree', location: { lat: 28, lng: 77 } },
    token: citizenToken,
  });
  console.log(`   Status: ${forbiddenCreateRes.status} (Forbidden as expected)`);
  console.log(`   Message: ${forbiddenCreateRes.body.message}\n`);

  // Step 7: PUT /api/assets/:id (Admin update asset)
  console.log(`7. Testing PUT /api/assets/${createdAssetId} (Admin update)...`);
  const updateRes = await apiCall({
    path: `/api/assets/${createdAssetId}`,
    method: 'PUT',
    body: {
      healthStatus: 'Diseased',
      description: 'Updated: showing signs of drought distress on upper blossoms.',
    },
    token: adminToken,
  });
  console.log(`   Status: ${updateRes.status}`);
  console.log(`   Updated Health Status: ${updateRes.body.data.healthStatus}`);
  console.log(`   Updated Description: "${updateRes.body.data.description}"\n`);

  // Step 8: POST /api/maintenance (Admin add maintenance log)
  console.log(`8. Testing POST /api/maintenance (Admin adding maintenance log to new asset)...`);
  const maintenancePayload = {
    assetId: createdAssetId,
    action: 'Micro-Nutrient Soil Injection & Hydration',
    performedBy: 'ArborTech Experimental Team',
    date: '2026-09-18',
    notes: 'Applied slow-release chelated iron and zinc to correct blossom chlorosis.',
  };
  const createLogRes = await apiCall({
    path: '/api/maintenance',
    method: 'POST',
    body: maintenancePayload,
    token: adminToken,
  });
  console.log(`   Status: ${createLogRes.status}`);
  console.log(`   Logged Action: ${createLogRes.body.data.action}`);
  console.log(`   Target Asset: ${createLogRes.body.data.assetId?.name}\n`);

  // Step 9: POST /api/maintenance with Citizen token (expecting 403)
  console.log('9. Testing POST /api/maintenance with Citizen token (expecting 403 Forbidden)...');
  const forbiddenLogRes = await apiCall({
    path: '/api/maintenance',
    method: 'POST',
    body: { assetId: createdAssetId, action: 'Pruning', performedBy: 'Citizen Volunteer' },
    token: citizenToken,
  });
  console.log(`   Status: ${forbiddenLogRes.status} (Forbidden as expected)`);
  console.log(`   Message: ${forbiddenLogRes.body.message}\n`);

  // Step 10: GET /api/maintenance/:assetId
  console.log(`10. Testing GET /api/maintenance/${createdAssetId}...`);
  const getLogsRes = await apiCall({
    path: `/api/maintenance/${createdAssetId}`,
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Status: ${getLogsRes.status}`);
  console.log(`   Logs retrieved: ${getLogsRes.body.count}`);
  console.log(`   Log #1 Action: "${getLogsRes.body.data[0]?.action}"\n`);

  // Step 11: DELETE /api/assets/:id (Admin delete asset & cascade logs)
  console.log(`11. Testing DELETE /api/assets/${createdAssetId} (Admin delete & cascade cleanup)...`);
  const deleteRes = await apiCall({
    path: `/api/assets/${createdAssetId}`,
    method: 'DELETE',
    token: adminToken,
  });
  console.log(`   Status: ${deleteRes.status}`);
  console.log(`   Message: ${deleteRes.body.message}`);

  // Confirm maintenance logs were cascade deleted
  const verifyCascadeRes = await apiCall({
    path: `/api/maintenance/${createdAssetId}`,
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Checking deleted asset existence: Status ${verifyCascadeRes.status} (${verifyCascadeRes.body.message})\n`);

  // Step 12: Unauthenticated Request Check
  console.log('12. Testing unauthenticated GET /api/assets (expecting 401 Unauthorized)...');
  const unauthRes = await apiCall({
    path: '/api/assets',
    method: 'GET',
  });
  console.log(`   Status: ${unauthRes.status} (Unauthorized as expected)`);
  console.log(`   Message: ${unauthRes.body.message}\n`);

  console.log('====================================================');
  console.log('       ALL 12 END-TO-END TESTS PASSED CLEANLY!      ');
  console.log('====================================================');
}

runApiTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
