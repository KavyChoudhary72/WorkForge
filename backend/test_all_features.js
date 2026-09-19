process.env.NODE_ENV = 'test';
import connectDB from './src/config/db.js';
import app from './src/server.js';
import User from './src/models/User.js';
import Organization from './src/models/Organization.js';
import Client from './src/models/Client.js';
import Project from './src/models/Project.js';
import Task from './src/models/Task.js';
import Invoice from './src/models/Invoice.js';
import TimeLog from './src/models/TimeLog.js';
import FileAsset from './src/models/FileAsset.js';
import Notification from './src/models/Notification.js';
import Payment from './src/models/Payment.js';
import Attendance from './src/models/Attendance.js';

let server;
const BASE_PORT = 5006;
const BASE_URL = `http://localhost:${BASE_PORT}/api`;

const runEliteTests = async () => {
  try {
    await connectDB();
    
    server = app.listen(BASE_PORT, async () => {
      console.log(`\n======================================================`);
      console.log(`ELITE QA TEST SUITE RUNNING ON PORT ${BASE_PORT}`);
      console.log(`======================================================\n`);

      // Clean up previous test entries from DB to avoid collision
      await User.deleteMany({ email: { $in: ['test-admin@acme.com', 'test-emp@acme.com'] } });
      await Organization.deleteMany({ slug: { $in: ['acme-test-org', 'beta-test-org'] } });

      let adminToken = '';
      let empToken = '';
      let testOrgId = '';
      let testClientId = '';
      let testProjectId = '';
      let testTaskId = '';
      let testInvoiceId = '';
      let testTimeLogId = '';
      let testFileId = '';
      let testNotificationId = '';

      // --- FEATURE 1: AUTHENTICATION & REGISTRATION ---
      console.log('Testing authentication, company registration, and login...');
      
      // 1.1 Register Company Workspace
      const regRes = await fetch(`${BASE_URL}/auth/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Acme Founder',
          email: 'test-admin@acme.com',
          password: 'Password@123',
          companyName: 'Acme Test Org'
        })
      });
      const regData = await regRes.json();
      if (regRes.status !== 201) throw new Error(`Reg failed: ${regData.message}`);
      console.log('  [PASS] Company Workspace registered successfully.');

      // 1.2 Verify Email Address
      const verifyRes = await fetch(`${BASE_URL}/auth/verify-email?token=${regData.verificationToken}`, {
        method: 'GET'
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.status !== 200) throw new Error(`Verification failed: ${verifyData.message}`);
      console.log('  [PASS] Email verification completed.');

      // 1.3 Company Admin Login
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test-admin@acme.com',
          password: 'Password@123'
        })
      });
      const loginData = await loginRes.json();
      if (loginRes.status !== 200) throw new Error(`Login failed: ${loginData.message}`);
      adminToken = loginData.accessToken;
      testOrgId = loginData.user.organizationId;
      console.log('  [PASS] Company Admin logged in. JWT Token retrieved.');

      // --- FEATURE 2: USER / TEAM MANAGEMENT ---
      console.log('\nTesting team creation and user retrieval...');
      
      // Let's seed an Employee inside the newly created organization
      const testEmp = await User.create({
        organizationId: testOrgId,
        name: 'David Developer',
        email: 'test-emp@acme.com',
        password: 'Password@123',
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Senior Developer',
        isEmailVerified: true
      });
      console.log('  [PASS] Seeded Employee User: test-emp@acme.com.');

      // Log in as employee to get their token
      const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test-emp@acme.com',
          password: 'Password@123'
        })
      });
      const empLoginData = await empLoginRes.json();
      empToken = empLoginData.accessToken;
      console.log('  [PASS] Employee logged in. JWT Token retrieved.');

      // --- FEATURE 3: CLIENT MANAGEMENT ---
      console.log('\nTesting Client Management CRUD endpoints...');
      
      // 3.1 Create Client
      const createCliRes = await fetch(`${BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          company: 'Acme Client Corp',
          email: 'jane@clientcorp.com',
          phone: '+1-555-8888',
          taxId: 'GST-992834',
          industry: 'FinTech',
          status: 'Active'
        })
      });
      const cliData = await createCliRes.json();
      if (createCliRes.status !== 201) throw new Error(`Create client failed: ${cliData.message}`);
      testClientId = cliData._id;
      console.log('  [PASS] Client created. ID:', testClientId);

      // 3.2 Update Client
      const updateCliRes = await fetch(`${BASE_URL}/clients/${testClientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name: 'Jane Smith' })
      });
      const updateCliData = await updateCliRes.json();
      if (updateCliRes.status !== 200 || updateCliData.name !== 'Jane Smith') {
        throw new Error('Update client failed');
      }
      console.log('  [PASS] Client updated.');

      // 3.3 Get Clients
      const getCliRes = await fetch(`${BASE_URL}/clients`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const getCliData = await getCliRes.json();
      if (getCliRes.status !== 200 || getCliData.length === 0) throw new Error('Get clients failed');
      console.log('  [PASS] Clients retrieved successfully. Count:', getCliData.length);

      // --- FEATURE 4: PROJECT MANAGEMENT ---
      console.log('\nTesting Project Management CRUD endpoints...');
      
      // 4.1 Create Project
      const createProjRes = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'Core System Migration',
          clientId: testClientId,
          description: 'Migrating the legacy system to a serverless architecture.',
          budget: 85000,
          startDate: new Date(),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          priority: 'High',
          status: 'Planning'
        })
      });
      const projData = await createProjRes.json();
      if (createProjRes.status !== 201) throw new Error(`Create project failed: ${projData.message}`);
      testProjectId = projData._id;
      console.log('  [PASS] Project created. ID:', testProjectId);

      // 4.2 Get Projects
      const getProjRes = await fetch(`${BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const getProjData = await getProjRes.json();
      if (getProjRes.status !== 200 || getProjData.length === 0) throw new Error('Get projects failed');
      console.log('  [PASS] Projects retrieved successfully. Count:', getProjData.length);

      // --- FEATURE 5: TASK MANAGEMENT ---
      console.log('\nTesting Task Management CRUD endpoints...');
      
      // 5.1 Create Task
      const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          projectId: testProjectId,
          title: 'Implement Database Replication',
          description: 'Set up multi-region read replicas.',
          status: 'To Do',
          priority: 'High',
          assignedTo: testEmp._id,
          estimatedHours: 15
        })
      });
      const taskData = await createTaskRes.json();
      if (createTaskRes.status !== 201) throw new Error(`Create task failed: ${taskData.message}`);
      testTaskId = taskData._id;
      console.log('  [PASS] Task created. ID:', testTaskId);

      // 5.2 Get Tasks
      const getTasksRes = await fetch(`${BASE_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const getTasksData = await getTasksRes.json();
      if (getTasksRes.status !== 200 || getTasksData.length === 0) throw new Error('Get tasks failed');
      console.log('  [PASS] Tasks retrieved successfully. Count:', getTasksData.length);

      // --- FEATURE 6: TIME TRACKING ---
      console.log('\nTesting Time Tracking endpoints...');
      
      // 6.1 Log Time
      const createTimeRes = await fetch(`${BASE_URL}/timelogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${empToken}`
        },
        body: JSON.stringify({
          projectId: testProjectId,
          projectName: 'Core System Migration',
          taskId: testTaskId,
          taskTitle: 'Implement Database Replication',
          description: 'Configuring Mongoose models and testing read replication.',
          durationSeconds: 7200,
          hours: 2,
          billable: true,
          hourlyRate: 100,
          totalAmount: 200
        })
      });
      const timeLogData = await createTimeRes.json();
      if (createTimeRes.status !== 201) throw new Error(`Create time log failed: ${timeLogData.message}`);
      testTimeLogId = timeLogData._id;
      console.log('  [PASS] Time log added. ID:', testTimeLogId);

      // 6.2 Get Time Logs
      const getTimeRes = await fetch(`${BASE_URL}/timelogs`, {
        headers: { 'Authorization': `Bearer ${empToken}` }
      });
      const getTimeData = await getTimeRes.json();
      if (getTimeRes.status !== 200 || getTimeData.length === 0) throw new Error('Get time logs failed');
      console.log('  [PASS] Time logs retrieved. Count:', getTimeData.length);

      // --- FEATURE 7: INVOICE MANAGEMENT ---
      console.log('\nTesting Invoice Management endpoints...');
      
      // 7.1 Create Invoice
      const createInvRes = await fetch(`${BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          clientId: testClientId,
          projectId: testProjectId,
          invoiceNumber: `INV-${Date.now()}`,
          amount: 2200,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          items: [
            { description: 'Database configuration work', hours: 20, rate: 100, amount: 2000 }
          ],
          taxRate: 10,
          taxAmount: 200,
          totalAmount: 2200,
          status: 'Pending'
        })
      });
      const invData = await createInvRes.json();
      if (createInvRes.status !== 201) throw new Error(`Create invoice failed: ${invData.message}`);
      testInvoiceId = invData._id;
      console.log('  [PASS] Invoice generated. ID:', testInvoiceId);

      // 7.2 Update Invoice Status
      const updateInvRes = await fetch(`${BASE_URL}/invoices/${testInvoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'Paid' })
      });
      const updateInvData = await updateInvRes.json();
      if (updateInvRes.status !== 200 || updateInvData.status !== 'Paid') {
        throw new Error('Update invoice status failed');
      }
      console.log('  [PASS] Invoice status updated to Paid.');

      // --- FEATURE 8: FILE MANAGEMENT ---
      console.log('\nTesting File Management endpoints...');
      
      // 8.1 Create File Asset Metadata
      const createFileRes = await fetch(`${BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${empToken}`
        },
        body: JSON.stringify({
          name: 'Database Architecture Plan.pdf',
          sizeBytes: 154200,
          formattedSize: '150 KB',
          type: 'application/pdf',
          url: 'https://s3.aws.amazon.com/test-bucket/Database-Architecture-Plan.pdf',
          category: 'Document',
          folder: 'Technical specs'
        })
      });
      const fileData = await createFileRes.json();
      if (createFileRes.status !== 201) throw new Error(`Create file failed: ${fileData.message}`);
      testFileId = fileData._id;
      console.log('  [PASS] File Asset metadata saved. ID:', testFileId);

      // 8.2 Get Files List
      const getFilesRes = await fetch(`${BASE_URL}/files`, {
        headers: { 'Authorization': `Bearer ${empToken}` }
      });
      const getFilesData = await getFilesRes.json();
      if (getFilesRes.status !== 200 || getFilesData.length === 0) throw new Error('Get files failed');
      console.log('  [PASS] File Assets retrieved successfully. Count:', getFilesData.length);

      // --- FEATURE 9: NOTIFICATIONS ---
      console.log('\nTesting Notifications endpoints...');
      
      // 9.1 Seed a notification
      const testNotif = await Notification.create({
        organizationId: testOrgId,
        userId: testEmp._id,
        title: 'Task Assigned',
        message: 'You have been assigned: Implement Database Replication',
        type: 'info',
        read: false
      });
      testNotificationId = testNotif._id;
      console.log('  [PASS] Seeded Notification. ID:', testNotificationId);

      // 9.2 Get Notifications
      const getNotifRes = await fetch(`${BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${empToken}` }
      });
      const getNotifData = await getNotifRes.json();
      if (getNotifRes.status !== 200 || getNotifData.length === 0) throw new Error('Get notifications failed');
      console.log('  [PASS] Notifications retrieved successfully. Count:', getNotifData.length);

      // 9.3 Mark Notification Read
      const readNotifRes = await fetch(`${BASE_URL}/notifications/${testNotificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${empToken}` }
      });
      const readNotifData = await readNotifRes.json();
      if (readNotifRes.status !== 200 || !readNotifData.read) throw new Error('Mark notification read failed');
      console.log('  [PASS] Notification marked as read.');

      // --- FEATURE 10: AUDIT / ACTIVITY LOGS ---
      console.log('\nTesting Audit & Activity Logging...');
      
      const getLogsRes = await fetch(`${BASE_URL}/activity`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const getLogsData = await getLogsRes.json();
      if (getLogsRes.status !== 200) throw new Error('Get audit logs failed');
      console.log('  [PASS] Tenant Audit Logs retrieved successfully. Count:', getLogsData.length);

      // --- FEATURE 11: INTEGRATIONS HUB ---
      console.log('\nTesting Integrations Hub settings...');
      
      // 11.1 Toggle Integration
      const toggleRes = await fetch(`${BASE_URL}/integrations/slack/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const toggleData = await toggleRes.json();
      if (toggleRes.status !== 200 || toggleData.status !== 'Connected') {
        throw new Error('Toggle integration failed');
      }
      console.log('  [PASS] Connected Slack Integration in cloud database.');

      // 11.2 Save Integration Configuration parameters
      const configRes = await fetch(`${BASE_URL}/integrations/slack/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          config: {
            slackWebhook: 'https://hooks.slack.com/services/T00/B00/NEW_URL'
          }
        })
      });
      const configData = await configRes.json();
      if (configRes.status !== 200 || configData.config.slackWebhook !== 'https://hooks.slack.com/services/T00/B00/NEW_URL') {
        throw new Error('Save integration config failed');
      }
      console.log('  [PASS] Saved Slack Integration credentials to MongoDB.');

      // --- TENANT ISOLATION SANITY CHECK ---
      console.log('\nVerifying multi-tenant isolation boundaries...');
      
      // Create a second test organization
      const betaOrg = await Organization.create({
        name: 'Beta Test Org',
        slug: 'beta-test-org'
      });
      
      // Create a user in the second organization
      const betaUser = await User.create({
        organizationId: betaOrg._id,
        name: 'Beta Admin',
        email: 'admin@beta.com',
        password: 'Password@123',
        role: 'COMPANY_ADMIN',
        isEmailVerified: true
      });

      // Login as Beta Admin
      const betaLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@beta.com',
          password: 'Password@123'
        })
      });
      const betaLoginData = await betaLoginRes.json();
      const betaToken = betaLoginData.accessToken;

      // Try to access Acme's project using Beta Admin token (should return empty or be blocked)
      const queryAcmeRes = await fetch(`${BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${betaToken}` }
      });
      const queryAcmeData = await queryAcmeRes.json();
      
      // Check if Acme project is in the list
      const hasAcmeProject = queryAcmeData.some(p => p._id === testProjectId || p.id === testProjectId);
      if (hasAcmeProject) {
        throw new Error('CRITICAL VULNERABILITY: Tenant isolation breach. Beta Org can see Acme Org projects!');
      }
      console.log('  [PASS] Tenant isolation enforced. Beta Org blocked from reading Acme Org data.');

      // Clean up test records
      console.log('\nCleaning up database records...');
      await User.deleteMany({ email: { $in: ['test-admin@acme.com', 'test-emp@acme.com', 'admin@beta.com'] } });
      await Organization.deleteMany({ slug: { $in: ['acme-test-org', 'beta-test-org'] } });
      await Client.deleteMany({ _id: testClientId });
      await Project.deleteMany({ _id: testProjectId });
      await Task.deleteMany({ _id: testTaskId });
      await TimeLog.deleteMany({ _id: testTimeLogId });
      await Invoice.deleteMany({ _id: testInvoiceId });
      await FileAsset.deleteMany({ _id: testFileId });
      await Notification.deleteMany({ _id: testNotificationId });
      console.log('  [PASS] DB cleaned up.');

      console.log(`\n======================================================`);
      console.log(`ALL 11 FEATURES + TENANT ISOLATION VERIFIED 100% PASS`);
      console.log(`======================================================\n`);

      server.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('\n[FAIL] Test script encountered validation error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runEliteTests();
