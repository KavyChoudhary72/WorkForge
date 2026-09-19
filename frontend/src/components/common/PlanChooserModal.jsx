import React, { useState } from 'react';
import { X, Check, ShieldCheck, CreditCard } from 'lucide-react';

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

export default function PlanChooserModal({ onClose, isExpired, showTrialOption, apiFetch, silentRefresh, updateCurrentUser, currentPlan }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [activatingTrial, setActivatingTrial] = useState(false);

  const plans = [
    {
      name: 'Pro Plan (Monthly)',
      cycle: 'monthly',
      price: '₹2,499',
      billing: 'per month',
      features: [
        'Unlimited Projects & Clients',
        'Time Tracking & Log Sheets',
        'Razorpay Payment Gateway Integration',
        'WhatsApp Business Notifications',
        'WorkForge AI Hub Assistance',
        '100GB Storage Space'
      ],
      popular: true
    },
    {
      name: 'Pro Plan (Quarterly)',
      cycle: 'quarterly',
      price: '₹6,499',
      billing: 'per 3 months',
      features: [
        'Save 15% vs Monthly pricing',
        'Unlimited Projects & Clients',
        'Time Tracking & Log Sheets',
        'Razorpay Payment Gateway Integration',
        'WhatsApp Business Notifications',
        'WorkForge AI Hub Assistance',
        '100GB Storage Space'
      ]
    },
    {
      name: 'Pro Plan (Annually)',
      cycle: 'annually',
      price: '₹22,499',
      billing: 'per year',
      features: [
        'Save 25% vs Monthly pricing',
        'Unlimited Projects & Clients',
        'Time Tracking & Log Sheets',
        'Razorpay Payment Gateway Integration',
        'WhatsApp Business Notifications',
        'WorkForge AI Hub Assistance',
        '100GB Storage Space'
      ]
    }
  ];

  const handleSubscribePlan = async (plan) => {
    setLoadingPlan(plan.cycle);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setLoadingPlan(null);
        return;
      }

      // 1. Create order on the backend
      const { res: orderRes, data: orderData } = await apiFetch('/payments/subscription-order', {
        method: 'POST',
        body: JSON.stringify({ planName: 'Pro Plan', cycle: plan.cycle })
      });

      if (!orderRes.ok) {
        alert(orderData.message || 'Failed to initialize subscription checkout. Please make sure the system Razorpay keys are configured.');
        setLoadingPlan(null);
        return;
      }

      const { keyId, orderId, amount, currency } = orderData;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'WorkForge Enterprise',
        description: `Upgrade to ${plan.name}`,
        order_id: orderId,
        handler: async function (response) {
          // 3. Verify Signature on backend on payment success
          const { res: verifyRes, data: verifyData } = await apiFetch('/payments/subscription-verify', {
            method: 'POST',
            body: JSON.stringify({
              planName: 'Pro Plan',
              cycle: plan.cycle,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });

          if (verifyRes.ok && verifyData.success && verifyData.user) {
            updateCurrentUser(verifyData.user);
            alert(`Payment successfully verified! Welcome to WorkForge Pro!`);
            onClose();
          } else {
            alert(verifyData.message || 'Payment signature verification failed.');
          }
          setLoadingPlan(null);
        },
        prefill: {
          name: '',
          email: '',
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
      alert('An error occurred while launching Razorpay payment window.');
      setLoadingPlan(null);
    }
  };

  const handleStartTrial = async () => {
    setActivatingTrial(true);
    try {
      const { res, data } = await apiFetch('/auth/activate-trial', { method: 'POST' });
      if (res.ok && data.user) {
        updateCurrentUser(data.user);
        alert('Your 7-day free trial has been activated!');
        onClose();
      } else {
        alert(data.message || 'Failed to activate trial. Please try again.');
      }
    } catch (err) {
      alert('An error occurred during trial activation.');
    } finally {
      setActivatingTrial(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8">
        
        {/* Close Button - Only show if the workspace is not currently blocked/expired */}
        {!isExpired && !showTrialOption && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 bg-slate-100 dark:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center max-w-lg mx-auto space-y-2">
          <div className="flex justify-center">
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Choose Subscription Plan</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Unlock Your Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Subscribe to a billing plan to continue collaborating, tracking time, generating automated invoices, and using AI analysis.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {plans.map((p) => {
            const isCurrent = currentPlan === p.name;
            return (
              <div 
                key={p.name} 
                className={`bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 flex flex-col justify-between border relative transition-all ${
                  p.popular 
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    Recommended
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{p.name}</h3>
                    <div className="flex items-baseline space-x-1">
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

                <div className="pt-6">
                  <button
                    disabled={loadingPlan !== null || isCurrent}
                    onClick={() => handleSubscribePlan(p)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                      isCurrent
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : p.popular
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {isCurrent 
                        ? 'Current Plan' 
                        : loadingPlan === p.cycle 
                          ? 'Initializing...' 
                          : 'Subscribe Now'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Trial option rendered below packages */}
        {showTrialOption && (
          <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Not ready to subscribe? You can start with a trial first.
            </div>
            <button
              disabled={activatingTrial}
              onClick={handleStartTrial}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-xl transition-all shadow-xs border border-slate-300 dark:border-slate-700"
            >
              {activatingTrial ? 'Activating Trial...' : 'Start 7-Day Free Trial (No Card Required)'}
            </button>
          </div>
        )}

        {/* Small Notice */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          * Subscriptions can be canceled at any time. Prices are inclusive of local tax filing audits. Security certificate v3.4 active.
        </div>
      </div>
    </div>
  );
}
