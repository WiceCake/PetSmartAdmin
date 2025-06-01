// Test script to verify table fixes
// Run this in browser console to test pagination and loading behavior

console.log('🧪 Testing Admin Dashboard Table Fixes...');

// Test 1: Check if infinite loading loop is fixed
function testInfiniteLoadingFix() {
  console.log('\n📊 Test 1: Infinite Loading Loop Fix');
  
  // Monitor API calls for 10 seconds
  let apiCallCount = 0;
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    if (args[0] && args[0].includes('/rest/v1/')) {
      apiCallCount++;
      console.log(`API Call #${apiCallCount}:`, args[0]);
    }
    return originalFetch.apply(this, args);
  };
  
  setTimeout(() => {
    window.fetch = originalFetch;
    if (apiCallCount > 5) {
      console.error('❌ FAIL: Too many API calls detected:', apiCallCount);
    } else {
      console.log('✅ PASS: API calls within normal range:', apiCallCount);
    }
  }, 10000);
  
  console.log('Monitoring API calls for 10 seconds...');
}

// Test 2: Check pagination consistency
function testPaginationConsistency() {
  console.log('\n🔄 Test 2: Pagination Consistency');
  
  const usersTable = document.querySelector('.modern-table');
  const petsTable = document.querySelector('.modern-data-table');
  
  if (usersTable) {
    const usersFooter = usersTable.querySelector('.v-data-table-footer');
    console.log('Users table footer found:', !!usersFooter);
  }
  
  if (petsTable) {
    const petsFooter = petsTable.querySelector('.v-data-table-footer');
    console.log('Pets table footer found:', !!petsFooter);
  }
}

// Test 3: Check search functionality
function testSearchFunctionality() {
  console.log('\n🔍 Test 3: Search Functionality');
  
  const searchInput = document.querySelector('input[placeholder*="Search"]');
  if (searchInput) {
    console.log('Search input found');
    
    // Test search without triggering infinite loop
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input'));
    
    setTimeout(() => {
      console.log('Search test completed - check for loading loops');
    }, 2000);
  } else {
    console.log('Search input not found');
  }
}

// Test 4: Check footer styling consistency
function testFooterStyling() {
  console.log('\n🎨 Test 4: Footer Styling Consistency');
  
  const footers = document.querySelectorAll('.v-data-table-footer');
  footers.forEach((footer, index) => {
    const styles = window.getComputedStyle(footer);
    console.log(`Footer ${index + 1}:`, {
      padding: styles.padding,
      background: styles.backgroundColor,
      borderTop: styles.borderTop
    });
  });
}

// Test 5: Check responsive design
function testResponsiveDesign() {
  console.log('\n📱 Test 5: Responsive Design');
  
  const originalWidth = window.innerWidth;
  
  // Test mobile breakpoint
  window.resizeTo(768, 600);
  setTimeout(() => {
    const mobileFooters = document.querySelectorAll('.v-data-table-footer');
    console.log('Mobile layout footers:', mobileFooters.length);
    
    // Restore original width
    window.resizeTo(originalWidth, window.innerHeight);
  }, 1000);
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting comprehensive table tests...');
  
  testInfiniteLoadingFix();
  testPaginationConsistency();
  testSearchFunctionality();
  testFooterStyling();
  testResponsiveDesign();
  
  console.log('\n✨ All tests initiated. Check console for results.');
}

// Navigation helper
function navigateToPage(page) {
  const routes = {
    users: '/users',
    pets: '/pets'
  };
  
  if (routes[page]) {
    window.location.href = routes[page];
  } else {
    console.log('Available pages:', Object.keys(routes));
  }
}

// Export test functions
window.tableTests = {
  runAll: runAllTests,
  infiniteLoading: testInfiniteLoadingFix,
  pagination: testPaginationConsistency,
  search: testSearchFunctionality,
  styling: testFooterStyling,
  responsive: testResponsiveDesign,
  navigate: navigateToPage
};

console.log('🔧 Table test utilities loaded!');
console.log('Usage:');
console.log('  tableTests.runAll() - Run all tests');
console.log('  tableTests.navigate("users") - Go to users page');
console.log('  tableTests.navigate("pets") - Go to pets page');
console.log('  tableTests.infiniteLoading() - Test loading loop fix');
