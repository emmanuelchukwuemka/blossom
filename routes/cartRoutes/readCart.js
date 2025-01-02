const db = require("../../Models/dbConfig/db.Config")
const express = require("express")
const router = express.Router()


  router.post("/readcart",(req,res)=>{

    const user_id = req.body.user_id
    const product_id = req.body.product_id
    const quantity = req.body.quantity
    
   let sqlInsert = `SELECT * FROM cart WHERe user_Id =${user_id} `;
   
   db.query(sqlInsert,(err,result)=>
   {
     console.log("error",err);
     console.log("result",result);
     res.send(result)
   });

}); 
  
module.exports = router;