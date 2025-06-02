#!/usr/bin/env node

/**
 * Test script to verify SPA routing works correctly on Vercel
 * This script tests various routes to ensure they return the correct response
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.VERCEL_URL || 'https://pet-smart-admin.vercel.app';
const ROUTES_TO_TEST = [
  '/',
  '/dashboard',
  '/users',
  '/products',
  '/orders',
  '/appointments',
  '/pets',
  '/messages',
  '/notifications',
  '/analytics',
  '/settings',
  '/admin-management',
  '/users/123',
  '/orders/456',
  '/products/789'
];

console.log('🧪 Testing SPA Routing on Vercel...');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log('─'.repeat(60));

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Test a single route
 */
async function testRoute(route) {
  const url = `${BASE_URL}${route}`;
  
  try {
    const response = await makeRequest(url);
    
    // Check if response is successful
    const isSuccess = response.statusCode === 200;
    
    // Check if response contains Vue app content
    const hasVueApp = response.body.includes('<div id="app">') || 
                      response.body.includes('<!DOCTYPE html>');
    
    // Check content type
    const contentType = response.headers['content-type'] || '';
    const isHTML = contentType.includes('text/html');
    
    const status = isSuccess && hasVueApp && isHTML ? '✅' : '❌';
    
    console.log(`${status} ${route.padEnd(20)} | Status: ${response.statusCode} | HTML: ${isHTML ? 'Yes' : 'No'} | Vue: ${hasVueApp ? 'Yes' : 'No'}`);
    
    return {
      route,
      success: isSuccess && hasVueApp && isHTML,
      statusCode: response.statusCode,
      isHTML,
      hasVueApp
    };
    
  } catch (error) {
    console.log(`❌ ${route.padEnd(20)} | Error: ${error.message}`);
    return {
      route,
      success: false,
      error: error.message
    };
  }
}

/**
 * Test all routes
 */
async function testAllRoutes() {
  console.log('Route'.padEnd(22) + '| Status | HTML | Vue App');
  console.log('─'.repeat(60));
  
  const results = [];
  
  for (const route of ROUTES_TO_TEST) {
    const result = await testRoute(route);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('─'.repeat(60));
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All routes are working correctly!');
    console.log('✅ SPA routing is properly configured on Vercel');
  } else {
    console.log('\n⚠️  Some routes are not working correctly');
    console.log('❌ Please check the Vercel configuration');
    
    // Show failed routes
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n🔍 Failed routes:');
      failed.forEach(f => {
        console.log(`   • ${f.route} - ${f.error || `Status: ${f.statusCode}`}`);
      });
    }
  }
  
  return successful === total;
}

/**
 * Main execution
 */
async function main() {
  try {
    const allPassed = await testAllRoutes();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testAllRoutes, testRoute };
