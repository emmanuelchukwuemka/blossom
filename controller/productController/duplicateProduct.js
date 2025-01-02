const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");

const duplicateProduct = asyncHandler ( async (req,res)=>{
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
 const likes = req.body.likes
 const discount = req.body.discount
 const rating = req.body.rating
 const totalQuantity = req.body.totalQuantity
 const shippingDays = req.body.shippingDays
 const deliveryDays = req.body.deliveryDays
 const state = req.body.state
 const countryId = req.body.countryId

const SQL = `INSERT INTO products(title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,percentageOff,slashPrice,likes,shippingcost,unitPrice,purchasePrice,tax,discount,totalQuantity,shippingDays,deliveryDays,state)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
 db.query(SQL,[title,prime,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,percentageOff,slashPrice,likes,shippingcost,unitPrice,purchasePrice,tax,discount,totalQuantity,shippingDays,deliveryDays,state],(error , result)=>
 {       
    res.send("1");     
 })
})

  module.exports = duplicateProduct