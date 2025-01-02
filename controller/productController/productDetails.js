const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const currentDate = require("../../utils/Date/currentDate")


const productDetails = asyncHandler ( async (req,res)=>{

    const {productID,sellerID,userID,categoryID,productPrice} = req.body
    console.log("productID:" + productID)
    console.log("categoryID:" + categoryID)
    let shopData =[];
    let sellerData = []
    let productInformation =[];
    let productFeatureAndDetails =[];
    let sponsoredProduct = []
    let shopFollowers = []
    let onlineRevenue = 0;
    let orders = 0;
    let YMAL = []
    let RelatedProducts = []
    let productsViewed = []
    let FrequentlyBoughtTogether = []
    let SimilarPriceProduct = []
    console.log(sellerID)

    const selectSQL = `SELECT * FROM productViews WHERE productID = \"${productID}\" `
           db.query(selectSQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length===0){

              const  viewSQL  = `INSERT INTO productViews(productID,sellerID,date)VALUES(?,?,?)`;
   
              db.query(viewSQL,[productID,sellerID,currentDate()],(err,data)=>{
                  if(err)
                  {
                    return res.status(500).json({message: "Error Querying database"});
                  }else{
               
                          console.log("Inserted successfully")
                   }
          
          
                 })
                                        
           
             }else{

              console.log("Already Existed")
             }
        
        
        })

  

   
    const SQL = `SELECT * from shops WHERE user_id = \"${sellerID}\" `
    db.query(SQL, (error,data)=>{
          if(error){
            console.log(error)
            return res.status(404).json({message: "Error Querying database",status:404});
          }
          if(data.length!=0){
                                      
            shopData = data;
        }

         const SQL = `SELECT * from productInformation WHERE productID = \"${productID}\" `
         db.query(SQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length!=0){
                                        
              productInformation = data;
          }
           const SQL = `SELECT * from sellers WHERE user_id = \"${sellerID}\" `
           db.query(SQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length!=0){
                                        
              sellerData = data;
          }
           const SQL = `SELECT * FROM productFeatureAndDetails WHERE productID = \"${productID}\" `
           db.query(SQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length!=0){
                                        
              productFeatureAndDetails = data;
          }
           const SQL = `SELECT title,images,price,slashPrice,percentageOff FROM products INNER JOIN  sponsoredProduct ON sponsoredProduct.productID = products.id `
           db.query(SQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length!=0){
                                        
              sponsoredProduct = data;
       
            }
      
           const SQL = `SELECT * FROM followers WHERE user_id = \"${sellerID}\" AND follower_id = \"${userID}\" `
           db.query(SQL, (error,data)=>{
            if(error){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }
            if(data.length!=0){
                                        
              shopFollowers = data;
            }
            const SQL = `SELECT * FROM orders WHERE sellerId = \"${sellerID}\" `
            db.query(SQL, (error,data)=>{
             if(error){
               console.log(error)
               return res.status(404).json({message: "Error Querying database",status:404});
             }
             if(data.length!=0){
                data.map((revenue)=>onlineRevenue = onlineRevenue + Number(revenue.total))
                console.log(onlineRevenue)
             }else{
                onlineRevenue = 0;
             }
             const SQL = `SELECT * FROM orders WHERE product_id = \"${productID}\" `
             db.query(SQL, (error,data)=>{
              if(error){
                console.log(error)
                return res.status(404).json({message: "Error Querying database",status:404});
              }
              if(data.length!=0){
                    orders = data.length
              }else{
                 orders = 0;
              }
              const SQL = `SELECT * FROM products INNER JOIN  productViews ON productViews.productID = products.id `
              db.query(SQL, (error,data)=>{
               if(error){
                 console.log(error)
                 return res.status(404).json({message: "Error Querying database",status:404});
               }
               if(data.length!=0){
                                           
                 productsViewed = data;
          
               }
               const SQL = `SELECT * FROM products INNER JOIN  orders ON orders.product_id = products.id `
               db.query(SQL, (error,data)=>{
                if(error){
                  console.log(error)
                  return res.status(404).json({message: "Error Querying database",status:404});
                }
                if(data.length!=0){
                                            
                  FrequentlyBoughtTogether = data;
            
                }
                const SQL = `SELECT * FROM products WHERE categoryId = \"${categoryID}\" `
                db.query(SQL, (error,data)=>{
                 if(error){
                   console.log(error)
                   return res.status(404).json({message: "Error Querying database",status:404});
                 }
                 if(data.length!=0){
                                             
                   RelatedProducts = data;
             
                 }
                 const SQL = `SELECT * FROM products WHERE price = \"${productPrice}\" `
                 db.query(SQL, (error,data)=>{
                  if(error){
                    console.log(error)
                    return res.status(404).json({message: "Error Querying database",status:404});
                  }
                  if(data.length!=0){
                                              
                    SimilarPriceProduct  = data;
              
                  }
                      res.status(201).json({shopData:shopData,sellerData:sellerData,productInformation:productInformation,productFeatureAndDetails:productFeatureAndDetails,sponsoredProduct:sponsoredProduct,shopFollowers:shopFollowers,onlineRevenue,orders:orders,productsViewed:productsViewed,FrequentlyBoughtTogether:FrequentlyBoughtTogether,RelatedProducts:RelatedProducts,SimilarPriceProduct:SimilarPriceProduct })
                 })
                })
               })
              })
            })
           })
      
          })
            
  
          })
  
          })
            
  
          })

            
  
          })
          

        })

        
 
  })

  module.exports = productDetails