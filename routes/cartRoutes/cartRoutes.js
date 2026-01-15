const db = require('../../Database/db')
const express = require("express")
const router = express.Router()

router.post("/upload-to-cart",(req,res)=>{
    const  id = req.body.id
    const  user_id = req.body.user_id
    const  title = req.body.title
    const  prime = req.body.prime
    const  description = req.body.description
    const  images = req.body.images
    const  price = req.body.price
    const  categoryId = req.body.categoryId
    const  sellerId = req.body.sellerId
    const  moq = req.body.moq
    const  colors = req.body.colors
    const  size = req.body.size
    const  rating = req.body.rating
    const  video = req.body.video
    const  countryId = req.body.countryId
    const  stateId = req.body.stateId
    const  quantity = req.body.quantity
    const  sqlInsert = `INSERT INTO cart(id,user_id,title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,quantity)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
   
   db.query(sqlInsert,[id,user_id,title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,quantity],(err,result)=>
   {
     if(err) {
       console.log("error",err);
       return res.status(500).json({
         status: "error",
         message: "Failed to add item to cart"
       });
     }
     console.log("result",result);
     return res.status(200).json({
       status: "success",
       message: "Item added to cart successfully",
       data: {
         cartId: result.insertId
       }
     });
   });
})
  
  
  module.exports = router;