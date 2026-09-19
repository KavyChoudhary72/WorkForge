# WorkForge Database Schema Specification

## 1. Overview & Data Modeling Strategy

WorkForge uses MongoDB with Mongoose ODM. Data isolation is maintained at the logical document level using `organizationId: ObjectId` references on all tenant-specific collections.

---

## 2. Collections & Schema Definitions

### 2.1 Organizations (`organizations`)
Represents an isolated company tenant workspace.
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  plan: { 
    type: String, 
    enum: ['Trial Plan', 'Starter Plan', 'Pro Plan', 'Enterprise Plan'], 
    default: 'Trial Plan' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Pending Verification'], 
    default: 'Active' 
  },
  logo: { type: String, default: '' },
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  taxRate: { type: Number, default: 18 },
  settings: {
    twoFactorAuthEnabled: { type: Boolean, default: false },
    autoInvoicing: { type: Boolean, default: true },
    slackWebhook: { type: String, default: '' }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Users (`users`)
Represents accounts with access credentials and workspace associations.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: false }, // Nullable for Super Admin
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Bcrypt hash
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE', 'CLIENT'], 
    default: 'EMPLOYEE' 
  },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  department: { type: String, default: 'Engineering' },
  hourlyRate: { type: Number, default: 1000 },
  isEmailVerified: { type: Boolean, default: true },
  refreshTokens: [{
    token: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: { type: Date, default: Date.now }
  }],
  subscriptionDetails: {
    plan: { type: String, default: 'Trial Plan' },
    trialActivated: { type: Boolean, default: false },
    trialEndDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, email: 1 }`
- `{ role: 1 }`

### 2.3 Clients (`clients`)
Represents corporate accounts and billing entities.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  contactPerson: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  industry: { type: String, default: 'Technology' },
  address: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Lead', 'Inactive'], default: 'Active' },
  isArchived: { type: Boolean, default: false },
  totalBilled: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, isArchived: 1, createdAt: -1 }`

### 2.4 Projects (`projects`)
Represents customer contracts and sprint milestones.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  clientId: { type: ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  budget: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  deadline: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Testing', 'Completed', 'Delivered', 'Cancelled'], 
    default: 'Planning' 
  },
  completionPercent: { type: Number, default: 0 },
  description: { type: String, default: '' },
  assignedTeam: [{ type: ObjectId, ref: 'User' }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, status: 1, deadline: 1 }`

### 2.5 Tasks (`tasks`)
Kanban work items and sprint deliverables.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: { type: ObjectId, ref: 'User' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Testing', 'Completed'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  dueDate: { type: String },
  labels: [{ type: String }],
  checklist: [{
    id: String,
    title: String,
    isCompleted: { type: Boolean, default: false }
  }],
  comments: [{
    id: String,
    userId: { type: ObjectId, ref: 'User' },
    userName: String,
    userAvatar: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  attachments: [{
    name: String,
    url: String,
    size: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, projectId: 1, status: 1 }`

### 2.6 Time Logs (`timelogs`)
Billable and non-billable employee productivity tracking.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  taskId: { type: ObjectId, ref: 'Task' },
  hours: { type: Number, required: true },
  description: { type: String, default: '' },
  billable: { type: Boolean, default: true },
  hourlyRate: { type: Number, default: 1000 },
  date: { type: Date, default: Date.now },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, userId: 1, date: -1 }`

### 2.7 Invoices (`invoices`)
Tax invoices and receivables tracking.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  clientId: { type: ObjectId, ref: 'Client', required: true },
  projectId: { type: ObjectId, ref: 'Project' },
  invoiceNumber: { type: String, required: true },
  dueDate: { type: String, required: true },
  items: [{
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: Number,
    amount: Number
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'], default: 'Sent' },
  notes: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, status: 1, dueDate: 1 }`

### 2.8 Leave Requests (`leaverequests`)
HR management and employee leave approval workflows.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Paid Time Off', 'Sick Leave', 'Casual Leave', 'Unpaid Leave'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  days: { type: Number, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: ObjectId, ref: 'User' },
  approvalDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ organizationId: 1, status: 1, createdAt: -1 }`

### 2.9 Activity Logs (`activitylogs`)
Immutable audit trail records for compliance and change tracking.
```javascript
{
  _id: ObjectId,
  organizationId: { type: ObjectId, ref: 'Organization', required: true },
  userId: { type: ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { type: String, default: 'Member' },
  action: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  timestamp: { type: Date, default: Date.now }
}
```
**Compound Indexes:**
- `{ organizationId: 1, timestamp: -1 }`
