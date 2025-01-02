
const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const deleteProduct = asyncHandler ( async (req,res)=>{
    const LMT = req.body.LMT
    const SQL = (req.body.sql).toString()
 
     db.query(SQL,(error , result)=>{
   
        res.send(result);
    
     })
   })

  module.exports = deleteProduct