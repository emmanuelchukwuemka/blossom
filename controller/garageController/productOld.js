const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

// This is tailored to get categories that falls under Part & Accessories of Vehicle using a Parent Category
// Fetch featured parts & accessories categories under "Auto-Mobile" and its subcategories
const getFeaturedCategories = expressAsyncHandler((req, res) => {
    // Find the ID of the top-level category "Auto-Mobile"
    const findAutoMobileSQL = `SELECT id FROM categories WHERE name = "Auto-Mobile" LIMIT 1`;
  
    db.query(findAutoMobileSQL, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error finding Auto-Mobile category" });
      }
  
      // Ensure "Auto-Mobile" exists
      if (result.length === 0) {
        return res.status(404).json({ message: "Auto-Mobile category not found" });
      }
  
      const autoMobileId = result[0].id;
  
      // Retrieve featured categories where parent_id is "Auto-Mobile" or its subcategories
      const getFeaturedCategoriesSQL = `
        SELECT id, name, image 
        FROM categories 
        WHERE (parent_id = ? OR parent_id IN (SELECT id FROM categories WHERE parent_id = ?)) 
        AND featured = 1
      `;
  
      db.query(getFeaturedCategoriesSQL, [autoMobileId, autoMobileId], (err, featuredResults) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error fetching featured categories" });
        }
        res.json(featuredResults);
      });
    });
  });

  const searchProducts = expressAsyncHandler((req, res) => {
    const { keyword } = req.body;
  
    const SQL = `
      SELECT id, title, description, price, images 
      FROM products 
      WHERE title LIKE ? OR description LIKE ?
    `;
    db.query(SQL, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error searching for products" });
      }
      res.json(results);
    });
  });

  // Fetch products by category and filter for a specific vehicle
const getCategoryProductsForVehicle = expressAsyncHandler((req, res) => {
    const { categoryId, vehicleType, vehicleMake, vehicleModel, vehicleYear } = req.body;
  
    const SQL = `
      SELECT p.id, p.title, p.description, p.price, p.images, p.meta
      FROM products p
      WHERE p.categoryId = ?
    `;
  
    db.query(SQL, [categoryId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching category products" });
      }
  
      // Filter results in JavaScript based on parsed meta data
      const filteredResults = results.filter(product => {
        if (!product.meta) return true; // If no meta data, assume compatible with all vehicles
  
        try {
          const meta = JSON.parse(product.meta);
  
          const isTypeCompatible = !meta.compatibleType || meta.compatibleType === vehicleType;
          const isMakeCompatible = !meta.compatibleMake || meta.compatibleMake === vehicleMake;
          const isModelCompatible = !meta.compatibleModel || meta.compatibleModel === vehicleModel;
          const isYearCompatible = !meta.compatibleYearStart || (meta.compatibleYearStart <= vehicleYear && meta.compatibleYearEnd >= vehicleYear);
  
          return isTypeCompatible && isMakeCompatible && isModelCompatible && isYearCompatible;
        } catch (error) {
          console.log(`Error parsing meta for product ${product.id}:`, error);
          return false; // Exclude products with invalid meta
        }
      });
  
      res.json(filteredResults);
    });
  });
  
  module.exports = { getFeaturedCategories, searchProducts, getCategoryProductsForVehicle };