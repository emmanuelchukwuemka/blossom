const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const uploadProduct = asyncHandler ( async (req,res)=>
{
 const title = req.body.title
 const prime = req.body.prime
 const images = req.body.images
 const description = req.body.description
 const categoryId = req.body.categoryId
 const sellerId = req.body.sellerId
 const stateId = req.body.stateId
 const moq = req.body.moq
 const video = req.body.video
 const size = req.body.size
 const colors = req.body.colors
 const percentageOff = req.body.percentageOff
 const slashPrice = req.body.slashPrice
 const price = req.body.price
 const shippingcost = req.body.shippingcost
 const unitPrice = req.body.unitPrice
 const purchasePrice = req.body.purchasePrice
 const tax = req.body.tax
 const discount = req.body.discount
 const rating = req.body.rating
 const totalQuantity = req.body.totalQuantity
 const shippingDays = req.body.shippingDays
 const deliveryDays = req.body.deliveryDays
 const countryId = req.body.countryId

const SQL = `INSERT INTO products(title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,percentageOff,slashPrice,shippingcost,unitPrice,purchasePrice,tax,discount,totalQuantity,shippingDays,deliveryDays)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
 db.query(SQL,[title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,percentageOff,slashPrice,shippingcost,unitPrice,purchasePrice,tax,discount,totalQuantity,shippingDays,deliveryDays],(error , result)=>
 {       
    res.send("1");     
 })
})

  module.exports = uploadProduct