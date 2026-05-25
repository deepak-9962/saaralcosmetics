/**
 * Cart Page Performance Test
 * 
 * Objectives:
 * - Measure `/cart` page HTML load speed.
 * - Manage a local simulated cart state within k6 to model realistic user shopping states.
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { CONFIG } from '../utils/config.js';
import { THRESHOLDS } from '../utils/thresholds.js';
import { validateResponse, thinkTime, generateReportsSummary } from '../utils/helpers.js';

const cartLoadTrend = new Trend('cart_page_load_duration');

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 }
  ],
  thresholds: THRESHOLDS.global
};

export default function () {
  const commonHeaders = CONFIG.headers.common;

  // 1. Visit the `/cart` page
  const pageRes = http.get(`${CONFIG.baseUrl}/cart`, {
    headers: commonHeaders,
    timeout: CONFIG.timeouts.pageLoad
  });
  cartLoadTrend.add(pageRes.timings.duration);
  validateResponse(pageRes, 'Cart Page HTML', false);

  // Initialize a mock cart for the current virtual user session
  const mockCart = [];

  // 2. Simulate Adding a Product to Cart
  const item1 = {
    product_id: 'b7fc81ca-928a-4b75-b163-cf1dc46cbf9c',
    name: 'Kuppaimeni Soap',
    price: 35,
    quantity: 1,
    variant_name: '100g',
    image: '/images/cat-soap.webp'
  };
  mockCart.push(item1);
  thinkTime();

  // 3. Simulate Updating Quantity of the item
  mockCart[0].quantity = 2;
  thinkTime();

  // 4. Simulate Adding another product
  const item2 = {
    product_id: 'f9a5bbe7-a1fd-46e9-a5de-86162ed5766e',
    name: 'Activated Charcoal Soap',
    price: 40,
    quantity: 1,
    variant_name: '100g',
    image: '/images/cat-soap.webp'
  };
  mockCart.push(item2);
  thinkTime();

  // 5. Simulate Removing item1 from Cart
  const index = mockCart.findIndex(i => i.product_id === 'b7fc81ca-928a-4b75-b163-cf1dc46cbf9c');
  if (index > -1) {
    mockCart.splice(index, 1);
  }
  
  thinkTime();
}

export function handleSummary(data) {
  return generateReportsSummary(data);
}
