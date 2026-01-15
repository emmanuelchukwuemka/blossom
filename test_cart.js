const axios = require('axios');

async function testCartEndpoint() {
  try {
    console.log('Testing cart endpoint...');
    
    const response = await axios.post('http://localhost:5001/api/v1/upload-to-cart', {
      id: null,
      user_id: 1,
      title: "Test Product",
      prime: "Prime",
      description: "Test Description",
      images: "test.jpg",
      price: "100",
      categoryId: 1,
      sellerId: 1,
      moq: 1,
      video: "",
      countryId: 1,
      stateId: 1,
      colors: "red",
      size: "M",
      rating: 5,
      quantity: 2
    });
    
    console.log('Response:', response.data);
    console.log('Cart endpoint test successful!');
  } catch (error) {
    console.error('Error testing cart endpoint:', error.response?.data || error.message);
  }
}

testCartEndpoint();