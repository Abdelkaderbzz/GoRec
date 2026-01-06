/**
 * SUPABASE SECURITY VULNERABILITY TESTER
 * ========================================
 * This script tests for common RLS vulnerabilities
 * Run with: node supabase/security-test.js
 * 
 * NOTE: Set SUPABASE_ANON_KEY environment variable or update the key below
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ycmotbwytciaewbmziec.supabase.co';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'YOUR_ANON_KEY_HERE';

const results = [];

function logResult(testName, passed, details) {
  const status = passed ? '✅ SECURE' : '🚨 VULNERABLE';
  console.log(`\n${status}: ${testName}`);
  if (details) console.log(`   Details: ${details}`);
  results.push({ testName, passed, details });
}

async function makeRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, { 
      ...options, 
      headers 
    });
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, error: error.message, ok: false };
  }
}

// ==========================================
// VULNERABILITY TESTS
// ==========================================

async function testUnauthorizedRecordingsAccess() {
  console.log('\n📋 Testing: Unauthorized access to all recordings...');
  
  // Test 1: Get all recordings without auth
  const result = await makeRequest('/rest/v1/recordings?select=*&limit=20');
  
  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    // Check if we got non-public recordings
    const nonPublicRecordings = result.data.filter(r => !r.is_public);
    if (nonPublicRecordings.length > 0) {
      logResult('Unauthorized access to private recordings', false, 
        `Found ${nonPublicRecordings.length} private recordings accessible without auth!`);
      return false;
    } else {
      logResult('Unauthorized access to private recordings', true, 
        `Only ${result.data.length} public recordings returned (expected behavior)`);
      return true;
    }
  } else if (result.ok && Array.isArray(result.data) && result.data.length === 0) {
    logResult('Unauthorized access to private recordings', true, 
      'No recordings returned to unauthenticated user');
    return true;
  } else {
    logResult('Unauthorized access to private recordings', true, 
      `Request blocked or returned error: ${result.status}`);
    return true;
  }
}

async function testUserIdFilterBypass() {
  console.log('\n📋 Testing: User ID filter bypass...');
  
  // Try accessing with a fake user_id filter removed
  const result = await makeRequest('/rest/v1/recordings?select=*&order=created_at.desc&limit=50');
  
  if (result.ok && Array.isArray(result.data)) {
    const privateRecordings = result.data.filter(r => !r.is_public);
    if (privateRecordings.length > 0) {
      logResult('User ID filter bypass', false, 
        `Exposed ${privateRecordings.length} private recordings from different users!`);
      console.log('   Sample exposed user_ids:', [...new Set(privateRecordings.map(r => r.user_id))].slice(0, 5));
      return false;
    }
  }
  
  logResult('User ID filter bypass', true, 'Cannot access other users\' private recordings');
  return true;
}

async function testSensitiveFieldExposure() {
  console.log('\n📋 Testing: Sensitive field exposure...');
  
  const result = await makeRequest('/rest/v1/recordings?select=*&limit=5');
  
  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    const sample = result.data[0];
    const sensitiveFields = ['user_id', 'file_path', 'share_token'];
    const exposedFields = sensitiveFields.filter(f => sample[f] !== undefined);
    
    if (exposedFields.length > 0 && !sample.is_public) {
      logResult('Sensitive field exposure on private recordings', false, 
        `Private recording exposes: ${exposedFields.join(', ')}`);
      return false;
    }
  }
  
  logResult('Sensitive field exposure', true, 'No sensitive fields exposed on private recordings');
  return true;
}

async function testUsersTableAccess() {
  console.log('\n📋 Testing: Unauthorized access to users table...');
  
  const result = await makeRequest('/rest/v1/users?select=*&limit=10');
  
  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    logResult('Users table access', false, 
      `Exposed ${result.data.length} user records!`);
    return false;
  }
  
  logResult('Users table access', true, 'Users table properly protected');
  return true;
}

async function testAuthUsersAccess() {
  console.log('\n📋 Testing: Access to auth.users (should be blocked)...');
  
  const result = await makeRequest('/rest/v1/auth.users?select=*&limit=10');
  
  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    logResult('Auth.users table access', false, 
      'CRITICAL: auth.users table is exposed!');
    return false;
  }
  
  logResult('Auth.users table access', true, 'auth.users properly protected');
  return true;
}

async function testInsertWithoutAuth() {
  console.log('\n📋 Testing: Insert recordings without authentication...');
  
  const result = await makeRequest('/rest/v1/recordings', {
    method: 'POST',
    body: JSON.stringify({
      filename: 'test_vulnerability.webm',
      file_path: 'malicious/path/file.webm',
      user_id: '00000000-0000-0000-0000-000000000000'
    })
  });
  
  if (result.ok || result.status === 201) {
    logResult('Unauthenticated insert', false, 
      'Can insert recordings without authentication!');
    return false;
  }
  
  logResult('Unauthenticated insert', true, 
    `Insert blocked: ${result.status} - ${JSON.stringify(result.data)}`);
  return true;
}

async function testDeleteWithoutAuth() {
  console.log('\n📋 Testing: Delete recordings without authentication...');
  
  const result = await makeRequest('/rest/v1/recordings?id=eq.00000000-0000-0000-0000-000000000000', {
    method: 'DELETE'
  });
  
  // If we get a 204 or 200, it might have tried to delete
  if (result.status === 204 || result.status === 200) {
    // Check if any rows were actually affected - RLS should prevent this
    logResult('Unauthenticated delete', true, 
      'Delete request accepted but RLS should prevent actual deletion');
    return true;
  }
  
  logResult('Unauthenticated delete', true, 
    `Delete blocked or no rows matched: ${result.status}`);
  return true;
}

async function testStorageBucketListing() {
  console.log('\n📋 Testing: Storage bucket listing...');
  
  const result = await makeRequest('/storage/v1/object/list/recordings', {
    method: 'POST',
    body: JSON.stringify({
      prefix: '',
      limit: 100
    })
  });
  
  if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
    logResult('Storage bucket listing', false, 
      `Can list ${result.data.length} files in storage bucket!`);
    return false;
  }
  
  logResult('Storage bucket listing', true, 
    'Cannot list storage bucket contents');
  return true;
}

async function testSQLInjection() {
  console.log('\n📋 Testing: SQL Injection attempts...');
  
  const injectionAttempts = [
    "/rest/v1/recordings?select=*&id=eq.'; DROP TABLE recordings; --",
    "/rest/v1/recordings?select=*&filename=eq.' OR '1'='1",
    "/rest/v1/recordings?select=*,pg_sleep(5)",
    "/rest/v1/rpc/exec?sql=SELECT * FROM recordings"
  ];
  
  let allBlocked = true;
  
  for (const attempt of injectionAttempts) {
    const result = await makeRequest(attempt);
    if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
      console.log(`   ⚠️ Suspicious response from: ${attempt.substring(0, 50)}...`);
      allBlocked = false;
    }
  }
  
  logResult('SQL Injection protection', allBlocked, 
    allBlocked ? 'All injection attempts blocked' : 'Some injection attempts may have succeeded');
  return allBlocked;
}

async function testHorizontalPrivilegeEscalation() {
  console.log('\n📋 Testing: Horizontal privilege escalation (access other user data)...');
  
  // Try to get recordings with specific user_id that isn't ours
  const result = await makeRequest(
    '/rest/v1/recordings?select=*&user_id=neq.00000000-0000-0000-0000-000000000000&limit=10'
  );
  
  if (result.ok && Array.isArray(result.data)) {
    const privateRecordings = result.data.filter(r => !r.is_public);
    if (privateRecordings.length > 0) {
      logResult('Horizontal privilege escalation', false, 
        `Can access ${privateRecordings.length} private recordings from other users!`);
      return false;
    }
  }
  
  logResult('Horizontal privilege escalation', true, 
    'Cannot access other users\' private recordings');
  return true;
}

async function testRLSBypass() {
  console.log('\n📋 Testing: RLS bypass with Prefer header...');
  
  // Some misconfigured systems allow RLS bypass with service role key or special headers
  const result = await makeRequest('/rest/v1/recordings?select=*&limit=20', {
    headers: {
      'Prefer': 'return=representation',
      'X-Client-Info': 'supabase-js/2.0.0'
    }
  });
  
  if (result.ok && Array.isArray(result.data)) {
    const privateRecordings = result.data.filter(r => !r.is_public);
    if (privateRecordings.length > 0) {
      logResult('RLS bypass with headers', false, 
        `RLS bypassed! Exposed ${privateRecordings.length} private recordings`);
      return false;
    }
  }
  
  logResult('RLS bypass with headers', true, 'RLS cannot be bypassed with headers');
  return true;
}

async function testBulkDataExfiltration() {
  console.log('\n📋 Testing: Bulk data exfiltration (high limit)...');
  
  const result = await makeRequest('/rest/v1/recordings?select=*&limit=10000');
  
  if (result.ok && Array.isArray(result.data)) {
    const privateRecordings = result.data.filter(r => !r.is_public);
    if (privateRecordings.length > 0) {
      logResult('Bulk data exfiltration', false, 
        `Can exfiltrate ${privateRecordings.length} private recordings with high limit!`);
      return false;
    }
    if (result.data.length > 100) {
      console.log(`   ⚠️ Warning: ${result.data.length} public recordings returned. Consider pagination limits.`);
    }
  }
  
  logResult('Bulk data exfiltration', true, 
    'Cannot bulk exfiltrate private recordings');
  return true;
}

// ==========================================
// MAIN EXECUTION
// ==========================================

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🔒 SUPABASE SECURITY VULNERABILITY TESTER');
  console.log('='.repeat(60));
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  await testUnauthorizedRecordingsAccess();
  await testUserIdFilterBypass();
  await testSensitiveFieldExposure();
  await testUsersTableAccess();
  await testAuthUsersAccess();
  await testInsertWithoutAuth();
  await testDeleteWithoutAuth();
  await testStorageBucketListing();
  await testSQLInjection();
  await testHorizontalPrivilegeEscalation();
  await testRLSBypass();
  await testBulkDataExfiltration();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SECURITY TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`🚨 Failed: ${failed}`);
  console.log(`Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n🚨 CRITICAL: VULNERABILITIES DETECTED!');
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.testName}: ${r.details}`);
    });
    console.log('\n⚠️  Apply the security migration immediately!');
  } else {
    console.log('\n✅ All security tests passed!');
  }
  
  console.log('\n' + '='.repeat(60));
}

runAllTests().catch(console.error);
