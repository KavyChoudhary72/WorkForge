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

  // 10 Core Features (Simple Everyday Language)
  const features = [
    {
      icon: Briefcase,
      title: 'Project Management',
      description: 'Track project progress, budgets, deadlines, and deliverables with ease.'
    },
    {
      icon: Users,
      title: 'Client Directory',
      description: 'Keep all your client contacts, details, notes, and billing history in one place.'
    },
    {
      icon: CheckSquare,
      title: 'Task Boards',
      description: 'Simple to-do lists and visual boards to help your team get work done faster.'
    },
    {
      icon: UserCheck,
      title: 'Team Management',
      description: 'See who is doing what, invite team members, and assign simple roles.'
    },
    {
      icon: FileText,
      title: 'Invoices & Billing',
      description: 'Create clean bills, track payments, calculate taxes, and download PDF invoices.'
    },
    {
      icon: FolderGit2,
      title: 'Files & Documents',
      description: 'Save, organize, and share documents and project files safely.'
    },
    {
      icon: Calendar,
      title: 'Calendar & Schedule',
      description: 'A clear team calendar so you never miss a due date or milestone.'
    },
    {
      icon: BarChart3,
      title: 'Reports & Numbers',
      description: 'Easy-to-read charts showing your income, completed tasks, and work hours.'
    },
    {
      icon: Bell,
      title: 'Friendly Reminders',
      description: 'Helpful alerts and deadline updates so everyone stays on the same page.'
    },
    {
      icon: Sparkles,
      title: 'Smart Tools',
      description: 'Helpful smart summaries and suggestions to save you time every day.'
    }
  ];

  // How It Works Steps
  const workflowSteps = [
    {
      step: '01',
      title: 'Create your workspace',
      desc: 'Set up your company space with your name and logo in less than a minute.'
    },
    {
      step: '02',
      title: 'Invite your team',
      desc: 'Add your coworkers and assign simple roles like manager or member.'
    },
    {
      step: '03',
      title: 'Add projects and tasks',
      desc: 'Organize your daily work with easy-to-use lists, checklists, and due dates.'
    },
    {
      step: '04',
      title: 'Deliver work & get paid',
      desc: 'Send professional invoices, track hours, and keep your clients happy.'
    }
  ];

  // Smart Tools (AI Features)
  const aiFeatures = [
    {
      icon: Sparkles,
      title: 'Project Health Check',
      desc: 'Quickly see if a project is running smoothly, on budget, and on track to finish on time.'
    },
    {
      icon: Cpu,
      title: 'Delivery Time Estimates',
      desc: 'Helpful suggestions on how long tasks might take based on previous projects.'
    },
    {
      icon: FileText,
      title: 'Meeting Notes Summary',
      desc: 'Turn long meeting notes into clean bullet points and clear action items automatically.'
    }
  ];

  // Security Points
  const securityPoints = [
    {
      icon: Building2,
      title: 'Private Workspace',
      desc: 'Your company information is completely private to your team and never shared.'
    },
    {
      icon: Lock,
      title: 'Safe Sign In',
      desc: 'Password protection and safe login keep your company account secure.'
    },
    {
      icon: ShieldCheck,
      title: 'Simple Team Roles',
      desc: 'Easily decide who can see invoices, edit projects, or add new tasks.'
    },
    {
      icon: Server,
      title: 'Protected Connections',
      desc: 'All information is safely encrypted just like your modern online banking app.'
    },
    {
      icon: Activity,
      title: 'Activity History',
      desc: 'See a clear history of important updates made to projects and invoices.'
    },
    {
      icon: HardDrive,
      title: 'Safe File Storage',
      desc: 'Store contracts and attachments safely with secure download links.'
    }
  ];

  // Why Choose WorkForge Points
  const whyChoosePoints = [
    'Clean, simple interface that anyone can use without special training',
    'Private workspace designed to keep all your company data safe',
    'Everything in one place: projects, clients, tasks, and billing',
    'Smart tools that save you time on notes, reminders, and estimates',
    'Works smoothly whether you have 2 people or 200 people',
    'Looks great and works fast on your computer, tablet, or phone'
  ];

  // Pricing Plans (Rupee Currency ₹)
  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      desc: 'Great for freelancers, small agencies, and new teams.',
      priceMonthly: 1499,
      priceAnnual: 1199,
      features: [
        'Up to 5 Team Members',
        '10 Active Projects',
        '10 GB File Storage',
        'Visual Task Boards',
        'Time Tracking & Invoices',
        'Helpful Email Support'
      ],
      popular: false,
      buttonText: 'Start Free Trial'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      desc: 'Best for growing companies and busy service teams.',
      priceMonthly: 4999,
      priceAnnual: 3999,
      features: [
        'Up to 25 Team Members',
        'Unlimited Projects',
        '100 GB File Storage',
        'Smart Project Health Checks',
        'Professional PDF Invoices (with GST)',
        'Activity History & Logs',
        'Priority Support'
      ],
      popular: true,
      buttonText: 'Create Workspace'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      desc: 'For larger companies that need custom limits and dedicated help.',
      priceMonthly: 14999,
      priceAnnual: 11999,
      features: [
        'Unlimited Team Members',
        'Unlimited File Storage',
        'All Smart Tools Included',
        'Custom Team Permissions',
        'Dedicated Phone & Email Support',
        'Personal Account Setup'
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
            <span>Simple Project & Client Management for Growing Teams</span>
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
            WorkForge makes it easy to run your business in one place. Keep track of your clients, projects, tasks, invoices, team members, and deadlines with a simple, friendly system anyone can use.
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
                  <span className="ml-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    WorkForge Dashboard • Active Workspace: Acme Studios
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Everything Updated</span>
                </div>
              </div>

              {/* Mockup Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-left">
                
                {/* Metric 1 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Total Earned</span>
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
                  <div className="text-[11px] text-blue-600 font-semibold mt-1">94% Finished</div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Hours Worked</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">342.5 Hrs</div>
                  <div className="text-[11px] text-purple-600 font-semibold mt-1">Timer active</div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <span>Project Health</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">96%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">On Track</div>
                </div>

              </div>

              {/* Kanban & Calendar Snippet Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 text-left">
                
                {/* Kanban Column Preview */}
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                    <span>Today's Task List</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 font-semibold">4 Tasks</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-red-600 uppercase">
                        <span>High Priority</span>
                        <span className="text-slate-400">Due Today</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1">
                        Finalize Client Proposal
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Assigned to: Design Team</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 uppercase">
                        <span>Completed</span>
                        <span className="text-slate-400">Paid</span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1">
                        Send Monthly Invoice
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Ready to send • ₹45,000</div>
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
                        <span className="text-[10px] font-semibold text-emerald-600">Admin</span>
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
                    <span>Next Review: Client Call</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Tomorrow</span>
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
          <span>Simple & Powerful Features</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Run Your Business
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Manage your clients, projects, tasks, invoices, and team in one simple, organized workspace.
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
              <span>Smart Assistance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Tools That Save You Time
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Use built-in smart tools to summarize meeting notes, check project status, and keep work moving on schedule.
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

      {/* 6. SECURITY SECTION */}
      <section id="security" className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy & Safety</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Keep Your Business Data Safe & Private
          </h2>
          <p className="mt-3 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Your files, invoices, and project details are kept completely private to your company and protected with industry-standard safety measures.
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
          <span>Interactive Preview</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          See How Simple It Is to Use
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Click any tab below to see how each part of WorkForge works.
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Overview Dashboard</h3>
              <p className="text-xs text-slate-500 mb-4">See your earnings, active projects, and urgent deadlines at a glance.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Revenue: ₹14,85,000 • Active Projects: 12 • Hours Worked: 342.5 Hrs • Project Health: 96%
              </div>
            </div>
          )}

          {activePreviewTab === 'projects' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Projects & Milestones</h3>
              <p className="text-xs text-slate-500 mb-4">Keep track of project progress, budgets, deadlines, and assigned team members.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Active Projects: Website Redesign (₹4,50,000) • Mobile App QA (₹8,20,000) • Marketing Campaign
              </div>
            </div>
          )}

          {activePreviewTab === 'tasks' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visual Task Boards</h3>
              <p className="text-xs text-slate-500 mb-4">Simple to-do lists and status cards so work gets finished on time.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                18 Active Tasks • Checklists • Priority Labels • Live Timers
              </div>
            </div>
          )}

          {activePreviewTab === 'calendar' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Calendar & Schedule</h3>
              <p className="text-xs text-slate-500 mb-4">Visual calendar showing project milestones, deadlines, client reviews, and meetings.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Upcoming Schedule: Project Delivery on Aug 12 • Client Review Tomorrow at 3:00 PM
              </div>
            </div>
          )}

          {activePreviewTab === 'reports' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reports & Numbers</h3>
              <p className="text-xs text-slate-500 mb-4">Easy charts showing your revenue trends, team work hours, and project milestones.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Monthly Income Trends • 94% Team Productivity • Average Delivery: 14 Days
              </div>
            </div>
          )}

          {activePreviewTab === 'clients' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Client Directory</h3>
              <p className="text-xs text-slate-500 mb-4">Client contact details, phone numbers, addresses, and billing history in one place.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Acme Tech Solutions • Total Billed: ₹12,50,000 • 3 Active Contracts
              </div>
            </div>
          )}

          {activePreviewTab === 'invoices' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Invoices & Billing</h3>
              <p className="text-xs text-slate-500 mb-4">Automatic tax and discount calculations with clean PDF invoice downloads.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Invoice #INV-2026-001 • Subtotal: ₹1,00,000 • GST 18%: ₹18,000 • Total: ₹1,18,000 [Download PDF]
              </div>
            </div>
          )}

          {activePreviewTab === 'team' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team Directory</h3>
              <p className="text-xs text-slate-500 mb-4">See team members, job roles, departments, and skills.</p>
              <div className="p-6 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                Admins • Project Managers • Developers • Designers
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
                <span>Why Teams Choose WorkForge</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Simple, Friendly Work Management
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                WorkForge gives you an all-in-one place to manage your daily work without confusing technical jargon or complicated training.
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Built for Growing Businesses</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether you have a team of 3 or 30, WorkForge is easy to set up and start using immediately.
              </p>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Account Setup</span>
                  <span className="text-red-600 dark:text-rose-400 font-bold">Private & Secure</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Data Protection</span>
                  <span className="text-emerald-600 font-bold">Encrypted & Safe</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Currency</span>
                  <span className="text-blue-600 font-bold">Indian Rupee (₹) & GST</span>
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
              Build Better Projects. Manage Smarter Teams. Simple, friendly project and client management for your business.
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
              <li><a href="#how-it-works" className="hover:text-red-600 dark:hover:text-white">How It Works</a></li>
              <li><a href="#security" className="hover:text-red-600 dark:hover:text-white">Privacy & Safety</a></li>
              <li><button onClick={() => setDemoModalOpen(true)} className="hover:text-red-600 dark:hover:text-white text-left">Help & FAQ</button></li>
            </ul>
          </div>

          {/* Company & Legal Links */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Company</div>
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
          <div className="mt-2 sm:mt-0 font-medium text-[11px]">Simple & Secure Work Management</div>
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
