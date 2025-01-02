
const express = require("express");
const router = express.Router()

const bloomzonProduct = require('../../controller/productController/bloomzonProduct')
const deleteProduct = require('../../controller/productController/deleteProduct')
const disableProduct = require("../../controller/productController/disableProduct")
const searchProduct = require("../../controller/productController/searchProduct")
const uploadProduct = require("../../controller/productController/uploadProduct")
const allProduct = require("../../controller/productController/allProduct")
const duplicateProduct = require("../../controller/productController/duplicateProduct")
const editProduct  = require("../../controller/productController/editProduct")
const flashDeal = require("../../controller/productController/flashDeal");
const categoryProduct = require('../../controller/productController/categoryProduct');
const likeProduct = require("../../controller/productController/likeProduct")
const productReview = require("../../controller/productController/productReview")
const productDetails = require("../../controller/productController/productDetails")
const randomProducts = require("../../controller/productController/randomProducts")
//RealEstate Routes


router.post("/productReview",productReview)

router.post("/productDetails",productDetails)

router.post("/likeProduct",likeProduct)

router.post("/flashdeals",flashDeal)

router.post("/DuplicateProduct",duplicateProduct);

router.post("/UploadProduct",uploadProduct)
 
router.post("/products",allProduct)

router.post("/searchproduct", searchProduct);

router.delete("/deleteproduct",deleteProduct);

router.put("/disableproduct",disableProduct);

router.post("/bloomzonproduct",bloomzonProduct)

router.put("/editProduct",editProduct)
  
router.post("/allproducts", categoryProduct)
  
router.get("/get-random-products/:limit", randomProducts)

 //router.post("/upload", upload.array('photo',12),uploadFile)



 

  module.exports = router;