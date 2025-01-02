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


  // Get all wishlist items for a specific user
const getAllWishlistItems = asyncHandler(async (req, res) => {
    const user_id = req.params.userId || req.user;
  
    const SQL_FETCH_ALL_WISHLIST = 'SELECT * FROM my_wishlist WHERE user_id = ?';
    db.query(SQL_FETCH_ALL_WISHLIST, [user_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to retrieve wishlist items", error: err.message });
      
      res.status(200).json({ wishlistItems: result });
    });
  });




// Delete a wishlist item
const deleteWishlistItemByAdmin = asyncHandler(async (req, res) => {
    const { wishlistId } = req.body;
  
    const SQL_FETCH_WISHLIST = 'SELECT * FROM my_wishlist WHERE id = ?';
    db.query(SQL_FETCH_WISHLIST, [wishlistId], async (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });
  
      const wishlistItem = result[0];
      if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });
  
      if (wishlistItem.image_id) await cloudinary.uploader.destroy(wishlistItem.image_id);
  
      const SQL_DELETE_WISHLIST = 'DELETE FROM my_wishlist WHERE id = ?';
      db.query(SQL_DELETE_WISHLIST, [wishlistId], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to delete wishlist item", error: err.message });
        res.status(200).json({ message: "Wishlist item deleted successfully" });
      });
    });
  });



// Delete a wishlist item for a specific user
const deleteWishlistItem = asyncHandler(async (req, res) => {
    const { wishlistId, userId } = req.body; // Retrieve both wishlist item ID and user ID
  
    const SQL_FETCH_WISHLIST = 'SELECT * FROM my_wishlist WHERE id = ? AND user_id = ?';
    db.query(SQL_FETCH_WISHLIST, [wishlistId, userId], async (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });
  
      const wishlistItem = result[0];
      if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found or unauthorized" });
  
      // If image ID exists, delete from cloud storage
      if (wishlistItem.image_id) await cloudinary.uploader.destroy(wishlistItem.image_id);
  
      const SQL_DELETE_WISHLIST = 'DELETE FROM my_wishlist WHERE id = ? AND user_id = ?';
      db.query(SQL_DELETE_WISHLIST, [wishlistId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to delete wishlist item", error: err.message });
        res.status(200).json({ message: "Wishlist item deleted successfully" });
      });
    });
  });
  

// Add single wishlist item to cart
const addWishlistItemToCart = asyncHandler(async (req, res) => {
  const { user_id, wishlistId } = req.body;

  // Query to fetch the wishlist item from the `my_wishlist` table
  const SQL_FETCH_WISHLIST = 'SELECT * FROM my_wishlist WHERE id = ?';

  db.query(SQL_FETCH_WISHLIST, [wishlistId], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });

    const wishlistItem = result[0];
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });

    // Query to check if the wishlist item is already in the cart
    const SQL_CHECK_CART = `
      SELECT * FROM cart 
      WHERE user_id = ? AND title = ? AND price = ? AND colors = ?
    `;

    db.query(
      SQL_CHECK_CART,
      [user_id, wishlistItem.name, wishlistItem.price, wishlistItem.color],
      (err, cartResult) => {
        if (err) return res.status(500).json({ message: "Error checking cart", error: err.message });

        if (cartResult.length > 0) {
          // Item already in cart
          return res.status(200).json({ message: "Wishlist item already in cart" });
        }

        // If not in cart, proceed with insertion
        const SQL_INSERT_CART = `
          INSERT INTO cart (user_id, title, images, price, colors)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(
          SQL_INSERT_CART,
          [user_id, wishlistItem.name, wishlistItem.image, wishlistItem.price, wishlistItem.color],
          (err, insertResult) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Failed to add wishlist item to cart", error: err.message });

            res.status(201).json({ message: "Wishlist item added to cart successfully" });
          }
        );
      }
    );
  });
});


// Add all wishlist items to cart, omitting duplicates
const addAllWishlistToCart = asyncHandler(async (req, res) => {
  const { user_id } = req.body;

  // Step 1: Fetch all wishlist items for the user
  const SQL_FETCH_WISHLIST = 'SELECT * FROM my_wishlist WHERE user_id = ?';
  db.query(SQL_FETCH_WISHLIST, [user_id], (err, wishlistItems) => {
    if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });

    if (wishlistItems.length === 0) return res.status(404).json({ message: "No wishlist items found" });

    // Step 2: Fetch existing cart items for the user
    const SQL_FETCH_CART = 'SELECT title FROM cart WHERE user_id = ?';
    db.query(SQL_FETCH_CART, [user_id], (err, cartItems) => {
      if (err) return res.status(500).json({ message: "Failed to fetch cart items", error: err.message });

      const existingCartTitles = new Set(cartItems.map(item => item.title));

      // Step 3: Filter out wishlist items that already exist in the cart
      const uniqueWishlistItems = wishlistItems.filter(item => !existingCartTitles.has(item.name));

      if (uniqueWishlistItems.length === 0) {
        return res.status(200).json({ message: "All wishlist items are already in the cart" });
      }

      // Step 4: Prepare values for bulk insert
      const values = uniqueWishlistItems.map(item => [
        user_id, item.name, item.image, item.price, item.color
      ]);

      // Step 5: Insert unique wishlist items into cart
      const SQL_INSERT_CART_BULK = `
        INSERT INTO cart (user_id, title, images, price, colors)
        VALUES ?
      `;
      db.query(SQL_INSERT_CART_BULK, [values], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to add wishlist items to cart", error: err.message });
        
        res.status(201).json({ message: "Wishlist items added to cart successfully", addedItemsCount: result.affectedRows });
      });
    });
  });
});

module.exports = { addAllWishlistToCart };


// Create a wishlist item
const createWishlistItem = asyncHandler(async (req, res) => {
  const { user_id, name, image, price, color } = req.body;

  let imageUrl, imageId;
  if (image) {
    const { url, public_id } = await uploadCloudinaryBase64(image, "wishlist");
    imageUrl = url;
    imageId = public_id;
  }

  const SQL_INSERT_WISHLIST = `
    INSERT INTO my_wishlist (user_id, name, image, image_id, price, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(SQL_INSERT_WISHLIST, [user_id, name, imageUrl, imageId, price, color], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to create wishlist item", error: err.message });
    res.status(201).json({ message: "Wishlist item created successfully" });
  });
});


// Update a wishlist item
const updateWishlistItem = asyncHandler(async (req, res) => {
    const { wishlistId, name, image, price, color } = req.body;
  
    const SQL_FETCH_WISHLIST = 'SELECT * FROM my_wishlist WHERE id = ?';
    db.query(SQL_FETCH_WISHLIST, [wishlistId], async (err, result) => {
      if (err) return res.status(500).json({ message: "Something went wrong", error: err.message });
  
      const wishlistItem = result[0];
      if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });
  
      let updateFields = [];
      let values = [];
  
      if (name) {
        updateFields.push("name = ?");
        values.push(name);
      }
  
      if (price) {
        updateFields.push("price = ?");
        values.push(price);
      }
  
      if (color) {
        updateFields.push("color = ?");
        values.push(color);
      }
  
      if (image) {
        let imageUrl = wishlistItem.image;
        let imageId = wishlistItem.image_id;
  
        if (imageId) await cloudinary.uploader.destroy(imageId);
        const { url, public_id } = await uploadCloudinaryBase64(image, "wishlist");
        imageUrl = url;
        imageId = public_id;
  
        updateFields.push("image = ?");
        values.push(imageUrl);
        
        updateFields.push("image_id = ?");
        values.push(imageId);
      }
  
      if (updateFields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
      }
  
      updateFields.push("updated_at = NOW()");
      values.push(wishlistId);
  
      const SQL_UPDATE_WISHLIST = `UPDATE my_wishlist SET ${updateFields.join(", ")} WHERE id = ?`;
      db.query(SQL_UPDATE_WISHLIST, values, (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update wishlist item", error: err.message });
        res.status(200).json({ message: "Wishlist item updated successfully" });
      });
    });
  });
  

module.exports = { 
    getAllWishlistItems,
    deleteWishlistItemByAdmin,
    deleteWishlistItem, 
    addWishlistItemToCart, 
    addAllWishlistToCart, 
    createWishlistItem, 
    updateWishlistItem 
};
