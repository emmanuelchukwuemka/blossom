const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const bloomzonProduct = asyncHandler ( async (req,res)=>{
  const LMT = req.body.LMT
  const SQL = (req.body.sql).toString()


   db.query(SQL,(error ,products)=>{
     if(error){
        console.log(error);
     }else {
      const SQL = 'SELECT * from categories'
      db.query(SQL,(error,categories)=>{
        if(error){
          console.log(error)
        }else{
          res.status(201).json({categories:categories,products:products})
        }
        

      })
      

     }
     
   })
 })

  module.exports = bloomzonProduct