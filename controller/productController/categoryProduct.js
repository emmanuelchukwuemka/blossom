const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const categoryProduct = asyncHandler ( async  (req,res)=>{
    const productID = req.body.productID
    const sqlGet = `SELECT * FROM products WHERE categoryId = ${productID}`;
   
    db.query(sqlGet,(error , result)=>{
        res.send(result);
   
    })
 
  })

  module.exports = categoryProduct