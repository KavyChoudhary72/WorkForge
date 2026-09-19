import React, { useState } from 'react';
import { X, Check, Crown, Zap, Shield, CreditCard, Sparkles } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PlanChooserModal({
  onClose,
  isExpired = false,
  showTrialOption = false,
  apiFetch,
  silentRefresh,
  updateCurrentUser,
  currentPlan = 'Pro Plan'
}) {
  const [cycle, setCycle] = useState('monthly'); // 'monthly' | 'quarterly' | 'annually'
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      description: 'Ideal for small teams and independent contractors.',
      price: cycle === 'monthly' ? '₹999' : cycle === 'quarterly' ? '₹2,549' : '₹8,999',
      billing: cycle === 'monthly' ? '/ month' : cycle === 'quarterly' ? '/ 3 months' : '/ year',
      amount: cycle === 'monthly' ? 999 : cycle === 'quarterly' ? 2549 : 8999,
      features: [
        'Up to 10 Projects & 15 Clients',
        'Visual Task Boards',
        'Basic Invoices & Billing',
        'Time Tracking & Timesheets',
        '10 GB Cloud Storage',
        'Standard Email Support'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Best for growing businesses managing multiple clients.',
      price: cycle === 'monthly' ? '₹2,499' : cycle === 'quarterly' ? '₹6,499' : '₹22,499',
      billing: cycle === 'monthly' ? '/ month' : cycle === 'quarterly' ? '/ 3 months' : '/ year',
      amount: cycle === 'monthly' ? 2499 : cycle === 'quarterly' ? 6499 : 22499,
      features: [
        'Unlimited Projects & Clients',
        'Online Payment Gateway (Razorpay)',
        'Smart AI Assistant Hub',
        'WhatsApp & Email Notifications',
        '100 GB Cloud Storage',
        'Detailed Reports & PDF Export',
        'Priority Customer Support'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Full capabilities for scaling agencies and large companies.',
      price: cycle === 'monthly' ? '₹4,999' : cycle === 'quarterly' ? '₹12,999' : '₹44,999',
      billing: cycle === 'monthly' ? '/ month' : cycle === 'quarterly' ? '/ 3 months' : '/ year',
      amount: cycle === 'monthly' ? 4999 : cycle === 'quarterly' ? 12999 : 44999,
      features: [
        'Everything in Pro Plan',
        'Unlimited Team Members',
        'Custom Invoices & Company Branding',
        '500 GB Cloud Storage Space',
        'Advanced Analytics & Audit Logs',
        'Dedicated Account Manager',
        '24/7 VIP Phone & Chat Support'
      ],
      popular: false
    }
  ];

  // 1. Instant 1-Click Manual Upgrade (Reliable & Immediate)
  const handleInstantUpgrade = async (plan) => {
    setLoadingPlan(plan.id);
    try {
      const { res, data } = await apiFetch('/auth/choose-plan', {
        method: 'POST',
        body: JSON.stringify({
          plan: plan.name,
          cycle,
          paymentMethod: 'Manual Direct Purchase'
        })
      });

      if (res.ok && data.user) {
        if (updateCurrentUser) updateCurrentUser(data.user);
        if (silentRefresh) await silentRefresh();
        setSuccessMessage(`Success! You have purchased the ${plan.name} (${cycle}).`);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      } else {
        alert(data.message || 'Failed to process plan purchase.');
      }
    } catch (err) {
      console.error('Instant upgrade failed', err);
      alert('Network error while processing purchase.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // 2. Online Payment Gateway (Razorpay)
  const handleRazorpayPayment = async (plan) => {
    setLoadingPlan(plan.id);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Payment gateway script failed to load. Please check your internet connection.');
        setLoadingPlan(null);
        return;
      }

      const { res: orderRes, data: orderData } = await apiFetch('/payments/subscription-order', {
        method: 'POST',
        body: JSON.stringify({ planName: plan.name, cycle })
      });

      if (!orderRes.ok) {
        // If order creation fails (e.g., test credentials issue), give option to use instant upgrade
        const confirmFallback = window.confirm(
          (orderData.message || 'Online payment gateway is temporarily unavailable.') +
          '\n\nWould you like to activate the plan directly using Instant 1-Click Purchase instead?'
        );
        if (confirmFallback) {
          await handleInstantUpgrade(plan);
        }
        setLoadingPlan(null);
        return;
      }

      const { keyId, orderId, amount, currency } = orderData;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'WorkForge SaaS Platform',
        description: `Purchase ${plan.name} (${cycle})`,
        order_id: orderId,
        handler: async function (response) {
          const { res: verifyRes, data: verifyData } = await apiFetch('/payments/subscription-verify', {
            method: 'POST',
            body: JSON.stringify({
              planName: plan.name,
              cycle,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          if (verifyRes.ok && verifyData.success && verifyData.user) {
            if (updateCurrentUser) updateCurrentUser(verifyData.user);
            if (silentRefresh) await silentRefresh();
            setSuccessMessage(`Payment verified! You are now subscribed to ${plan.name}.`);
            setTimeout(() => {
              if (onClose) onClose();
            }, 1500);
          } else {
            alert(verifyData.message || 'Payment signature verification failed.');
          }
          setLoadingPlan(null);
        },
        prefill: {
          name: '',
          email: ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error during online payment', error);
      alert('An error occurred during payment processing.');
      setLoadingPlan(null);
    }
  };

  const handleStartTrial = async () => {
    setActivatingTrial(true);
    try {
      const { res, data } = await apiFetch('/auth/activate-trial', { method: 'POST' });
      if (res.ok && data.user) {
        if (updateCurrentUser) updateCurrentUser(data.user);
        alert('Your 7-day free trial has been activated!');
        if (onClose) onClose();
      } else {
        alert(data.message || 'Failed to activate trial.');
      }
    } catch (err) {
      alert('An error occurred during trial activation.');
    } finally {
      setActivatingTrial(false);
    }
  };

  const isCurrentPlan = (planName) => {
    if (!currentPlan) return false;
    return currentPlan.toLowerCase().includes(planName.toLowerCase().replace(' plan', ''));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExpired && !showTrialOption && onClose) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8 transition-all">
        
        {/* Close Button */}
        {!isExpired && !showTrialOption && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center justify-center space-x-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="flex justify-center">
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Subscription Plans</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upgrade anytime to unlock higher team limits, online client billing, smart AI tools, and full priority support.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  cycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCycle('quarterly')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  cycle === 'quarterly'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Quarterly</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">Save 15%</span>
              </button>
              <button
                type="button"
                onClick={() => setCycle('annually')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  cycle === 'annually'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Annually</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">Save 25%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((p) => {
            const isCurrent = isCurrentPlan(p.name);
            const isLoading = loadingPlan === p.id;

            return (
              <div
                key={p.id}
                className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col justify-between border relative transition-all ${
                  p.popular
                    ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 dark:border-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{p.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">{p.description}</p>
                    
                    <div className="flex items-baseline space-x-1 pt-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{p.price}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{p.billing}</span>
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Purchase Actions */}
                <div className="pt-6 space-y-2">
                  <button
                    type="button"
                    disabled={isLoading || isCurrent}
                    onClick={() => handleInstantUpgrade(p)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : p.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {isCurrent
                        ? 'Active Plan'
                        : isLoading
                        ? 'Activating...'
                        : 'Instant Purchase (1-Click)'}
                    </span>
                  </button>

                  {!isCurrent && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRazorpayPayment(p)}
                      className="w-full py-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200 dark:border-slate-800"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pay with Cards / UPI</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Trial Button (Only shown if trial not yet activated) */}
        {showTrialOption && (
          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Want to test the platform first? You can start with our 7-day free trial.
            </div>
            <button
              disabled={activatingTrial}
              onClick={handleStartTrial}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              {activatingTrial ? 'Starting Trial...' : 'Start 7-Day Free Trial (No Card Needed)'}
            </button>
          </div>
        )}

        {/* Friendly Reassurance Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2 flex items-center justify-center space-x-4">
          <span className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cancel anytime with 1 click</span>
          </span>
          <span>•</span>
          <span>Instant workspace activation</span>
          <span>•</span>
          <span>256-bit secure checkout</span>
        </div>
      </div>
    </div>
  );
}
