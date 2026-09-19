// Master Test Runner for WorkForge Multi-Tenant SaaS Platform
process.env.NODE_ENV = 'test';

import { spawn } from 'child_process';

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> STARTING SUITE: ${scriptName} <<<`);
    const child = spawn(process.execPath, [scriptName], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with exit code ${code}`));
      }
    });
  });
};

const runAll = async () => {
  try {
    await runScript('test_all_auth.js');
    await runScript('test_all_features.js');
    console.log('\n======================================================');
    console.log('✅ ALL BACKEND TEST SUITES COMPLETED WITH 100% PASS');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test execution failure:', err.message);
    process.exit(1);
  }
};

runAll();
