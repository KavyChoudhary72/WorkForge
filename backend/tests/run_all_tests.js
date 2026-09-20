// Master Test Runner for WorkForge Multi-Tenant SaaS Platform
process.env.NODE_ENV = 'test';

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> STARTING SUITE: ${scriptName} <<<`);
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
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
