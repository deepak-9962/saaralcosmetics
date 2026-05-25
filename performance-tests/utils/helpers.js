/**
 * Helper utilities and mock payload builders for Saaral Cosmetics performance tests.
 */
import { sleep, check } from 'k6';
import { fail } from 'k6';
import { CONFIG } from './config.js';

// Import k6 HTML reporter & text summary dependencies (cached locally by k6)
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Standardized list of categories based on actual website
export const CATEGORIES = ['face-cream', 'face-wash', 'soap', 'nalangu-maavu'];

// Standardized list of search terms based on actual products
export const SEARCH_QUERIES = ['soap', 'cream', 'face wash', 'herbal', 'saaral'];

// Fake names, phones, and addresses for checkout tests
const FAKE_NAMES = ['Aravind Swamy', 'Deepika Pillai', 'Karthik Raja', 'Meera Nair', 'Sanjay Kumar', 'Priya Dharshini'];
const FAKE_STREETS = ['12 Luxury Garden Street', '45 Rose Apothecary Road', '88 Saffron Boulevard', '101 Lotus Residency', '3A Sandalwood Avenue'];
const FAKE_CITIES = ['Chennai', 'Coimbatore', 'Bangalore', 'Madurai', 'Trichy'];
const FAKE_STATES = ['Tamil Nadu', 'Karnataka', 'Kerala'];
const FAKE_PINCODES = ['600001', '641001', '560001', '625001', '620001'];

/**
 * Natural user think time (delays flow between 1.5s to 4.5s)
 */
export function thinkTime() {
  const delay = Math.random() * 3 + 1.5;
  sleep(delay);
}

/**
 * Rapid interaction sleep for category switching (delays 200ms to 600ms)
 */
export function rapidInteractionTime() {
  const delay = Math.random() * 0.4 + 0.2;
  sleep(delay);
}

/**
 * Pick a random element from an array
 */
export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Validate http response code and expected structure
 * @param {object} res k6 http response
 * @param {string} name Context name of the request
 * @param {boolean} isJson Whether we expect a JSON payload
 * @returns {boolean}
 */
export function validateResponse(res, name, isJson = true) {
  const checks = {};
  
  // Status check
  checks[`${name} status is 200/201/204`] = (r) => r.status === 200 || r.status === 201 || r.status === 204;
  
  // Timeout check
  checks[`${name} not timed out`] = (r) => r.timings.duration < CONFIG.timeouts.apiCall;
  
  if (isJson && res.status === 200) {
    // Body JSON parsing check
    checks[`${name} body is valid JSON`] = (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    };
  }

  const result = check(res, checks);
  if (!result) {
    console.error(`Assertion failed for [${name}]: Status=${res.status}, Error=${res.error}, ResponseBody=${res.body ? res.body.substring(0, 150) : 'empty'}`);
  }
  return result;
}

/**
 * Generate a complete realistic checkout payload
 * @param {Array} items Array of cart items
 * @param {number} subtotal Total price of items
 * @returns {object} Order payload matching createOrder input
 */
export function generateFakeOrderPayload(items, subtotal) {
  const name = randomChoice(FAKE_NAMES);
  const phone = '9' + Math.floor(100000000 + Math.random() * 900000000); // 10 digit Indian number starting with 9
  const email = name.toLowerCase().replace(' ', '.') + '@gmail.com';
  const address1 = randomChoice(FAKE_STREETS);
  const address2 = 'Apartment ' + Math.floor(Math.random() * 20 + 1);
  const city = randomChoice(FAKE_CITIES);
  const state = randomChoice(FAKE_STATES);
  const pincode = randomChoice(FAKE_PINCODES);
  
  const shippingCharge = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingCharge;

  // Generate order number in helper using high-resolution unique hashes (VU + timestamp + random)
  const vuId = typeof __VU !== 'undefined' ? __VU : Math.floor(Math.random() * 100);
  const iterId = typeof __ITER !== 'undefined' ? __ITER : Math.floor(Math.random() * 100);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.getTime().toString().slice(-6); // last 6 digits of timestamp
  const orderNumber = `SAARAL-${dateStr}-${vuId}-${iterId}-${timeStr}`;

  return {
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    address_line1: address1,
    address_line2: address2,
    city: city,
    state: state,
    pincode: pincode,
    items: items,
    subtotal: subtotal,
    shipping_charge: shippingCharge,
    total: total,
    order_number: orderNumber // Include directly in standard payload
  };
}

/**
 * Universal k6 Summary reporter handler to generate terminal, JSON, and HTML reports.
 */
export function generateReportsSummary(data) {
  // Ensure the report path is readable and accessible
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-tests/reports/summary.json': JSON.stringify(data, null, 2),
    'performance-tests/reports/summary.html': htmlReport(data, {
      title: 'Saaral Cosmetics - Performance Validation Report',
    }),
  };
}
