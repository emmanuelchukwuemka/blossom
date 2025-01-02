
const express = require("express");
const router = express.Router()
const {upload} = require('../../middleware/Multer')

const {getBannerProducts,addBannerProducts,getBannertProductsByID,createBanner,deleteBanner,deactivateBanner,getBanner,getAppBanner,updateBanner } = require("../../controller/Banner/bannerController")


  router.post("/createBanner",upload.array('image',10),createBanner)
  router.post("/updateBanner",upload.array('image',10),updateBanner)
  router.post("/deleteBanner",deleteBanner)
  router.post("/deactivateBanner",deactivateBanner)
  router.post("/getBanner",getBanner)
  router.post("/getAppBanner",getAppBanner)
  router.post("/getBannerProductsByID",getBannertProductsByID)
  router.post("/addBannerProducts",addBannerProducts)
  router.post("/getBannerProducts",getBannerProducts)


  module.exports = router;