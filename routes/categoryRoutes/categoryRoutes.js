const db = require('../../Database/db')
const express = require("express")
const {upload} = require('../../middleware/Multer')
const router = express.Router()

const {getDealProductsByID,addDealProducts,getDealProducts,deleteDeal,updateDeal,deactivateDeal,createDeal,getDeals,getDealsApp,allCategory,subcategory,mainCategory,deactivateCategory,deactivateTitleCategory,deleteCategory,deleteTitleCategory,createCategory,updateCategory,titlecategory,categoryTitleController,updateTitleCategory}= require("../../controller/categoryController/allCategory");
const categoryTranslation = require("../../controller/categoryController/categoryTranslation")
const allCountries = require("../../controller/countryController/allCountries")

router.post("/getAllCategory",mainCategory);
router.post("/subcategories",subcategory);
router.post("/allcategory",allCategory);
router.post("/deactivateCategory",deactivateCategory);
router.post("/deactivateTitleCategory",deactivateTitleCategory);
router.post("/deleteCategory",deleteCategory);
router.post("/deleteTitleCategory",deleteTitleCategory);
router.post("/getTitle",titlecategory);
router.post("/getcategorytitledata",categoryTitleController);
router.post("/createCategory",upload.array('image',10),createCategory);
router.post("/updateCategory",upload.array('image',10),updateCategory);
router.post("/updateTitleCategory",updateTitleCategory);
router.post("/getDeals",getDeals);
router.post("/getDealsApp",getDealsApp);
router.post("/createDeal",upload.array('image',10),createDeal);
router.post("/deactivateDeal",deactivateDeal);
router.post("/updateDeal",upload.array('image',10),updateDeal);
router.post("/deleteDeal",deleteDeal);
router.post("/getDealProducts",getDealProducts);
router.post("/addDealProducts",addDealProducts);
router.post("/getDealProductsByID",getDealProductsByID);
































  router.get("/categorytranslation",categoryTranslation)

  router.get("/countries",allCountries)

  router.post("/categories",(req,res)=>
  {
    const SQL = (req.body.sql).toString()    
    db.query(SQL,(error , result)=>{
  
        res.send(result);
    
     })
  })
  router.delete("/deleteCategory",(req,res)=>{
    const categoryID = req.body.categoryID
    const SQL = `DELETE FROM categories WHERE id = ${categoryID}`;
    
    db.query(SQL,(err,result)=>
    {
        res.send("1");       
    });        
 
  })

  router.post("/createCategories",(req,res)=>
  {

  const name = JSON.stringify(req.body.name)
  const image = JSON.stringify(req.body.image)
  const level = JSON.stringify(req.body.level)
  const parent_id = JSON.stringify(req.body.parent_id)

  const SQL = `INSERT INTO categories(name,image,level,parent_id)VALUES(?,?,?,?)`
   db.query(SQL,[name,image,level,parent_id],(error , result)=>
   {       
      res.send("1");     
   })
  })

  router.put("/updatecategory",(req,res)=>
  {
    const id = JSON.stringify(req.body.id)
    const name = JSON.stringify(req.body.name)
    const image = JSON.stringify(req.body.image)
    const level = JSON.stringify(req.body.level)
    const parent_id = JSON.stringify(req.body.parent_id)
  const SQL = `UPDATE categories SET name=${name}, parent_id=${parent_id},level=${level},image=${image} WHERE id = ${id}`
   db.query(SQL,(error , result)=>
   {      
      res.send(SQL);     
   })
  })
  

  module.exports = router;