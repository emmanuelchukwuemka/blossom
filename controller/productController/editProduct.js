const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const editProduct = asyncHandler ( async  (req,res)=>{
    const id = JSON.stringify(req.body.id)
    //const title = JSON.stringify(req.body.title)
    const description = JSON.stringify(req.body.description)
    const categoryId = JSON.stringify(req.body.categoryId)
    //const moq = JSON.stringify(req.body.moq)
    //const percentageOff = JSON.stringify(req.body.percentageOff)
    //const slashPrice = JSON.stringify(req.body.slashPrice)
    //const price = JSON.stringify(req.body.price)
    //const shippingcost = JSON.stringify(req.body.shippingcost)
    //const unitPrice = JSON.stringify(req.body.unitPrice)
    //const tax = JSON.stringify(req.body.tax)
    //const discount = JSON.stringify(req.body.discount)
    //const totalQuantity = JSON.stringify(req.body.totalQuantity)
    //const shippingDays = JSON.stringify(req.body.shippingDays)
    //shippingcost=${shippingcost}
    //const SQL = `UPDATE products SET title=${title},shippingDays=${shippingDays},unitPrice=${unitPrice},totalQuantity=${totalQuantity},tax=${tax},discount=${discount},shippingcost=${shippingcost},price=${price}, description=${description}, categoryId=${categoryId},moq=${moq},percentageOff=${percentageOff},slashPrice=${slashPrice} WHERE id = ${id}`
  
    const SQL = `UPDATE products SET description=${description}, categoryId=${categoryId} WHERE id = ${id}`
  
   
    db.query(SQL,(error , result)=> {       
        res.send(SQL);  
     })
   })

  module.exports = editProduct