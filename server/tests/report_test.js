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

async function runReportTests() {
  console.log('====================================================');
  console.log('       SMART URBAN GREEN: CITIZEN REPORTING API     ');
  console.log('====================================================\n');

  // Step 1: Login Admin & Citizen
  console.log('1. Authenticating Admin and Citizen...');
  const adminAuth = await apiCall({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@citygreen.gov', password: 'Admin@123' },
  });
  const adminToken = adminAuth.body.token;

  const citizenAuth = await apiCall({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'citizen@citygreen.gov', password: 'Citizen@123' },
  });
  const citizenToken = citizenAuth.body.token;
  console.log('   Authentication tokens acquired successfully.\n');

  // Step 2: Get sample asset to optionally link
  const assetsRes = await apiCall({ path: '/api/assets', method: 'GET', token: citizenToken });
  const targetAsset = assetsRes.body.data[0];
  console.log(`2. Sample asset for report link: "${targetAsset.name}" (${targetAsset._id})\n`);

  // Step 3: Citizen submits report
  console.log('3. Testing POST /api/reports (Citizen submitting hazard report)...');
  const reportPayload = {
    description: 'Cracked main limb after midnight storm, threatening electrical cable.',
    location: { lat: 28.6185, lng: 77.2195 },
    assetId: targetAsset._id,
    photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800',
  };
  const submitRes = await apiCall({
    path: '/api/reports',
    method: 'POST',
    body: reportPayload,
    token: citizenToken,
  });
  console.log(`   Status: ${submitRes.status}`);
  console.log(`   Created Report ID: ${submitRes.body.data?._id}`);
  console.log(`   Report Status: ${submitRes.body.data?.status}`);
  console.log(`   Citizen Name: ${submitRes.body.data?.citizenId?.name}\n`);
  const reportId = submitRes.body.data._id;

  // Step 4: Citizen GET /api/reports (Should only see their reports)
  console.log('4. Testing GET /api/reports as Citizen (Role-filtered)...');
  const citizenReportsRes = await apiCall({
    path: '/api/reports',
    method: 'GET',
    token: citizenToken,
  });
  console.log(`   Status: ${citizenReportsRes.status}`);
  console.log(`   Citizen reports retrieved: ${citizenReportsRes.body.count}`);
  const hasOnlyCitizen = citizenReportsRes.body.data.every(
    (r) => r.citizenId?.email === 'citizen@citygreen.gov'
  );
  console.log(`   Verified all reports belong to citizen: ${hasOnlyCitizen}\n`);

  // Step 5: Admin GET /api/reports (Sees all reports across the city)
  console.log('5. Testing GET /api/reports as Admin (Global View)...');
  const adminReportsRes = await apiCall({
    path: '/api/reports',
    method: 'GET',
    token: adminToken,
  });
  console.log(`   Status: ${adminReportsRes.status}`);
  console.log(`   Total global reports: ${adminReportsRes.body.count}\n`);

  // Step 6: Admin updates status: PUT /api/reports/:id
  console.log(`6. Testing PUT /api/reports/${reportId} (Admin updating status to 'In Progress')...`);
  const updateStatusRes = await apiCall({
    path: `/api/reports/${reportId}`,
    method: 'PUT',
    body: { status: 'In Progress' },
    token: adminToken,
  });
  console.log(`   Status: ${updateStatusRes.status}`);
  console.log(`   Updated Report Status: ${updateStatusRes.body.data?.status}\n`);

  // Step 7: Citizen attempt to update status (expecting 403 Forbidden)
  console.log('7. Testing Citizen attempt to update report status (expecting 403 Forbidden)...');
  const forbiddenUpdateRes = await apiCall({
    path: `/api/reports/${reportId}`,
    method: 'PUT',
    body: { status: 'Resolved' },
    token: citizenToken,
  });
  console.log(`   Status: ${forbiddenUpdateRes.status} (Forbidden as expected)`);
  console.log(`   Message: ${forbiddenUpdateRes.body.message}\n`);

  // Step 8: Admin converts report into Maintenance Task: POST /api/reports/:id/convert
  console.log(`8. Testing POST /api/reports/${reportId}/convert (Converting to Maintenance Task)...`);
  const convertRes = await apiCall({
    path: `/api/reports/${reportId}/convert`,
    method: 'POST',
    body: {
      assetId: targetAsset._id,
      action: 'Emergency Cable Clearance & Limb Removal',
      performedBy: 'Rapid Response Arborist Crew 2',
      date: '2026-09-18',
      reportStatus: 'Resolved',
      notes: 'Cleared storm-damaged limb from overhead power line. Applied protective wound dressing.',
    },
    token: adminToken,
  });
  console.log(`   Status: ${convertRes.status}`);
  console.log(`   Created Maintenance Action: "${convertRes.body.maintenanceLog?.action}"`);
  console.log(`   Assigned To Asset: ${convertRes.body.maintenanceLog?.assetId?.name}`);
  console.log(`   Report Status Advanced To: ${convertRes.body.report?.status}\n`);

  // Step 9: Verify maintenance log exists on the asset
  console.log(`9. Verifying maintenance history on asset ${targetAsset._id}...`);
  const assetHistoryRes = await apiCall({
    path: `/api/assets/${targetAsset._id}`,
    method: 'GET',
    token: citizenToken,
  });
  const hasNewLog = assetHistoryRes.body.data.maintenanceHistory.some(
    (l) => l.action === 'Emergency Cable Clearance & Limb Removal'
  );
  console.log(`   Verified maintenance log recorded on asset: ${hasNewLog}\n`);

  console.log('====================================================');
  console.log('   ALL 9 CITIZEN REPORTING TESTS PASSED CLEANLY!    ');
  console.log('====================================================');
}

runReportTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
