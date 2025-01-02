const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const searchProduct = asyncHandler ( async (req,res)=>{
    const searchText = (req.body.searchText).toString()
    const count = 1;
    const SQL =   `SELECT * FROM products WHERE title LIKE  '%${searchText}%'`;
 
     db.query(SQL,(error,result)=>{  
        res.send(result);
    })
 
     const searchSQL =   `SELECT * FROM searches WHERE query='${searchText}'`;
 
     db.query(searchSQL,(error , result)=>{ 
       const insertSQL= `INSERT INTO searches (query,count)VALUES(?,?)`
       let updateSQL=""
       if(result.length>0)
       {
           const searchResult = result[0]
           updateSQL= `UPDATE searches SET count=${searchResult.count+1} WHERE id=${searchResult.id}`
       }
       if(result.length>0)
       {
         db.query(updateSQL,(error , result)=>{ 
 
          }) 
       }else
       {
          db.query(insertSQL,[searchText,count],(error , result)=>{ 
 
          }) 
       }        
         
    })
 
   })

  module.exports = searchProduct