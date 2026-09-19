import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WorkForgeLogo from '../components/common/WorkForgeLogo';
import {
  ShieldCheck,
  Zap,
  CheckCircle,
  Building2,
  Users,
  Briefcase,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Lock,
  Globe,
  BarChart3,
  Check,
  ShieldAlert,
  Sun,
  Moon,
  CheckSquare,
  FolderGit2,
  Calendar,
  Bell,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  UserCheck,
  Activity,
  Terminal,
  Server,
  IndianRupee,
  TrendingUp,
  Layout,
  Filter,
  Eye,
  Mail,
  Phone,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  const { currentUser, logout, darkMode, toggleDarkMode } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // 10 Core Features
  const features = [
    {
      icon: Briefcase,
      title: 'Project Management',
      description: 'Milestone tracking, budget burn rates, sprint completion metrics, and portfolio governance.'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Centralized client directory, account profiles, GST tax IDs, billing histories, and contracts.'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Interactive 4-column drag-and-drop Kanban boards, subtask checklists, and priority badges.'
    },
    {
      icon: UserCheck,
      title: 'Team Management',
      description: 'Granular department organization, workload allocation, member designations, and permissions.'
    },
    {
      icon: FileText,
      title: 'Invoice Management',
      description: 'Automated GST tax calculations, discounts, payment status tracking, and instant client PDF exports.'
    },
    {
      icon: FolderGit2,
      title: 'File Management',
      description: 'Encrypted cloud storage vault, file versioning, document tagging, and asset sharing per project.'
    },
    {
      icon: Calendar,
      title: 'Calendar & Schedule',
      description: 'Unified team schedule, deadline tracking, milestone calendars, and event synchronization.'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Portfolio revenue trends, team utilization rates, project burn charts, and executive analytics.'
    },
    {
      icon: Bell,
      title: 'Real-Time Notifications',
      description: 'Instant task status alerts, deadline reminders, mention notifications, and system audit logs.'
    },
    {
      icon: Sparkles,
      title: 'AI Productivity Tools',
      description: 'Automated project health scoring, intelligent task estimation, and AI-powered meeting notes summaries.'
    }
  ];

  // How It Works Steps
  const workflowSteps = [
    {
      step: '01',
      title: 'Create your organization',
      desc: 'Set up a secure multi-tenant workspace with custom branding, department structures, and domain settings in under 60 seconds.'
    },
    {
      step: '02',
      title: 'Invite your team',
      desc: 'Onboard administrators, project managers, developers, designers, and clients with granular role-based permissions.'
    },
    {
      step: '03',
      title: 'Manage projects and tasks',
      desc: 'Organize workloads with Kanban boards, subtasks, deadline tracking, live time stopwatches, and file asset sharing.'
    },
    {
      step: '04',
      title: 'Track progress and deliver successfully',
      desc: 'Monitor real-time AI health scores, export PDF invoices with GST calculations, review analytics, and ship projects on time.'
    }
  ];

  // AI Features
  const aiFeatures = [
    {
      icon: Sparkles,
      title: 'AI Project Health Score (1–100)',
      desc: 'Predictive health algorithm analyzing budget burn rates, sprint velocity, overdue tasks, and client milestone delivery risk in real time.'
    },
    {
      icon: Cpu,
      title: 'AI Task Estimation Engine',
      desc: 'Smart effort forecasting engine that evaluates historical team completion times and task complexity to suggest realistic delivery estimates.'
    },
    {
      icon: FileText,
      title: 'AI Meeting Notes Summary',
      desc: 'Automated extraction of action items, key decisions, deadline assignments, and owner tags directly from raw meeting transcripts.'
    }
  ];

  // Security Architecture Points
  const securityPoints = [
    {
      icon: Building2,
      title: 'Organization Isolation',
      desc: 'Strict logical database scoping ensuring complete tenant data boundaries and zero cross-organization data leakage.'
    },
    {
      icon: Lock,
      title: 'Secure JWT Authentication',
      desc: 'Industry-standard OAuth 2.0 & JWT authentication, encrypted session tokens, and secure password reset workflows.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Multi-tier authorization covering Super Admin, Company Admin, Project Manager, Employee, and External Client roles.'
    },
    {
      icon: Server,
      title: 'Secure REST APIs',
      desc: 'Hardened Express endpoints protected by Helmet security headers, CORS origin verification, and rate limiting.'
    },
    {
      icon: Activity,
      title: 'System Activity Audit Logs',
      desc: 'Comprehensive, immutable audit logs tracking user logins, account creation, permission edits, and financial events.'
    },
    {
      icon: HardDrive,
      title: 'Protected File Access',
      desc: 'Encrypted document vault with restricted download tokens and permission checks per project attachment.'
    }
  ];

  // Why Choose WorkForge Points
  const whyChoosePoints = [
    'Modern, clean, and intuitive interface with zero learning curve',
    'Secure multi-tenant architecture built for enterprise data privacy',
    'Centralized portfolio governance across projects, clients, and billing',
    'AI-assisted productivity tools that automate routine management tasks',
    'Highly scalable infrastructure designed for growing organizations',
    'Fully responsive layout optimized for desktop, tablet, and mobile'
  ];

  // Pricing Plans (Rupee Currency ₹)
  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      desc: 'Ideal for small agencies and boutique engineering teams.',
      priceMonthly: 1499,
      priceAnnual: 1199,
      features: [
        'Up to 5 Team Members',
        '10 Active Client Projects',
        '10 GB Encrypted File Vault',
        'Kanban Task Workflows',
        'Basic Time Tracking & Invoices',
        'Standard Email Support'
      ],
      popular: false,
      buttonText: 'Start Free Trial'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      desc: 'Engineered for growing digital agencies and software houses.',
      priceMonthly: 4999,
      priceAnnual: 3999,
      features: [
        'Up to 25 Team Members',
        'Unlimited Client Projects',
        '100 GB Encrypted File Vault',
        'AI Health Index & Risk Predictor',
        'Instant PDF Invoice Export (GST)',
        'Audit Trail & System Logs',
        'Priority Technical Support'
      ],
      popular: true,
      buttonText: 'Create Workspace'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      desc: 'Designed for large organizations requiring custom governance.',
      priceMonthly: 14999,
      priceAnnual: 11999,
      features: [
        'Unlimited Team Members & Orgs',
        'Dedicated Cloud Storage Instance',
        'Full AI Intelligence Suite Access',
        'Custom Roles & RBAC Matrix',
        '99.99% SLA & Dedicated Account Manager',
        '24/7 Phone & API SLA Support'
      ],
      popular: false,
      buttonText: 'Contact Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/90 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <WorkForgeLogo size="medium" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[15px] font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-red-600 dark:hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-red-600 dark:hover:text-white transition-colors">Solutions</a>
            <a href="#how-it-works" className="hover:text-red-600 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#ai-features" className="hover:text-red-600 dark:hover:text-white transition-colors">AI Features</a>
            <a href="#security" className="hover:text-red-600 dark:hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-red-600 dark:hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onOpenAuth('workspace')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[15px] transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2.5 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-white transition-colors rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 text-[15px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-all rounded-xl shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35"
                >
                  Start Free Trial
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden zoho-gradient-hero border-b border-slate-200/80 dark:border-slate-800/80">
        
        {/* Background Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI-Powered Multi-Tenant Project Management</span>
          </div>

          {/* Main Hero Heading (Desktop: 56-64px / Mobile: 34-40px) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Build Better Projects.{' '}
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Manage Smarter Teams.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-xl md:text-[21px] text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            WorkForge is a secure SaaS platform that enables organizations to manage projects, clients, employees, tasks, invoices, files, calendars, reports, and collaboration from one centralized workspace. Built with role-based access, organization isolation, and AI-powered productivity features.
          </p>

          {/* Hero CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/40 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-base rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Book a Demo</span>
            </button>
          </div>

          {/* Interactive Professional Dashboard Mockup Preview */}
          <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
            <div className="rounded-2xl border border-slate-300/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-md">
              
              {/* Mockup Top Application Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-3 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                    https://workforge.app/dashboard • Active Organization: Enterprise Workspace
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Sync Active</span>
                </div>
              </div>

              {/* Mockup Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-left">
                
                {/* Metric 1 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Collected Revenue</span>
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">₹14,85,000</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +18.4% this month</div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Active Projects</span>
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">12 Active</div>
                  <div className="text-[11px] text-blue-600 font-semibold mt-1">94% Sprint Completion</div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Billable Hours</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">342.5 Hrs</div>
                  <div className="text-[11px] text-purple-600 font-semibold mt-1">Stopwatch Live</div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>AI Health Index</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">96 / 100</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Low Portfolio Risk</div>
                </div>

              </div>

              {/* Kanban & Calendar Snippet Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 text-left">
                
                {/* Kanban Column Preview */}
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                    <span>Active Sprint Kanban Tasks</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 font-mono">4 Tasks</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-red-600 uppercase">
                        <span>High Priority</span>
                        <span className="text-slate-400">#TSK-104</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1">
                        Implement RBAC Tenant Scoping
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Assigned: Engineering Team</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase">
                        <span>Completed</span>
                        <span className="text-slate-400">#TSK-102</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1">
                        GST Invoice PDF Generator
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Export Ready • ₹45,000</div>
                    </div>
                  </div>
                </div>

                {/* Team & Calendar Preview */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-2">
                      Active Team Members
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">KC</div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Kavy Choudhary</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600">Company Admin</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">PM</div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Project Lead</span>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600">Manager</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Next Milestone: Client Review</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">Tomorrow</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. 10 FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
          <span>Enterprise Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Scale Operations
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          WorkForge unifies project governance, client relations, task workflows, team collaboration, and AI automation into one cohesive platform.
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-6 hover:border-red-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How WorkForge Streamlines Your Business
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Get up and running in minutes with our intuitive onboarding process.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-left relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="glass-panel p-6 relative flex flex-col justify-between">
                <div className="text-3xl font-black text-red-600 dark:text-rose-500 font-mono mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AI FEATURES SHOWCASE */}
      <section id="ai-features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-emerald-500/30">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Artificial Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI-Assisted Productivity & Decision Making
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              WorkForge integrates embedded AI algorithms to automate risk analysis, forecast task timelines, and synthesize raw meeting notes into structured deliverables.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {aiFeatures.map((ai, idx) => {
              const Icon = ai.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ai.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ai.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. SECURITY & MULTI-TENANT ARCHITECTURE */}
      <section id="security" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Trust Enterprise Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Security & Multi-Tenant Architecture
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Every organization operates inside its own isolated logical tenant boundary with enterprise encryption, RBAC permissions, and full audit trail transparency.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {securityPoints.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div key={idx} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{sec.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. DASHBOARD PREVIEW TABBED SWITCHER */}
      <section id="solutions" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
          <span>Unified Workspace Preview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore the Centralized WorkForge Suite
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Switch between dedicated workspace views to see how WorkForge simplifies daily operations.
        </p>

        {/* Tab Switcher */}
        <div className="mt-10 inline-flex flex-wrap justify-center p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 gap-1">
          {['dashboard', 'projects', 'tasks', 'calendar', 'reports', 'clients', 'invoices', 'team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePreviewTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all ${
                activePreviewTab === tab
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Preview Container */}
        <div className="mt-8 glass-panel p-8 text-left rounded-2xl border border-slate-300 dark:border-slate-800">
          {activePreviewTab === 'dashboard' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Executive Portfolio Dashboard</h3>
              <p className="text-xs text-slate-500 mb-4">Real-time financial metrics, project status breakdown, billable stopwatch stats, and activity logs.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Dashboard View]: Revenue ₹14,85,000 • Active Projects: 12 • Billable Hours: 342.5 Hrs • AI Health Score: 96/100
              </div>
            </div>
          )}

          {activePreviewTab === 'projects' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Projects & AI Portfolio Governance</h3>
              <p className="text-xs text-slate-500 mb-4">Track project budgets, sprint completion bars, assigned team members, and AI health scores.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Projects View]: Active Pipeline • FinTech Portal (₹4,50,000) • E-Commerce Redesign (₹8,20,000) • Mobile App QA
              </div>
            </div>
          )}

          {activePreviewTab === 'tasks' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kanban Task Board & Workflows</h3>
              <p className="text-xs text-slate-500 mb-4">4-column Kanban workflow (Planning, In Progress, Testing, Completed) with drag-and-drop support.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Kanban Board View]: 18 Active Tasks • Subtask Checklists • Hour Estimations vs Logged Stopwatch Time
              </div>
            </div>
          )}

          {activePreviewTab === 'calendar' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Calendar & Unified Schedule</h3>
              <p className="text-xs text-slate-500 mb-4">Visual calendar showing project milestones, sprint deadlines, client reviews, and team events.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Calendar View]: Synchronized Schedule • Next Release: Aug 12 • Client Review: Tomorrow 3:00 PM IST
              </div>
            </div>
          )}

          {activePreviewTab === 'reports' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reports & Executive Analytics</h3>
              <p className="text-xs text-slate-500 mb-4">Comprehensive portfolio reports covering revenue trends, team utilization rates, and expense ratios.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Analytics View]: Monthly MRR Trends • 94% Team Utilization Rate • Average Project Completion Velocity: 14 Days
              </div>
            </div>
          )}

          {activePreviewTab === 'clients' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Client Directory & Accounts</h3>
              <p className="text-xs text-slate-500 mb-4">Client contact directory, billing totals, GST tax registration IDs, and linked active contracts.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Client Profiles View]: Acme Tech Solutions (GSTIN: 27AAAAA0000A1Z5) • Total Billed: ₹12,50,000 • 3 Active Contracts
              </div>
            </div>
          )}

          {activePreviewTab === 'invoices' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invoicing & Client Billing Export</h3>
              <p className="text-xs text-slate-500 mb-4">Automated GST tax calculations, discounts, payment status tracking, and instant client-side PDF export.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Invoice Billing View]: Invoice #INV-2026-001 • Subtotal: ₹1,00,000 • GST 18%: ₹18,000 • Total: ₹1,18,000 [Download PDF]
              </div>
            </div>
          )}

          {activePreviewTab === 'team' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team Directory & HR Roles</h3>
              <p className="text-xs text-slate-500 mb-4">Organization member list, department structures, designations, and role-based permissions.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                [Team Directory View]: Executive Admin (Kavy Choudhary) • Project Managers (3) • Engineering Lead • Design Team (4)
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. WHY CHOOSE WORKFORGE */}
      <section className="py-20 md:py-28 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
                <span>The WorkForge Advantage</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Why Industry Leaders Choose WorkForge
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                WorkForge provides an end-to-end operational operating system designed specifically for organizations that require high-level governance, strict data security, and seamless client collaboration.
              </p>

              <div className="mt-8 space-y-4">
                {whyChoosePoints.map((point, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-sm text-slate-800 dark:text-slate-200 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Built for Growing Organizations</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether you manage a 5-person agency or a multi-department enterprise, WorkForge scales effortlessly without structural friction.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Architecture Model</span>
                  <span className="font-mono text-red-600 dark:text-rose-400 font-bold">Multi-Tenant Scoped</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Security Compliance</span>
                  <span className="font-mono text-emerald-600 font-bold">SOC 2 & RBAC</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Supported Currency</span>
                  <span className="font-mono text-blue-600 font-bold">Indian Rupee (₹) & GST</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
          <span>Predictable Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Flexible Plans for Every Stage
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Transparent pricing with zero hidden fees. Choose monthly or annual billing.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              billingCycle === 'monthly' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
              billingCycle === 'annual' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch text-left">
          {pricingPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all relative ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-red-500 shadow-xl -translate-y-2'
                    : 'bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">{plan.desc}</p>

                  <div className="mt-6 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 mr-2.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md ${
                    plan.popular
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Streamline Your Workflow?
          </h2>
          <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Start managing projects, clients, and teams from one secure workspace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-2xl border border-slate-700 transition-all"
            >
              <span>Contact Sales</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-slate-600 dark:text-slate-400">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <WorkForgeLogo size="small" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Build Better Projects. Manage Smarter Teams. A secure multi-tenant AI-powered project & client management SaaS platform.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Product</div>
            <ul className="space-y-2 font-medium">
              <li><a href="#features" className="hover:text-red-600 dark:hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-red-600 dark:hover:text-white">Pricing</a></li>
              <li><a href="#ai-features" className="hover:text-red-600 dark:hover:text-white">Updates & AI</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Resources</div>
            <ul className="space-y-2 font-medium">
              <li><a href="#how-it-works" className="hover:text-red-600 dark:hover:text-white">Documentation</a></li>
              <li><a href="#security" className="hover:text-red-600 dark:hover:text-white">Security & Audit</a></li>
              <li><button onClick={() => setDemoModalOpen(true)} className="hover:text-red-600 dark:hover:text-white text-left">Support & FAQ</button></li>
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Company & Legal</div>
            <ul className="space-y-2 font-medium">
              <li><a href="#solutions" className="hover:text-red-600 dark:hover:text-white">About WorkForge</a></li>
              <li><button onClick={() => setDemoModalOpen(true)} className="hover:text-red-600 dark:hover:text-white text-left">Contact Us</button></li>
              <li><span className="hover:text-red-600 dark:hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-red-600 dark:hover:text-white cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© 2026 WorkForge. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px]">Enterprise SaaS OS • SOC 2 & RBAC Compliant</div>
        </div>
      </footer>

      {/* DEMO / CONTACT SALES MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Book a Demo & Contact Sales</h3>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Schedule a personalized demonstration of WorkForge with our solution engineers or create a new trial workspace instantly.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Enterprise Workspace"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDemoModalOpen(false);
                  onOpenAuth('signup');
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md"
              >
                Submit & Start Trial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
