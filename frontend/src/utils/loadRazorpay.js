/**
 * Dynamic on-demand script loader for Razorpay Checkout
 * Prevents blocking initial page load & First Contentful Paint (FCP)
 */
let razorpayLoadingPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (razorpayLoadingPromise) return razorpayLoadingPromise;

  razorpayLoadingPromise = new Promise((resolve) => {
    // Check if script is already in DOM
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.warn('[Razorpay] Failed to load checkout.js CDN (may be blocked by ad-blocker or offline)');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayLoadingPromise;
};
