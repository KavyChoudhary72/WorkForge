import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Organization from './models/Organization.js';
import Project from './models/Project.js';
import Client from './models/Client.js';
import Task from './models/Task.js';
import Invoice from './models/Invoice.js';
import TimeLog from './models/TimeLog.js';
import FileAsset from './models/FileAsset.js';
import Payment from './models/Payment.js';
import Attendance from './models/Attendance.js';
import Department from './models/Department.js';
import Role from './models/Role.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seed] Initializing complete MongoDB schemas and database seeding...');

    // 1. Seed Super Admin (Platform Owner)
    let superAdmin = await User.findOne({ email: 'kavychoudhary49@gmail.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        organizationId: null,
        name: 'Kavy Choudhary',
        email: 'kavychoudhary49@gmail.com',
        password: 'SuperAdminPass@2026',
        role: 'SUPER_ADMIN',
        department: 'Platform Governance',
        designation: 'Super Administrator',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['ALL_SUPER_ADMIN_PERMISSIONS', 'GOVERNANCE_ALL']
      });
      console.log(`[Seed] Super Admin created: ${superAdmin.email}`);
    } else {
      superAdmin.password = 'SuperAdminPass@2026';
      superAdmin.isEmailVerified = true;
      superAdmin.accountStatus = 'Active';
      await superAdmin.save();
      console.log(`[Seed] Super Admin updated: ${superAdmin.email}`);
    }

    // 2. Seed Default Organization Workspace
    let organization = await Organization.findOne({ slug: 'workforge-demo-workspace' });
    if (!organization) {
      organization = await Organization.create({
        name: 'WorkForge Enterprise Corp',
        slug: 'workforge-demo-workspace',
        plan: 'Pro Plan',
        status: 'Active',
        departments: ['Engineering', 'Product', 'Design', 'Executive']
      });
      console.log(`[Seed] Demo Organization created: ${organization.name}`);
    }

    // 2.5 Seed Oscorp & Peter Parker for Testing
    let oscorpOrg = await Organization.findOne({ slug: 'oscorp' });
    if (!oscorpOrg) {
      oscorpOrg = await Organization.create({
        name: 'Oscorp',
        slug: 'oscorp',
        plan: 'Pro Plan',
        status: 'Active',
        departments: ['Engineering', 'Product', 'Design', 'Executive'],
        trialActivated: false
      });
      console.log(`[Seed] Oscorp Organization created`);
    } else {
      oscorpOrg.plan = 'Pro Plan';
      oscorpOrg.subscriptionPlan = 'Pro Plan';
      await oscorpOrg.save();
      console.log(`[Seed] Oscorp Organization updated to Pro Plan`);
    }

    let peterUser = await User.findOne({ email: 'peter@oscorp.com' });
    if (!peterUser) {
      peterUser = await User.create({
        organizationId: oscorpOrg._id,
        name: 'Peter Parker',
        email: 'peter@oscorp.com',
        password: 'Peter@1234',
        role: 'COMPANY_ADMIN',
        department: 'Executive',
        designation: 'Scientific Director',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_PROJECTS', 'MANAGE_BILLING'],
        subscriptionDetails: {
          plan: 'Pro Plan',
          seats: 10
        }
      });
      console.log('[Seed] Peter Parker user created.');
    } else {
      peterUser.password = 'Peter@1234';
      peterUser.subscriptionDetails = { plan: 'Pro Plan', seats: 10 };
      await peterUser.save();
      console.log('[Seed] Peter Parker user updated to Pro Plan.');
    }

    // 3. Seed Company Admin Credentials
    let companyAdmin = await User.findOne({ email: 'admin@workforge.com' });
    if (!companyAdmin) {
      companyAdmin = await User.create({
        organizationId: organization._id,
        name: 'Sarah Connor',
        email: 'admin@workforge.com',
        password: 'Password@123',
        role: 'COMPANY_ADMIN',
        department: 'Executive',
        designation: 'Managing Director',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_PROJECTS', 'MANAGE_BILLING']
      });
      console.log('[Seed] Company Admin credentials stored: admin@workforge.com');
    }

    // 4. Seed Project Manager Credentials
    let pm = await User.findOne({ email: 'pm@workforge.com' });
    if (!pm) {
      pm = await User.create({
        organizationId: organization._id,
        name: 'Alex Rivera',
        email: 'pm@workforge.com',
        password: 'Password@123',
        role: 'PROJECT_MANAGER',
        department: 'Product & Engineering',
        designation: 'Lead Project Manager',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['MANAGE_PROJECTS', 'MANAGE_TASKS', 'VIEW_REPORTS']
      });
      console.log('[Seed] Project Manager credentials stored: pm@workforge.com');
    }

    // 5. Seed Employee Credentials
    let emp = await User.findOne({ email: 'employee@workforge.com' });
    if (!emp) {
      emp = await User.create({
        organizationId: organization._id,
        name: 'David Chen',
        email: 'employee@workforge.com',
        password: 'Password@123',
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['MANAGE_TASKS', 'LOG_TIME']
      });
      console.log('[Seed] Employee credentials stored: employee@workforge.com');
    }

    // 6. Seed Client Credentials
    let clientUser = await User.findOne({ email: 'client@workforge.com' });
    if (!clientUser) {
      clientUser = await User.create({
        organizationId: organization._id,
        name: 'Elena Rostova',
        email: 'client@workforge.com',
        password: 'Password@123',
        role: 'CLIENT',
        department: 'Client Portal',
        designation: 'External Sponsor',
        accountStatus: 'Active',
        isEmailVerified: true,
        permissions: ['VIEW_PROJECTS', 'VIEW_INVOICES']
      });
      console.log('[Seed] Client credentials stored: client@workforge.com');
    }

    // 7. Seed Client Entity
    let clientEntity = await Client.findOne({ email: 'contact@acme.com' });
    if (!clientEntity) {
      clientEntity = await Client.create({
        organizationId: organization._id,
        name: 'Elena Rostova',
        company: 'Acme Innovations Inc',
        email: 'contact@acme.com',
        phone: '+1 (555) 019-2834',
        taxId: 'US-987654321',
        industry: 'FinTech',
        status: 'Active'
      });
      console.log('[Seed] Client directory record stored.');
    }

    // 8. Seed Sample Projects
    let project1 = await Project.findOne({ name: 'Nexus Cloud Infrastructure Migration' });
    if (!project1) {
      project1 = await Project.create({
        organizationId: organization._id,
        clientId: clientEntity._id,
        name: 'Nexus Cloud Infrastructure Migration',
        description: 'Multi-cloud enterprise Kubernetes setup with zero downtime microservices migration.',
        status: 'In Progress',
        priority: 'High',
        budget: 120000,
        spent: 45000,
        startDate: new Date('2026-01-15'),
        dueDate: new Date('2026-09-30'),
        progress: 65
      });
      console.log('[Seed] Sample project stored in MongoDB.');
    }

    // 9. Seed Sample Tasks
    const taskCount = await Task.countDocuments({ organizationId: organization._id });
    if (taskCount === 0) {
      await Task.create([
        {
          organizationId: organization._id,
          projectId: project1._id,
          title: 'Setup Distributed MongoDB Cluster',
          description: 'Configure multi-region replica sets with automatic failover.',
          status: 'Completed',
          priority: 'High',
          assignedTo: emp._id,
          estimatedHours: 40,
          loggedHours: 38
        },
        {
          organizationId: organization._id,
          projectId: project1._id,
          title: 'Implement JWT & Refresh Token Rotation',
          description: 'Configure secure HttpOnly cookies, session tracking, and inactivity timeouts.',
          status: 'In Progress',
          priority: 'Urgent',
          assignedTo: emp._id,
          estimatedHours: 25,
          loggedHours: 18
        }
      ]);
      console.log('[Seed] Sample tasks stored in MongoDB.');
    }

    // 10. Seed Sample Invoice
    const invoiceCount = await Invoice.countDocuments({ organizationId: organization._id });
    if (invoiceCount === 0) {
      await Invoice.create({
        organizationId: organization._id,
        clientId: clientEntity._id,
        projectId: project1._id,
        invoiceNumber: 'INV-2026-001',
        amount: 25000,
        status: 'Paid',
        issueDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-15'),
        items: [
          { description: 'Cloud Architecture Planning', hours: 40, rate: 150, amount: 6000 },
          { description: 'MongoDB Replica Set Setup', hours: 80, rate: 150, amount: 12000 }
        ],
        taxRate: 10,
        taxAmount: 1800,
        totalAmount: 19800
      });
      console.log('[Seed] Sample invoice stored in MongoDB.');
    }

    // 11. Seed Sample Time Logs
    const timeLogCount = await TimeLog.countDocuments({ organizationId: organization._id });
    if (timeLogCount === 0) {
      await TimeLog.create({
        organizationId: organization._id,
        userId: emp._id,
        userName: emp.name,
        projectId: project1._id,
        projectName: project1.name,
        description: 'Configuring Mongoose models and bcrypt salt rounds.',
        durationSeconds: 14400,
        hours: 4,
        date: new Date(),
        billable: true,
        hourlyRate: 120,
        totalAmount: 480
      });
      console.log('[Seed] Sample time log stored in MongoDB.');
    }

    // 12. Seed Sample Departments
    const deptCount = await Department.countDocuments({ organizationId: organization._id });
    if (deptCount === 0) {
      await Department.create([
        { organizationId: organization._id, name: 'Engineering', managerId: pm._id },
        { organizationId: organization._id, name: 'Product Management', managerId: pm._id },
        { organizationId: organization._id, name: 'Design', managerId: pm._id },
        { organizationId: organization._id, name: 'Executive', managerId: companyAdmin._id }
      ]);
      console.log('[Seed] Sample departments stored in MongoDB.');
    }

    // 13. Seed Sample Roles
    const roleCount = await Role.countDocuments({ organizationId: organization._id });
    if (roleCount === 0) {
      await Role.create([
        {
          organizationId: organization._id,
          name: 'COMPANY_ADMIN',
          permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_PROJECTS', 'MANAGE_BILLING']
        },
        {
          organizationId: organization._id,
          name: 'PROJECT_MANAGER',
          permissions: ['MANAGE_PROJECTS', 'MANAGE_TASKS', 'VIEW_REPORTS']
        },
        {
          organizationId: organization._id,
          name: 'EMPLOYEE',
          permissions: ['MANAGE_TASKS', 'LOG_TIME']
        }
      ]);
      console.log('[Seed] Sample roles stored in MongoDB.');
    }

    // 14. Seed Sample Payments
    const paymentCount = await Payment.countDocuments({ organizationId: organization._id });
    if (paymentCount === 0) {
      const sampleInvoice = await Invoice.findOne({ organizationId: organization._id, invoiceNumber: 'INV-2026-001' });
      if (sampleInvoice) {
        await Payment.create({
          organizationId: organization._id,
          invoiceId: sampleInvoice._id,
          clientId: clientEntity._id,
          amount: sampleInvoice.totalAmount,
          paymentMethod: 'Bank Transfer',
          status: 'Completed',
          transactionId: 'TXN-9827349182',
          paymentDate: new Date()
        });
        console.log('[Seed] Sample payment stored in MongoDB.');
      }
    }

    // 15. Seed Sample Attendance
    const attendanceCount = await Attendance.countDocuments({ organizationId: organization._id });
    if (attendanceCount === 0) {
      const checkInTime = new Date();
      checkInTime.setHours(9, 0, 0, 0);
      const checkOutTime = new Date();
      checkOutTime.setHours(17, 30, 0, 0);

      await Attendance.create({
        organizationId: organization._id,
        userId: emp._id,
        date: new Date(),
        status: 'Present',
        checkIn: checkInTime,
        checkOut: checkOutTime
      });
      console.log('[Seed] Sample attendance record stored in MongoDB.');
    }

    console.log('\n======================================================');
    console.log('WORKFORGE COMPLETE MONGODB SCHEMAS SEEDED SUCCESSFULLY');
    console.log('All user credentials, projects, tasks & logs stored in DB!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
