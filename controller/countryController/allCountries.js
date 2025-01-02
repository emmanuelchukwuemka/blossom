const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const allCountries = asyncHandler ( async (req,res)=>{

    const categoryId = req.body.CategoryID
    const sqlGet = `SELECT * FROM countries`;  
    db.query(sqlGet,(error , result)=>{
  
        res.send(result);
    })
  })

  module.exports = allCountries;