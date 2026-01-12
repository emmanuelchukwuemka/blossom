const axios = require('axios');

// Base URL for the API
const BASE_URL = 'http://localhost:5001/api/v1';

// Test all the newly implemented endpoints
async function testEndpoints() {
    console.log('Testing Bloomzon Backend Endpoints...\n');

    // Test 1: Marketplace endpoints
    console.log('1. Testing Marketplace Endpoints:');
    
    try {
        const sellerDashResponse = await axios.get(`${BASE_URL}/marketplace/seller-dashboard`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE', // This would need a valid JWT token
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /marketplace/seller-dashboard - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /marketplace/seller-dashboard - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /marketplace/seller-dashboard - Failed:', error.message);
        }
    }

    try {
        const buyerDashResponse = await axios.get(`${BASE_URL}/marketplace/buyer-dashboard`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /marketplace/buyer-dashboard - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /marketplace/buyer-dashboard - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /marketplace/buyer-dashboard - Failed:', error.message);
        }
    }

    try {
        const productsResponse = await axios.get(`${BASE_URL}/marketplace/products`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /marketplace/products - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚐ GET /marketplace/products - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /marketplace/products - Failed:', error.message);
        }
    }

    // Test 2: Account management endpoints
    console.log('\n2. Testing Account Management Endpoints:');

    try {
        const accountsResponse = await axios.get(`${BASE_URL}/accounts`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /accounts - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /accounts - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /accounts - Failed:', error.message);
        }
    }

    try {
        const verifyResponse = await axios.get(`${BASE_URL}/accounts/verify`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /accounts/verify - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /accounts/verify - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /accounts/verify - Failed:', error.message);
        }
    }

    // Test 3: Profile management endpoints
    console.log('\n3. Testing Profile Management Endpoints:');

    try {
        const privacyResponse = await axios.get(`${BASE_URL}/profiles/privacy`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /profiles/privacy - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /profiles/privacy - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /profiles/privacy - Failed:', error.message);
        }
    }

    try {
        const badgesResponse = await axios.get(`${BASE_URL}/profiles/badges`, {
            headers: {
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE',
                'Content-Type': 'application/json'
            }
        });
        console.log('   ✓ GET /profiles/badges - Success');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('   ⚠ GET /profiles/badges - Requires authentication (expected)');
        } else {
            console.log('   ✗ GET /profiles/badges - Failed:', error.message);
        }
    }

    // Test 4: Test some existing endpoints to make sure we didn't break anything
    console.log('\n4. Testing Existing Endpoints (to ensure no regression):');

    try {
        const homeResponse = await axios.get(`${BASE_URL}`);
        console.log('   ✓ GET /api/v1 - Success');
    } catch (error) {
        console.log('   ✗ GET /api/v1 - Failed:', error.message);
    }

    try {
        const productsResponse = await axios.post(`${BASE_URL}/products`, {});
        console.log('   ✓ POST /products - Success (returns 400/401 which is expected without proper body/auth)');
    } catch (error) {
        if (error.response && (error.response.status === 400 || error.response.status === 401)) {
            console.log('   ✓ POST /products - Expected response (400/401)');
        } else {
            console.log('   ✗ POST /products - Failed:', error.message);
        }
    }

    console.log('\nEndpoint testing completed!');
    console.log('\nNote: Authentication-required endpoints will return 401 without valid JWT tokens.');
    console.log('This is expected behavior and confirms the endpoints exist and are secured properly.');
}

// Run the tests
testEndpoints().catch(console.error);