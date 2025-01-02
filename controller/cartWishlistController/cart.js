const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');
const cloudinary = require('cloudinary').v2;
const { uploadCloudinaryBase64 } = require("../../utils/cloudinary/uploader");

cloudinary.config({
  cloud_name: process.env.cloudinaryName,
  api_key: process.env.cloudinaryAPI_KEY,
  api_secret: process.env.cloudinaryAPI_SECRET,
  secure: true,
});

// Get all cart items for a specific user
const getAllCartItems = asyncHandler(async (req, res) => {
    const { user_id } = req.body;
  
    const SQL_FETCH_ALL_CART = 'SELECT * FROM cart WHERE user_id = ?';
    db.query(SQL_FETCH_ALL_CART, [user_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to retrieve cart items", error: err.message });
      
      res.status(200).json({ cartItems: result });
    });
  });


// Delete a cart item
const deleteCartItem = asyncHandler(async (req, res) => {
  const { cartId } = req.body;

  const SQL_FETCH_CART = 'SELECT * FROM cart WHERE id = ?';
  db.query(SQL_FETCH_CART, [cartId], async (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });

    const cartItem = result[0];
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    const SQL_DELETE_CART = 'DELETE FROM cart WHERE id = ?';
    db.query(SQL_DELETE_CART, [cartId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete cart item", error: err.message });
      res.status(200).json({ message: "Cart item deleted successfully" });
    });
  });
});

// Delete all cart items for a specific user
const deleteAllUserCarts = asyncHandler(async (req, res) => {
  const { user_id } = req.body;
if (!user_id) return res.status(500).json({ message: "User Id field cannot be blank" });

  const SQL_DELETE_ALL_CARTS = 'DELETE FROM cart WHERE user_id = ?';
  db.query(SQL_DELETE_ALL_CARTS, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete all cart items", error: err.message });
    res.status(200).json({ message: "All cart items deleted successfully" });
  });
});

// Create a new cart item
const createCartItem = asyncHandler(async (req, res) => {
  const {
    user_id, title, prime, description, images, price, categoryId,
    sellerId, moq, video, countryId, stateId, colors, size, rating, quantity
  } = req.body;

  let imageUrl, imageId;
  if (images) {
    const { url, public_id } = await uploadCloudinaryBase64(images, "assets");
    imageUrl = url;
    imageId = public_id;
  }

  const SQL_INSERT_CART = `
    INSERT INTO cart (user_id, title, prime, description, images, price, categoryId, sellerId,
      moq, video, countryId, stateId, colors, size, rating, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(SQL_INSERT_CART, [
    user_id, title, prime, description, imageUrl, price, categoryId, sellerId, 
    moq, video, countryId, stateId, colors, size, rating, quantity
  ], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to create cart item", error: err.message });
    res.status(201).json({ message: "Cart item created successfully" });
  });
});


// Update a cart item
const updateCartItem = asyncHandler(async (req, res) => {
    const {
      cartId, title, prime, description, images, price, categoryId,
      sellerId, moq, video, countryId, stateId, colors, size, rating, quantity
    } = req.body;
  
    const SQL_FETCH_CART = 'SELECT * FROM cart WHERE id = ?';
    db.query(SQL_FETCH_CART, [cartId], async (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });
  
      const cartItem = result[0];
      if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
  
      let updateFields = [];
      let values = [];
  
      if (title) {
        updateFields.push("title = ?");
        values.push(title);
      }
      if (prime) {
        updateFields.push("prime = ?");
        values.push(prime);
      }
      if (description) {
        updateFields.push("description = ?");
        values.push(description);
      }
      if (images) {
        let imageUrl = cartItem.images;
        // let imageId = cartItem.image_id;
        
        // // Update image in Cloudinary if new images are provided
        // if (imageId) await cloudinary.uploader.destroy(imageId);
        const { url, public_id } = await uploadCloudinaryBase64(images, "assets");
        imageUrl = url;
        // imageId = public_id;
  
        updateFields.push("images = ?");
        values.push(imageUrl);
        // Optionally, if image_id is stored, update it as well
        // updateFields.push("image_id = ?");
        // values.push(imageId);
      }
      if (price) {
        updateFields.push("price = ?");
        values.push(price);
      }
      if (categoryId) {
        updateFields.push("categoryId = ?");
        values.push(categoryId);
      }
      if (sellerId) {
        updateFields.push("sellerId = ?");
        values.push(sellerId);
      }
      if (moq) {
        updateFields.push("moq = ?");
        values.push(moq);
      }
      if (video) {
        updateFields.push("video = ?");
        values.push(video);
      }
      if (countryId) {
        updateFields.push("countryId = ?");
        values.push(countryId);
      }
      if (stateId) {
        updateFields.push("stateId = ?");
        values.push(stateId);
      }
      if (colors) {
        updateFields.push("colors = ?");
        values.push(colors);
      }
      if (size) {
        updateFields.push("size = ?");
        values.push(size);
      }
      if (rating) {
        updateFields.push("rating = ?");
        values.push(rating);
      }
      if (quantity) {
        updateFields.push("quantity = ?");
        values.push(quantity);
      }
  
      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
      }
  
      // // Add updated_at field
      // updateFields.push("updated_at = NOW()");
  
      values.push(cartId); // For the WHERE clause
  
      const SQL_UPDATE_CART = `UPDATE cart SET ${updateFields.join(", ")} WHERE id = ?`;
      db.query(SQL_UPDATE_CART, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update cart item", error: err.message });
        res.status(200).json({ message: "Cart item updated successfully" });
      });
    });
  });

module.exports = { 
    getAllCartItems,
    deleteCartItem, 
    deleteAllUserCarts, 
    createCartItem, 
    updateCartItem 
};
