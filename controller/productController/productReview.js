const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const currentDate = require("../../utils/Date/currentDate")
const e = require('express');

const productReview = asyncHandler ( async (req,res)=>{

    const {productID,userID} = req.body
    console.log(productID)
   
    const SQL = `SELECT name,productReviews.comment,productReviews.rating FROM productReviews INNER JOIN  users ON productReviews.userID = users.id AND productReviews.productID = \"${productID}\" `
    db.query(SQL, (error,data)=>{
          if(error){
            console.log(error)
            return res.status(404).json({message: "Error Querying database",status:404});
          }
           console.log(data)
           res.send(data)

        })

        
 
  })

  module.exports = productReview