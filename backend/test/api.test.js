const assert = require('assert');
const { app, startServer } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const seedData = require('../seeder');

// Minimal in-node HTTP requester for self-contained testing
const http = require('http');

let serverInstance;
const TEST_PORT = 5099;

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Initializing Database & Seeder for Integration Tests...');
  await connectDB();
  await seedData();

  serverInstance = app.listen(TEST_PORT, () => {
    console.log(`🧪 Test server started on port ${TEST_PORT}`);
  });

  try {
    // 1. Health check
    console.log('Testing 1: GET /api/health');
    const health = await makeRequest('GET', '/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'online');
    console.log('  ✅ Health check passed');

    // 2. Auth - Admin Login
    console.log('Testing 2: POST /api/auth/login (Admin)');
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@swachhta.gov.in',
      password: 'Admin@123',
    });
    assert.strictEqual(adminLogin.status, 200);
    assert.strictEqual(adminLogin.data.user.role, 'ADMIN');
    const adminToken = adminLogin.data.token;
    console.log('  ✅ Admin login passed, token received');

    // 3. Auth - Inspector Login
    console.log('Testing 3: POST /api/auth/login (Inspector)');
    const inspLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'inspector@swachhta.gov.in',
      password: 'Inspector@123',
    });
    assert.strictEqual(inspLogin.status, 200);
    assert.strictEqual(inspLogin.data.user.role, 'INSPECTOR');
    const inspectorToken = inspLogin.data.token;
    console.log('  ✅ Inspector login passed');

    // 4. Buildings API
    console.log('Testing 4: GET /api/buildings');
    const buildingsRes = await makeRequest('GET', '/api/buildings', null, adminToken);
    assert.strictEqual(buildingsRes.status, 200);
    assert.ok(buildingsRes.data.data.length >= 5);
    const targetBuilding = buildingsRes.data.data[0];
    console.log(`  ✅ Retrieved ${buildingsRes.data.data.length} buildings`);

    // 5. Criteria API
    console.log('Testing 5: GET /api/criteria');
    const criteriaRes = await makeRequest('GET', '/api/criteria', null, inspectorToken);
    assert.strictEqual(criteriaRes.status, 200);
    assert.ok(criteriaRes.data.data.length >= 20);
    console.log(`  ✅ Retrieved ${criteriaRes.data.data.length} criteria parameters`);

    // 6. Inspection Execution & Dynamic Score Engine
    console.log('Testing 6: POST /api/inspections (Execute facility audit)');
    const sampleItems = criteriaRes.data.data.slice(0, 5).map((c, i) => ({
      criteriaId: c._id,
      criteriaTitle: c.title,
      category: c.category,
      weight: c.weight,
      status: i === 0 ? 'FAIL' : i === 1 ? 'PARTIAL' : 'PASS',
      remarks: i === 0 ? 'Urgent valve leak' : 'Standard compliance verified',
      photoUrl: '',
    }));

    const inspectionRes = await makeRequest(
      'POST',
      '/api/inspections',
      {
        buildingId: targetBuilding._id,
        zoneName: 'Ground Floor Labs',
        generalNotes: 'Integration test audit execution',
        items: sampleItems,
      },
      inspectorToken
    );

    assert.strictEqual(inspectionRes.status, 201);
    assert.ok(inspectionRes.data.data.totalScore > 0);
    assert.strictEqual(inspectionRes.data.autoIssuesCreated, 1);
    const createdAuditId = inspectionRes.data.data._id;
    console.log(
      `  ✅ Inspection executed: Score=${inspectionRes.data.data.totalScore}% (${inspectionRes.data.data.ratingLabel}), Auto-created ${inspectionRes.data.autoIssuesCreated} issue`
    );

    // 7. Issue Workflow
    console.log('Testing 7: PATCH /api/issues/:id/status (Workflow transitions)');
    const issuesRes = await makeRequest('GET', `/api/issues?building=${targetBuilding._id}`, null, adminToken);
    assert.strictEqual(issuesRes.status, 200);
    const targetIssue = issuesRes.data.data[0];
    assert.ok(targetIssue);

    const updateStatusRes = await makeRequest(
      'PATCH',
      `/api/issues/${targetIssue._id}/status`,
      {
        status: 'IN_PROGRESS',
        note: 'Technician dispatched for plumbing repair.',
        assignedToName: 'Quick Response Team',
      },
      adminToken
    );
    assert.strictEqual(updateStatusRes.status, 200);
    assert.strictEqual(updateStatusRes.data.data.status, 'IN_PROGRESS');
    console.log('  ✅ Issue transitioned to IN_PROGRESS');

    const resolveIssueRes = await makeRequest(
      'PATCH',
      `/api/issues/${targetIssue._id}/resolve`,
      {
        resolutionRemarks: 'Defective valve replaced with brass certified unit.',
        note: 'Repaired and leak test passed.',
      },
      adminToken
    );
    assert.strictEqual(resolveIssueRes.status, 200);
    assert.strictEqual(resolveIssueRes.data.data.status, 'RESOLVED');
    console.log('  ✅ Issue marked as RESOLVED');

    // 8. Analytics Overview & Comparison
    console.log('Testing 8: GET /api/analytics/overview & /api/analytics/building-comparison');
    const overviewRes = await makeRequest('GET', '/api/analytics/overview', null, adminToken);
    assert.strictEqual(overviewRes.status, 200);
    assert.ok(overviewRes.data.data.averageComplianceScore > 0);

    const rankingRes = await makeRequest('GET', '/api/analytics/building-comparison', null, adminToken);
    assert.strictEqual(rankingRes.status, 200);
    assert.ok(rankingRes.data.data.length > 0);
    console.log('  ✅ Analytics queries returned aggregated metrics');

    console.log('====================================================');
    console.log('🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  } finally {
    if (serverInstance) serverInstance.close();
    await disconnectDB();
    process.exit(0);
  }
}

runTests();
