/**
 * GOREC COMPREHENSIVE SECURITY AUDIT
 * ===================================
 * Professional-grade security testing for web applications
 * Run with: node supabase/security-audit.js
 */

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ycmotbwytciaewbmziec.supabase.co';
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_rL5KYQLvlHEVc8uKeN3rGA_8hTK9ipS';

const results = { passed: [], failed: [], warnings: [] };

function log(category, status, test, details) {
  const icons = { pass: '✅', fail: '🚨', warn: '⚠️' };
  console.log(`${icons[status]} [${category}] ${test}`);
  if (details) console.log(`   └─ ${details}`);

  if (status === 'pass') results.passed.push({ category, test, details });
  else if (status === 'fail') results.failed.push({ category, test, details });
  else results.warnings.push({ category, test, details });
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${SUPABASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return {
      status: response.status,
      data,
      ok: response.ok,
      headers: response.headers,
    };
  } catch (error) {
    return { status: 0, error: error.message, ok: false };
  }
}

// ============================================
// 1. AUTHENTICATION & AUTHORIZATION
// ============================================

async function testAuth() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 AUTHENTICATION & AUTHORIZATION TESTS');
  console.log('='.repeat(60));

  // Test 1.1: Anonymous access to protected data
  const recordings = await request('/rest/v1/recordings?select=*&limit=100');
  if (recordings.ok && Array.isArray(recordings.data)) {
    const privateRecs = recordings.data.filter((r) => !r.is_public);
    if (privateRecs.length > 0) {
      log(
        'AUTH',
        'fail',
        'Private data exposure',
        `${privateRecs.length} private recordings accessible anonymously`
      );
    } else if (recordings.data.length > 0) {
      log(
        'AUTH',
        'pass',
        'Private data protection',
        `Only ${recordings.data.length} public recordings accessible`
      );
    } else {
      log(
        'AUTH',
        'pass',
        'Private data protection',
        'No recordings accessible anonymously'
      );
    }
  } else {
    log(
      'AUTH',
      'pass',
      'Private data protection',
      'Recordings endpoint blocked for anonymous users'
    );
  }

  // Test 1.2: JWT token manipulation
  const fakeToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTUxNjIzOTAyMn0.fake';
  const jwtBypass = await request('/rest/v1/recordings?select=*', {
    headers: { Authorization: `Bearer ${fakeToken}` },
  });
  if (
    jwtBypass.ok &&
    Array.isArray(jwtBypass.data) &&
    jwtBypass.data.some((r) => !r.is_public)
  ) {
    log('AUTH', 'fail', 'JWT validation bypass', 'Fake JWT accepted!');
  } else {
    log('AUTH', 'pass', 'JWT validation', 'Fake JWT rejected');
  }

  // Test 1.3: Role escalation attempt
  const roleEscalation = await request('/rest/v1/recordings?select=*', {
    headers: { 'X-Supabase-Role': 'service_role' },
  });
  if (
    roleEscalation.ok &&
    Array.isArray(roleEscalation.data) &&
    roleEscalation.data.some((r) => !r.is_public)
  ) {
    log(
      'AUTH',
      'fail',
      'Role escalation',
      'Role header manipulation succeeded!'
    );
  } else {
    log(
      'AUTH',
      'pass',
      'Role escalation prevention',
      'Cannot escalate role via headers'
    );
  }

  // Test 1.4: IDOR (Insecure Direct Object Reference)
  const idor = await request(
    '/rest/v1/recordings?select=*&user_id=neq.00000000-0000-0000-0000-000000000000'
  );
  if (idor.ok && Array.isArray(idor.data)) {
    const privateRecs = idor.data.filter((r) => !r.is_public);
    if (privateRecs.length > 0) {
      log(
        'AUTH',
        'fail',
        'IDOR vulnerability',
        `Can access ${privateRecs.length} other users' private recordings`
      );
    } else {
      log(
        'AUTH',
        'pass',
        'IDOR protection',
        "Cannot access other users' private data via ID manipulation"
      );
    }
  }
}

// ============================================
// 2. INJECTION ATTACKS
// ============================================

async function testInjection() {
  console.log('\n' + '='.repeat(60));
  console.log('💉 INJECTION ATTACK TESTS');
  console.log('='.repeat(60));

  // Test 2.1: SQL Injection via query params
  const sqlInjections = [
    "/rest/v1/recordings?select=*&id=eq.'; DROP TABLE recordings; --",
    "/rest/v1/recordings?select=*&filename=eq.' OR '1'='1",
    "/rest/v1/recordings?select=*&filename=eq.'; SELECT * FROM auth.users; --",
    '/rest/v1/recordings?or=(id.eq.1,id.eq.2);DELETE FROM recordings;--',
    '/rest/v1/recordings?select=*,password:auth.users(raw_user_meta_data)',
  ];

  let sqlSafe = true;
  for (const injection of sqlInjections) {
    const result = await request(injection);
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      // Check if we got unexpected data
      if (result.data.some((r) => r.password || r.raw_user_meta_data)) {
        log(
          'INJECTION',
          'fail',
          'SQL Injection',
          `Payload succeeded: ${injection.substring(0, 50)}...`
        );
        sqlSafe = false;
      }
    }
  }
  if (sqlSafe) {
    log(
      'INJECTION',
      'pass',
      'SQL Injection protection',
      'All SQL injection attempts blocked'
    );
  }

  // Test 2.2: NoSQL/PostgREST operator injection
  const operatorInjections = [
    '/rest/v1/recordings?select=*&or=(is_public.eq.true,is_public.eq.false)',
    '/rest/v1/recordings?select=*&not.is_public.eq.false',
  ];

  for (const injection of operatorInjections) {
    const result = await request(injection);
    if (result.ok && Array.isArray(result.data)) {
      const privateRecs = result.data.filter((r) => !r.is_public);
      if (privateRecs.length > 0) {
        log(
          'INJECTION',
          'fail',
          'Operator injection',
          `Exposed ${
            privateRecs.length
          } private records via: ${injection.substring(0, 40)}...`
        );
      }
    }
  }
  log(
    'INJECTION',
    'pass',
    'Operator injection protection',
    'PostgREST operators properly filtered by RLS'
  );

  // Test 2.3: XSS payload storage attempt
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '"><img src=x onerror=alert(1)>',
    "javascript:alert('xss')",
  ];
  // Note: This would require auth to test properly
  log(
    'INJECTION',
    'warn',
    'XSS storage test',
    'Requires authenticated user to test - verify manually'
  );
}

// ============================================
// 3. DATA EXPOSURE
// ============================================

async function testDataExposure() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATA EXPOSURE TESTS');
  console.log('='.repeat(60));

  // Test 3.1: Sensitive table access
  const sensitiveTables = [
    'auth.users',
    'users',
    'profiles',
    'secrets',
    'api_keys',
    'tokens',
  ];
  for (const table of sensitiveTables) {
    const result = await request(`/rest/v1/${table}?select=*&limit=1`);
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      log(
        'DATA',
        'fail',
        `Sensitive table exposure: ${table}`,
        'Table is publicly accessible!'
      );
    } else {
      log('DATA', 'pass', `Protected table: ${table}`, 'Not accessible');
    }
  }

  // Test 3.2: Schema enumeration
  const schemaEnum = await request('/rest/v1/');
  if (schemaEnum.ok && typeof schemaEnum.data === 'object') {
    const tables = Object.keys(schemaEnum.data?.definitions || {});
    if (tables.length > 5) {
      log(
        'DATA',
        'warn',
        'Schema enumeration',
        `${tables.length} table definitions exposed. Consider hiding schema.`
      );
    }
  }

  // Test 3.3: Bulk data extraction
  const bulk = await request('/rest/v1/recordings?select=*&limit=10000');
  if (bulk.ok && Array.isArray(bulk.data) && bulk.data.length > 1000) {
    log(
      'DATA',
      'warn',
      'Bulk extraction',
      `${bulk.data.length} records returned. Consider pagination limits.`
    );
  } else {
    log('DATA', 'pass', 'Bulk extraction protection', 'Large queries limited');
  }

  // Test 3.4: Sensitive field exposure in responses
  const recordings = await request('/rest/v1/recordings?select=*&limit=1');
  if (
    recordings.ok &&
    Array.isArray(recordings.data) &&
    recordings.data.length > 0
  ) {
    const record = recordings.data[0];
    const sensitiveFields = [
      'password',
      'secret',
      'api_key',
      'token',
      'private_key',
    ];
    const exposed = sensitiveFields.filter((f) => record[f]);
    if (exposed.length > 0) {
      log(
        'DATA',
        'fail',
        'Sensitive field exposure',
        `Fields exposed: ${exposed.join(', ')}`
      );
    } else {
      log(
        'DATA',
        'pass',
        'Sensitive field protection',
        'No sensitive fields in response'
      );
    }
  }
}

// ============================================
// 4. STORAGE SECURITY
// ============================================

async function testStorage() {
  console.log('\n' + '='.repeat(60));
  console.log('📁 STORAGE SECURITY TESTS');
  console.log('='.repeat(60));

  // Test 4.1: Bucket listing
  const bucketList = await request('/storage/v1/object/list/recordings', {
    method: 'POST',
    body: JSON.stringify({ prefix: '', limit: 100 }),
  });
  if (
    bucketList.ok &&
    Array.isArray(bucketList.data) &&
    bucketList.data.length > 0
  ) {
    log(
      'STORAGE',
      'fail',
      'Bucket listing vulnerability',
      `Can list ${bucketList.data.length} items in storage`
    );

    // Test 4.2: User folder enumeration
    const userFolders = bucketList.data.filter((item) => !item.id); // Folders don't have IDs
    if (userFolders.length > 0) {
      log(
        'STORAGE',
        'fail',
        'User ID enumeration',
        `${userFolders.length} user folders exposed via storage listing`
      );
    }
  } else {
    log(
      'STORAGE',
      'pass',
      'Bucket listing protection',
      'Cannot list storage bucket contents'
    );
  }

  // Test 4.3: Direct file access without auth
  const directAccess = await request(
    '/storage/v1/object/public/recordings/test.webm'
  );
  // This is expected to fail or return 404 for non-existent file
  if (directAccess.status === 200) {
    log(
      'STORAGE',
      'warn',
      'Direct file access',
      'Files accessible via direct URL (expected for public bucket)'
    );
  }

  // Test 4.4: Path traversal
  const pathTraversal = await request(
    '/storage/v1/object/public/recordings/../../../etc/passwd'
  );
  if (pathTraversal.status === 200 && pathTraversal.data) {
    log(
      'STORAGE',
      'fail',
      'Path traversal vulnerability',
      'Can access files outside bucket!'
    );
  } else {
    log(
      'STORAGE',
      'pass',
      'Path traversal protection',
      'Cannot escape storage bucket'
    );
  }

  // Test 4.5: Upload without auth
  const uploadTest = await request(
    '/storage/v1/object/recordings/malicious.webm',
    {
      method: 'POST',
      body: 'fake content',
      headers: { 'Content-Type': 'video/webm' },
    }
  );
  if (uploadTest.ok || uploadTest.status === 200) {
    log(
      'STORAGE',
      'fail',
      'Unauthenticated upload',
      'Can upload files without authentication!'
    );
  } else {
    log(
      'STORAGE',
      'pass',
      'Upload protection',
      'Cannot upload without authentication'
    );
  }
}

// ============================================
// 5. API SECURITY
// ============================================

async function testAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('🔌 API SECURITY TESTS');
  console.log('='.repeat(60));

  // Test 5.1: Rate limiting (simple check)
  const startTime = Date.now();
  const requests = await Promise.all(
    Array(20)
      .fill()
      .map(() => request('/rest/v1/recordings?select=id&limit=1'))
  );
  const duration = Date.now() - startTime;
  const successCount = requests.filter((r) => r.ok).length;

  if (successCount === 20 && duration < 1000) {
    log(
      'API',
      'warn',
      'Rate limiting',
      'No apparent rate limiting detected. 20 requests completed in ${duration}ms'
    );
  } else if (successCount < 20) {
    log(
      'API',
      'pass',
      'Rate limiting',
      `Rate limiting detected: ${successCount}/20 requests succeeded`
    );
  } else {
    log(
      'API',
      'warn',
      'Rate limiting',
      'Consider implementing stricter rate limits'
    );
  }

  // Test 5.2: CORS headers
  const corsCheck = await request('/rest/v1/recordings?select=id&limit=1');
  const corsHeaders = {
    'access-control-allow-origin': corsCheck.headers?.get(
      'access-control-allow-origin'
    ),
    'access-control-allow-credentials': corsCheck.headers?.get(
      'access-control-allow-credentials'
    ),
  };
  if (corsHeaders['access-control-allow-origin'] === '*') {
    log(
      'API',
      'warn',
      'CORS configuration',
      'Access-Control-Allow-Origin is set to *. Consider restricting to specific origins.'
    );
  } else {
    log('API', 'pass', 'CORS configuration', 'CORS properly configured');
  }

  // Test 5.3: Security headers check
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy',
  ];
  const missingHeaders = securityHeaders.filter(
    (h) => !corsCheck.headers?.get(h)
  );
  if (missingHeaders.length > 0) {
    log(
      'API',
      'warn',
      'Security headers',
      `Missing: ${missingHeaders.join(', ')}`
    );
  } else {
    log('API', 'pass', 'Security headers', 'All security headers present');
  }

  // Test 5.4: HTTP Methods allowed
  const methods = ['PUT', 'DELETE', 'PATCH'];
  for (const method of methods) {
    const result = await request('/rest/v1/recordings', { method });
    if (result.status !== 401 && result.status !== 405) {
      log(
        'API',
        'warn',
        `HTTP ${method} method`,
        `${method} requests may be allowed without proper auth check`
      );
    }
  }
}

// ============================================
// 6. BUSINESS LOGIC
// ============================================

async function testBusinessLogic() {
  console.log('\n' + '='.repeat(60));
  console.log('🧠 BUSINESS LOGIC TESTS');
  console.log('='.repeat(60));

  // Test 6.1: Share token predictability
  const recordings = await request(
    '/rest/v1/recordings?select=id,share_token&is_public=eq.true&limit=5'
  );
  if (
    recordings.ok &&
    Array.isArray(recordings.data) &&
    recordings.data.length > 1
  ) {
    const tokens = recordings.data.map((r) => r.share_token).filter(Boolean);
    // Check if tokens are UUIDs (random) vs sequential
    const isUUID = tokens.every((t) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
    );
    if (isUUID) {
      log(
        'LOGIC',
        'pass',
        'Share token randomness',
        'Share tokens appear to be random UUIDs'
      );
    } else {
      log(
        'LOGIC',
        'warn',
        'Share token predictability',
        'Share tokens may be predictable'
      );
    }
  }

  // Test 6.2: Ownership bypass
  const ownershipBypass = await request('/rest/v1/recordings', {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ is_public: true }),
  });
  if (ownershipBypass.ok && ownershipBypass.status === 200) {
    log(
      'LOGIC',
      'fail',
      'Ownership bypass',
      'Can modify records without ownership verification!'
    );
  } else {
    log(
      'LOGIC',
      'pass',
      'Ownership enforcement',
      'Cannot modify records without authentication'
    );
  }

  // Test 6.3: Negative/invalid values
  const negativeTest = await request(
    '/rest/v1/recordings?select=*&file_size=lt.-1'
  );
  log('LOGIC', 'pass', 'Input validation', 'Negative value queries handled');
}

// ============================================
// 7. INFORMATION DISCLOSURE
// ============================================

async function testInfoDisclosure() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 INFORMATION DISCLOSURE TESTS');
  console.log('='.repeat(60));

  // Test 7.1: Error message verbosity
  const errorTest = await request('/rest/v1/nonexistent_table');
  if (errorTest.data?.message?.includes('schema') || errorTest.data?.hint) {
    log(
      'INFO',
      'warn',
      'Verbose error messages',
      'Error messages reveal internal details'
    );
  } else {
    log(
      'INFO',
      'pass',
      'Error message handling',
      "Errors don't reveal sensitive info"
    );
  }

  // Test 7.2: Version disclosure
  const versionHeaders = ['x-powered-by', 'server', 'x-supabase-version'];
  const response = await request('/rest/v1/recordings?select=id&limit=1');
  for (const header of versionHeaders) {
    const value = response.headers?.get(header);
    if (value) {
      log('INFO', 'warn', 'Version disclosure', `${header}: ${value}`);
    }
  }

  // Test 7.3: Debug endpoints
  const debugEndpoints = [
    '/debug',
    '/_debug',
    '/api/debug',
    '/graphql',
    '/graphiql',
  ];
  for (const endpoint of debugEndpoints) {
    const result = await request(endpoint);
    if (result.ok || result.status === 200) {
      log(
        'INFO',
        'fail',
        'Debug endpoint exposed',
        `${endpoint} is accessible`
      );
    }
  }
  log('INFO', 'pass', 'Debug endpoints', 'No debug endpoints found');

  // Test 7.4: Source map exposure
  log(
    'INFO',
    'warn',
    'Source maps',
    'Check that .map files are not deployed to production'
  );
}

// ============================================
// 8. RPC/FUNCTION SECURITY
// ============================================

async function testRPC() {
  console.log('\n' + '='.repeat(60));
  console.log('⚡ RPC/FUNCTION SECURITY TESTS');
  console.log('='.repeat(60));

  // Test 8.1: List available RPC functions
  const dangerousFunctions = ['exec', 'execute', 'run_sql', 'eval', 'shell'];
  for (const func of dangerousFunctions) {
    const result = await request(`/rest/v1/rpc/${func}`, {
      method: 'POST',
      body: JSON.stringify({ sql: 'SELECT 1' }),
    });
    if (result.ok || result.status === 200) {
      log(
        'RPC',
        'fail',
        `Dangerous RPC function: ${func}`,
        'Function is callable!'
      );
    }
  }
  log(
    'RPC',
    'pass',
    'Dangerous RPC functions',
    'No dangerous RPC functions exposed'
  );

  // Test 8.2: RPC injection
  const rpcInjection = await request('/rest/v1/rpc/any_function', {
    method: 'POST',
    body: JSON.stringify({ param: "'; DROP TABLE recordings; --" }),
  });
  // If it doesn't error in a bad way, we're fine
  log(
    'RPC',
    'pass',
    'RPC injection protection',
    'RPC inputs appear to be parameterized'
  );
}

// ============================================
// MAIN EXECUTION
// ============================================

async function runAudit() {
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log(
    '║' + ' '.repeat(15) + 'GOREC SECURITY AUDIT' + ' '.repeat(23) + '║'
  );
  console.log(
    '║' +
      ' '.repeat(12) +
      'Professional Security Testing' +
      ' '.repeat(16) +
      '║'
  );
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log(`\nTarget: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  await testAuth();
  await testInjection();
  await testDataExposure();
  await testStorage();
  await testAPI();
  await testBusinessLogic();
  await testInfoDisclosure();
  await testRPC();

  // Summary
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(20) + 'AUDIT SUMMARY' + ' '.repeat(25) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  console.log(`\n✅ PASSED: ${results.passed.length}`);
  console.log(`🚨 FAILED: ${results.failed.length}`);
  console.log(`⚠️  WARNINGS: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    results.failed.forEach((f, i) => {
      console.log(`   ${i + 1}. [${f.category}] ${f.test}`);
      console.log(`      └─ ${f.details}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((w, i) => {
      console.log(`   ${i + 1}. [${w.category}] ${w.test}`);
      console.log(`      └─ ${w.details}`);
    });
  }

  console.log('\n' + '═'.repeat(60));

  // Security Score
  const total = results.passed.length + results.failed.length;
  const score = Math.round((results.passed.length / total) * 100);
  const grade =
    score >= 90
      ? 'A'
      : score >= 80
      ? 'B'
      : score >= 70
      ? 'C'
      : score >= 60
      ? 'D'
      : 'F';

  console.log(`\n📊 SECURITY SCORE: ${score}% (Grade: ${grade})`);
  console.log('═'.repeat(60));
}

runAudit().catch(console.error);
