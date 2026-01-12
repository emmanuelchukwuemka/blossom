const db = require('../../Database/db');
const expressAsyncHandler = require('express-async-handler');

// Get seller dashboard data
const getSellerDashboard = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get seller statistics
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM products WHERE seller_id = ?) as total_products,
      (SELECT COUNT(*) FROM orders WHERE seller_id = ? AND status != 'cancelled') as total_orders,
      (SELECT COUNT(*) FROM orders WHERE seller_id = ? AND status = 'pending') as pending_orders,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE seller_id = ? AND status = 'completed') as total_revenue
  `;
  
  db.query(statsQuery, [userId, userId, userId, userId], (err, stats) => {
    if (err) {
      console.error('Error fetching seller dashboard stats:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch seller dashboard data'
      });
    }
    
    // Get recent orders
    const ordersQuery = `
      SELECT o.*, u.name as customer_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.seller_id = ? 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `;
    
    db.query(ordersQuery, [userId], (err, recentOrders) => {
      if (err) {
        console.error('Error fetching recent orders:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch seller dashboard data'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          stats: stats[0],
          recentOrders
        }
      });
    });
  });
});

// Get buyer dashboard data
const getBuyerDashboard = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get buyer statistics
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM orders WHERE user_id = ?) as total_orders,
      (SELECT COUNT(*) FROM orders WHERE user_id = ? AND status = 'pending') as pending_orders,
      (SELECT COUNT(*) FROM wishlist WHERE user_id = ?) as wishlist_items,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = ? AND status = 'completed') as total_spent
  `;
  
  db.query(statsQuery, [userId, userId, userId, userId], (err, stats) => {
    if (err) {
      console.error('Error fetching buyer dashboard stats:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch buyer dashboard data'
      });
    }
    
    // Get recent orders
    const ordersQuery = `
      SELECT o.*, p.title as product_title, p.images as product_image 
      FROM orders o 
      LEFT JOIN products p ON o.product_id = p.id 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `;
    
    db.query(ordersQuery, [userId], (err, recentOrders) => {
      if (err) {
        console.error('Error fetching recent orders:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch buyer dashboard data'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          stats: stats[0],
          recentOrders
        }
      });
    });
  });
});

// List a new product
const listProduct = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    description,
    price,
    category_id,
    stock_quantity,
    images,
    brand,
    condition,
    weight,
    dimensions,
    color_options,
    size_options,
    shipping_cost,
    return_policy
  } = req.body;

  // Insert new product
  const insertProductQuery = `
    INSERT INTO products (
      title, description, price, category_id, stock_quantity, images, 
      seller_id, brand, condition_type, weight, dimensions, 
      color_options, size_options, shipping_cost, return_policy, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    title, description, price, category_id, stock_quantity, images,
    userId, brand, condition, weight, dimensions,
    color_options, size_options, shipping_cost, return_policy
  ];

  db.query(insertProductQuery, values, (err, result) => {
    if (err) {
      console.error('Error listing product:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to list product'
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Product listed successfully',
      data: {
        productId: result.insertId
      }
    });
  });
});

// Get seller's products
const getSellerProducts = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const productsQuery = `
    SELECT * FROM products 
    WHERE seller_id = ? 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;

  const countQuery = `SELECT COUNT(*) as total FROM products WHERE seller_id = ?`;

  db.query(countQuery, [userId], (err, countResult) => {
    if (err) {
      console.error('Error counting products:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch products'
      });
    }

    const total = countResult[0].total;

    db.query(productsQuery, [userId, limit, offset], (err, products) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch products'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          products,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    });
  });
});

// Update a product
const updateProduct = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  // Check if product belongs to seller
  const checkOwnershipQuery = `SELECT id FROM products WHERE id = ? AND seller_id = ?`;
  
  db.query(checkOwnershipQuery, [id, userId], (err, result) => {
    if (err) {
      console.error('Error checking product ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update product'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this product'
      });
    }

    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'price', 'category_id', 'stock_quantity', 
      'images', 'brand', 'condition_type', 'weight', 'dimensions', 
      'color_options', 'size_options', 'shipping_cost', 'return_policy'
    ];
    
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    values.push(new Date()); // updated_at
    values.push(id); // WHERE clause

    const updateQuery = `UPDATE products SET ${updateFields.join(', ')}, updated_at = ? WHERE id = ?`;

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update product'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully'
      });
    });
  });
});

// Delete a product
const deleteProduct = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if product belongs to seller
  const checkOwnershipQuery = `SELECT id FROM products WHERE id = ? AND seller_id = ?`;
  
  db.query(checkOwnershipQuery, [id, userId], (err, result) => {
    if (err) {
      console.error('Error checking product ownership:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete product'
      });
    }

    if (result.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this product'
      });
    }

    const deleteQuery = `DELETE FROM products WHERE id = ?`;

    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to delete product'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    });
  });
});

// Get orders for seller or buyer
const getOrders = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userType = req.query.type || 'seller'; // 'seller' or 'buyer'
  const status = req.query.status || null;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let ordersQuery, countQuery;
  let queryParams = [];

  if (userType === 'seller') {
    ordersQuery = `SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.seller_id = ?`;
    countQuery = `SELECT COUNT(*) as total FROM orders WHERE seller_id = ?`;
    queryParams = [userId];
  } else {
    ordersQuery = `SELECT o.*, p.title as product_title, s.name as seller_name FROM orders o LEFT JOIN products p ON o.product_id = p.id LEFT JOIN users s ON o.seller_id = s.id WHERE o.user_id = ?`;
    countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
    queryParams = [userId];
  }

  // Add status filter if provided
  if (status) {
    ordersQuery += ` AND o.status = ?`;
    countQuery += ` AND status = ?`;
    queryParams.push(status);
  }

  ordersQuery += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(limit, offset);

  db.query(countQuery, [userId, ...(status ? [status] : [])], (err, countResult) => {
    if (err) {
      console.error('Error counting orders:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch orders'
      });
    }

    const total = countResult[0].total;

    db.query(ordersQuery, queryParams, (err, orders) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch orders'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    });
  });
});

// Get seller analytics
const getSellerAnalytics = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const period = req.query.period || 'month'; // 'day', 'week', 'month', 'year'

  // Calculate date range based on period
  let startDate;
  const endDate = new Date();

  switch (period) {
    case 'day':
      startDate = new Date(endDate.setDate(endDate.getDate() - 1));
      break;
    case 'week':
      startDate = new Date(endDate.setDate(endDate.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(endDate.setMonth(endDate.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(endDate.setFullYear(endDate.getFullYear() - 1));
      break;
    default:
      startDate = new Date(endDate.setDate(endDate.getDate() - 30));
  }

  const analyticsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM orders WHERE seller_id = ? AND created_at >= ?) as orders_count,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE seller_id = ? AND status = 'completed' AND created_at >= ?) as revenue,
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE seller_id = ? AND created_at >= ?) as unique_customers,
      (SELECT AVG(rating) FROM reviews WHERE product_id IN (SELECT id FROM products WHERE seller_id = ?)) as avg_rating
  `;

  db.query(analyticsQuery, [userId, startDate, userId, startDate, userId, startDate, userId], (err, analytics) => {
    if (err) {
      console.error('Error fetching analytics:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch analytics'
      });
    }

    // Get sales trend
    const trendQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE seller_id = ? AND created_at >= ? AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;

    db.query(trendQuery, [userId, startDate], (err, trend) => {
      if (err) {
        console.error('Error fetching sales trend:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch analytics'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          analytics: analytics[0],
          trend
        }
      });
    });
  });
});

// Send message between buyer and seller
const sendMessage = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { receiver_id, product_id, message, subject } = req.body;

  // Verify product exists and belongs to one of the users
  const productQuery = `SELECT seller_id FROM products WHERE id = ?`;
  
  db.query(productQuery, [product_id], (err, result) => {
    if (err) {
      console.error('Error verifying product:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send message'
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    const sellerId = result[0].seller_id;
    
    // Check if sender is either the buyer or seller of the product
    if (userId !== sellerId && !req.query.isBuyer) { // Simplified check - in real app you'd have better verification
      // Additional verification would be needed here
    }

    const insertMessageQuery = `
      INSERT INTO marketplace_messages (
        sender_id, receiver_id, product_id, subject, message, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(insertMessageQuery, [userId, receiver_id, product_id, subject, message], (err, result) => {
      if (err) {
        console.error('Error sending message:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to send message'
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: {
          messageId: result.insertId
        }
      });
    });
  });
});

// Get messages for user
const getMessages = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const direction = req.query.direction || 'both'; // 'received', 'sent', 'both'

  let messagesQuery, countQuery;
  let queryParams = [userId];

  if (direction === 'sent') {
    messagesQuery = `
      SELECT mm.*, u.name as receiver_name, p.title as product_title 
      FROM marketplace_messages mm 
      LEFT JOIN users u ON mm.receiver_id = u.id 
      LEFT JOIN products p ON mm.product_id = p.id 
      WHERE mm.sender_id = ? 
      ORDER BY mm.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    countQuery = `SELECT COUNT(*) as total FROM marketplace_messages WHERE sender_id = ?`;
  } else if (direction === 'received') {
    messagesQuery = `
      SELECT mm.*, u.name as sender_name, p.title as product_title 
      FROM marketplace_messages mm 
      LEFT JOIN users u ON mm.sender_id = u.id 
      LEFT JOIN products p ON mm.product_id = p.id 
      WHERE mm.receiver_id = ? 
      ORDER BY mm.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    countQuery = `SELECT COUNT(*) as total FROM marketplace_messages WHERE receiver_id = ?`;
  } else {
    messagesQuery = `
      SELECT mm.*, 
        CASE 
          WHEN mm.sender_id = ? THEN u.name 
          ELSE us.name 
        END as other_party_name,
        p.title as product_title,
        CASE 
          WHEN mm.sender_id = ? THEN 'sent' 
          ELSE 'received' 
        END as direction
      FROM marketplace_messages mm 
      LEFT JOIN users u ON mm.receiver_id = u.id 
      LEFT JOIN users us ON mm.sender_id = us.id 
      LEFT JOIN products p ON mm.product_id = p.id 
      WHERE mm.sender_id = ? OR mm.receiver_id = ? 
      ORDER BY mm.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    countQuery = `SELECT COUNT(*) as total FROM marketplace_messages WHERE sender_id = ? OR receiver_id = ?`;
    queryParams = [userId, userId, userId, userId, limit, offset, userId, userId];
  }

  if (direction !== 'both') {
    queryParams.push(limit, offset);
  }

  db.query(countQuery, [userId], (err, countResult) => {
    if (err) {
      console.error('Error counting messages:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch messages'
      });
    }

    const total = countResult[0].total;

    db.query(messagesQuery, queryParams, (err, messages) => {
      if (err) {
        console.error('Error fetching messages:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch messages'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          messages,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });
    });
  });
});

module.exports = {
  getSellerDashboard,
  getBuyerDashboard,
  listProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getOrders,
  getSellerAnalytics,
  sendMessage,
  getMessages
};