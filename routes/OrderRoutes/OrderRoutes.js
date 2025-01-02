const express = require("express")
const router = express.Router()

const { orderDetails,searchOrders,orders,placeOrder,buyAgain,placeOrderCart} = require("../../controller/orders/orders")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")

router.post("/orders/get-orders", orders)
router.post("/placeorders", placeOrder)
router.post("/buyagain", buyAgain)
router.post("/placeorderscart",placeOrderCart)
router.post("/searchorder",searchOrders)
router.post("/orderdetails",orderDetails)

  
 module.exports = router;
