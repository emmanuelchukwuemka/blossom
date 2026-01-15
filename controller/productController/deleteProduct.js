const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const { sendEmail } =require("../../utils/sendEmail")
const currentDate = require("../../utils/Date/currentDate")

const deleteProduct = asyncHandler ( async (req,res)=>{

    const {productID,userID,passCode} = req.body
    console.log(userID)
    let SQL = `SELECT * from Users WHERE id=${userID}`;
    db.query(SQL, (error,data)=>
    {
      if(error){
        console.log(error)
        return res.status(404).json({message: "Error Querying database",status:404});
      }else if((data!=undefined)&(data.length!=0))
     {
      const user = data[0]
      const {password,email} = user
      const passwordCheck = bcrypt.compareSync(passCode,password);
      if(passwordCheck){
        const data = { 
            email:`${email}`,
            subject:"Product Deleted",
            text:`You just deleted a product from your store at ${currentDate()}`
        } 
        SQL = `DELETE FROM products WHERE id = ${productID}`;
        db.query(SQL,(err,result)=>
        {
            if(err){
                console.log(error)
                return res.status(404).json({message: "Error Querying database",status:404});
              }else{
            sendEmail(data)
            return res.status(202).json({message: "Accepted",status:202});       
         }
      });
       
      }else{
        return res.status(401).json({message: "Incorrect password",status:401});
      }
     }
     else
     {
      return res.status(404).json({message: "No account found with this email,please signup",status:404});
     }
    })
    

        
 
  })

  module.exports = deleteProduct