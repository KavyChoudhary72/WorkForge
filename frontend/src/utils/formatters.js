/**
 * Indian Business Localization & Currency Formatters
 */

/**
 * Format numbers into Indian Rupees (INR ₹)
 * Examples: 150000 -> ₹1,50,000 | 1500000 -> ₹15,00,000
 */
export function formatINR(amount = 0) {
  const numericVal = Number(amount) || 0;
  return '₹' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(numericVal);
}

/**
 * Format Indian Phone Numbers (+91)
 */
export function formatIndianPhone(phone = '') {
  if (!phone) return '+91 98765 43210';
  if (phone.startsWith('+91')) return phone;
  return `+91 ${phone}`;
}

/**
 * Validate GSTIN (Indian GST Number format: 22AAAAA0000A1Z5)
 */
export function validateGSTIN(gstin = '') {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.trim());
}
