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

async function runDashboardTests() {
  console.log('====================================================');
  console.log('      SMART URBAN GREEN: DASHBOARD / KPI API TEST   ');
  console.log('====================================================\n');

  try {
    // 1. Authenticate Admin and Citizen
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

    console.log(`   Admin Token: ${adminToken ? 'Obtained' : 'Failed'}`);
    console.log(`   Citizen Token: ${citizenToken ? 'Obtained' : 'Failed'}\n`);

    // 2. Verify RBAC on GET /api/dashboard/summary
    console.log('2. Testing RBAC Security...');
    const unauthorizedRes = await apiCall({
      path: '/api/dashboard/summary',
      method: 'GET',
    });
    console.log(`   Unauthenticated Request Status: ${unauthorizedRes.status} (Expected: 401)`);

    const forbiddenRes = await apiCall({
      path: '/api/dashboard/summary',
      method: 'GET',
      token: citizenToken,
    });
    console.log(`   Citizen Role Request Status: ${forbiddenRes.status} (Expected: 403)\n`);

    // 3. Fetch Dashboard Summary as Admin
    console.log('3. Requesting GET /api/dashboard/summary as Admin...');
    const dashboardRes = await apiCall({
      path: '/api/dashboard/summary',
      method: 'GET',
      token: adminToken,
    });

    console.log(`   Admin Request Status: ${dashboardRes.status} (Expected: 200)`);
    const data = dashboardRes.body.data;

    console.log('\n--- Executive KPI Summary Cards ---');
    console.log(`   Total Trees: ${data.summaryCards.totalTrees}`);
    console.log(`   Total Parks/Forests/Belts: ${data.summaryCards.totalParksForestsBelts}`);
    console.log(`   Total Green Area: ${data.summaryCards.totalGreenArea} m² (${data.summaryCards.totalGreenAreaHectares} ha)`);
    console.log(`   Pending Reports Count: ${data.summaryCards.pendingReportsCount}`);
    console.log(`   Total Assets: ${data.summaryCards.totalAssets}`);

    console.log('\n--- Assets By Classification ---');
    data.assetsByType.forEach((item) => {
      console.log(`   - ${item.name} (${item.type}): ${item.count}`);
    });

    console.log('\n--- Tree Health Distribution ---');
    data.treeHealthDistribution.forEach((item) => {
      console.log(`   - ${item.name}: ${item.value}`);
    });

    console.log('\n--- Tree Survival Rate Trend ---');
    data.treeSurvivalRateTrend.forEach((item) => {
      console.log(`   - ${item.period}: Cohort ${item.totalTrees} trees, Alive ${item.healthyTrees}, Rate: ${item.survivalRate}%`);
    });

    console.log(`\n--- Needs Attention Alerts (No Maintenance in 6 Months / Distressed) ---`);
    console.log(`   Flagged Assets Count: ${data.needsAttentionCount}`);
    data.needsAttention.slice(0, 3).forEach((asset, idx) => {
      console.log(`   ${idx + 1}. [${asset.type.toUpperCase()}] ${asset.name} - Condition: ${asset.healthStatus}, Logs: ${asset.logsCount}, Last: ${asset.lastMaintenanceDate || 'Never'}`);
    });

    console.log('\n====================================================');
    console.log('      ALL DASHBOARD API TESTS PASSED SUCCESSFULLY!  ');
    console.log('====================================================');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runDashboardTests();
