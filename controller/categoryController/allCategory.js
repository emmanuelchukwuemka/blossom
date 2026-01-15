const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
require("dotenv").config();
const { sendEmail } =require("../../utils/sendEmail")
const currentDate = require("../../utils/Date/currentDate")
const getTimeLeft = require("../../utils/Date/getTimeLeft")


let categoryTitleData = []
let subcategoryData = []


const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.cloudinaryName,
  api_key: process.env.cloudinaryAPI_KEY,
  api_secret:process.env.cloudinaryAPI_SECRET,
  secure: true,
});


const createUpload = async (file) =>{
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return res;
  }
  
  const deleteUpload = async (publicID) =>{
  
    const res = await cloudinary.uploader.destroy(publicID, (error,result)=>{
     if(error){
        console.log(error);
      }
    });
    return res;
  
  }

  const getPublicID = (imageUrl) =>{

    const id = imageUrl;
    const str = id.slice(-24); 
    const removeJPG = str.replace(/.jpg/g, "")
    const removePNG = removeJPG.replace(/.png/g, "")
    const removeJPG2 = removePNG.replace(/.JPG/g, "")
    const removePNG2 = removeJPG2.replace(/.PNG/g, "")
    const result = removePNG2
        return result;
   
  }

const allCategory = asyncHandler (async(req,res)=>{
    const SQL = `SELECT * FROM categories`;  
    db.query(SQL,(error , result)=>{
  
        res.send(result);
    })
  })

  const mainCategory = asyncHandler (async(req,res)=>{
    const SQL = `SELECT * FROM categories WHERE level <= 1 AND enabled = 1`;  
    db.query(SQL,(error , result)=>{
  
        res.send(result);
    })
  })

  const subcategory = asyncHandler (async (req,res)=>{
        const id = req.body.id
    const SQL = `SELECT * FROM categories WHERE level >=2 AND enabled = 1`;  
    db.query(SQL,(error , result)=>{
        res.send(result);
    })
  })

  const titlecategory = asyncHandler (async (req,res)=>{
    const id = req.body.id
const SQL = `SELECT * FROM categoryTitle`;  
db.query(SQL,(error , result)=>{
   res.send(result);
})
})

const categoryTitleController = asyncHandler (async (req,res)=>{
  const categoryID = req.body.categoryID
const SQL = `SELECT * FROM categoryTitle WHERE  categoryID=${categoryID}`;  
db.query(SQL,(error , result)=>{
 if(error){
  console.log(error)
  return
 }
     if(result.length!=0){
       
       categoryTitleData = result;
      
     }else{
      categoryTitleData = [];
     }
     const SQL = `SELECT * FROM categories WHERE level >=2 AND enabled = 1`;  
     db.query(SQL,(error , result)=>{  
      if(error){
        console.log(error)
        return
       }
       res.status(201).json({title:categoryTitleData,subcategory:result})

     })

})
})



const deactivateCategory = asyncHandler( async (req,res)=>{

    const id = req.body.id
    const enabled = Number(req.body.enabled)
    if(enabled===1){
      const SQL = `UPDATE categories SET enabled=0 WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
  
          const data = { 
           // email:`${email}`,
           // subject:"Bloomzon E-commerce",
           //  text:`Your account has just been suspended from an admin`
         }
        //sendEmail(data)
       // console.log("suspended")
         return res.status(201).json({message: "Account Created Successfully",status:1});
          }
      }); 
  
    }else{
  
      const SQL = `UPDATE categories SET enabled=1 WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
  
          const data = { 
           // email:`${email}`,
            //subject:"Bloomzon E-commerce",
            // text:`Your account has just been reactivated back as an admin`
         }
        //sendEmail(data)
        //console.log("suspended")
        return res.status(201).json({message: "Account Created Successfully",status:1});
          }
      }); 
  
    }           
  })


  const deactivateTitleCategory = asyncHandler( async (req,res)=>{

    const id = req.body.id
    const enabled = Number(req.body.enabled)
    if(enabled===1){
      const SQL = `UPDATE categoryTitle SET enabled=0 WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
  
          const data = { 
           // email:`${email}`,
           // subject:"Bloomzon E-commerce",
           //  text:`Your account has just been suspended from an admin`
         }
        //sendEmail(data)
       // console.log("suspended")
         return res.status(201).json({message: "Account Created Successfully",status:1});
          }
      }); 
  
    }else{
  
      const SQL = `UPDATE categoryTitle SET enabled=1 WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
  
          const data = { 
           // email:`${email}`,
            //subject:"Bloomzon E-commerce",
            // text:`Your account has just been reactivated back as an admin`
         }
        //sendEmail(data)
        //console.log("suspended")
        return res.status(201).json({message: "Account Created Successfully",status:1});
          }
      }); 
  
    }           
  })




const deleteCategory= asyncHandler( async (req,res)=>{

    const {id,userID,passCode} = req.body
    console.log(userID)

    const SQL = `SELECT * from Users WHERE id=${userID}`;
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
            subject:"Category Deleted",
            text:`You just deleted a category from your store at ${currentDate()}`
        } 
       const SQL = `DELETE FROM categories WHERE id=${id}`;
        db.query(SQL,(err,result)=>
        {
            if(err){
                console.log(error)
                return res.status(404).json({message: "Error Querying database",status:404});
              }else{
            sendEmail(data)
            return res.status(202).json({message: "Accepted",status:1});       
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

const deleteTitleCategory = asyncHandler( async (req,res)=>{

  const {id,userID,passCode} = req.body
  console.log(userID)

  const SQL = `SELECT * from Users WHERE id=${userID}`;
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
          subject:"Category Deleted",
          text:`You just deleted a category from your store at ${currentDate()}`
      } 
     const SQL = `DELETE FROM categoryTitle WHERE id=${id}`;
      db.query(SQL,(err,result)=>
      {
          if(err){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }else{
          sendEmail(data)
          return res.status(202).json({message: "Accepted",status:1});       
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


const createCategory = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const title = req.body.title
  const categoryId = req.body.categoryId
  const categoryType = req.body.categoryType
  let level = 0;

  console.log(title)
  console.log(categoryId)
  console.log(categoryType)

  if(categoryType === "TitleCategory"){

    console.log("starting title insert....")
    const SQL = `INSERT INTO categoryTitle(categoryID,title,createdAt,updatedAt)VALUES(?,?,?,?)`
     db.query(SQL,[categoryId,title,currentDate(),currentDate()],(err, result) => {
      if(err){
        console.log(err)
        res.status(201).json({message: err,status:500});
      }else{
        console.log("uploaded successfully")
        res.status(200).json({message: "Upload Successfully",status:200});
      }
         
     })


  }else{
  
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)
    if(categoryType === "MainCategory"){
      level = 1;
     console.log("starting upload....")
     const SQL = `INSERT INTO categories(name,level,image,created_at)VALUES(?,?,?,?)`
      db.query(SQL,[title,level,imageUrl,currentDate()],(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
         console.log("uploaded successfully")
         res.status(200).json({message: "Upload Successfully",status:200});
       }
          
      });

    }else{
      level = 2;
      console.log("starting upload....")
      const SQL = `INSERT INTO categories(name,parent_id,level,image,created_at)VALUES(?,?,?,?,?)`
       db.query(SQL,[title,categoryId,level,imageUrl,currentDate()],(err, result) => {
        if(err){
          console.log(err)
          res.status(201).json({message: err,status:500});
        }else{
          console.log("uploaded successfully")
          res.status(200).json({message: "Upload Successfully",status:200});
        }
      });   

    }
  

  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });


  }
  


  }
  


  
})


const updateCategory = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const id = req.body.id
  const title = req.body.title
  const categoryId = req.body.categoryId
  const categoryType = req.body.categoryType
  let level = 0;

  console.log(title)
  console.log(id)
  console.log(categoryId)
  console.log(categoryType)
  
  
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)
    if(categoryType === "MainCategory"){
      level = 1;
     console.log("starting upload....")
     const SQL = `UPDATE categories SET name = \'${title}\' ,level = 1, image=\'${imageUrl}\', updated_at=\'${currentDate()}\' WHERE id=\'${id}\'`
      db.query(SQL,(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
         console.log("uploaded successfully")
         res.status(200).json({message: "Upload Successfully",status:200});
       }
          
      });

    }else{
      level = 2;
      console.log("starting upload....")
           const SQL = `UPDATE categories SET name = \'${title}\' ,level = 2, parent_id = \'${categoryId}\', image=\'${imageUrl}\', updated_at=\'${currentDate()}\' WHERE id=\'${id}\'`
       db.query(SQL,(err, result) => {
        if(err){
          console.log(err)
          res.status(201).json({message: err,status:500});
        }else{
          console.log("uploaded successfully")
          res.status(200).json({message: "Upload Successfully",status:200});
        }
      });   

    }
  

  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });


  }
  

  
})



const updateTitleCategory = asyncHandler (async (req, res,next) => {
   
  const id = req.body.id
  const title = req.body.title
  const categoryId = req.body.categoryId
  const categoryType = req.body.categoryType


  console.log(title)
  console.log(id)
  console.log(categoryId)
  console.log(categoryType)
  

     const SQL = `UPDATE categoryTitle SET title = \'${title}\' , categoryID =\'${categoryId}\', updatedAt=\'${currentDate()}\' WHERE id=\'${id}\'`
      db.query(SQL,(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
         console.log("uploaded successfully")
         res.status(200).json({message: "Upload Successfully",status:200});
       }
          
      });

})



//Deal Category

const getDeals= asyncHandler (async(req,res)=>{
  const SQL = `SELECT * FROM Deals`;  
  db.query(SQL,(error , result)=>{

      res.send(result);
  })
})

const getDealsApp = asyncHandler (async(req,res)=>{
  const SQL = `SELECT * FROM Deals WHERE  enabled = "Active" AND timeLeft !="Event Expired!!!" `;  
  db.query(SQL,(error , result)=>{

      res.send(result);
  })
})



const createDeal = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const title = req.body.title
  const color = req.body.color
  const startDate = req.body.startDate
  const endDate = req.body.endDate
 

  console.log(title)
  console.log(startDate)
  console.log(endDate)

  
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)
 
     console.log("starting upload....")
     const SQL = `INSERT INTO  Deals(title,color,image,start_date,end_date,created_at)VALUES(?,?,?,?,?,?)`
      db.query(SQL,[title,color,imageUrl,startDate,endDate,currentDate()],(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
         console.log("uploaded successfully")
         res.status(200).json({message: "Upload Successfully",status:200});
       }
          
      });

   
    }
     catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });

  }
  
})




const deactivateDeal = asyncHandler (async (req, res,next) => {
  const dealID = req.body.id
  const status = req.body.enabled
  console.log(status)
  if(status==="Active"){
    const SQL = `UPDATE Deals  SET enabled = \"Disabled\" WHERE id = ${dealID}`

    db.query(SQL,(error , result)=>{
       if(error){
           console.log(error)
       }else{
           res.status(201).json({status:"Disabled"});
   
       }
    })
  }else{
    const SQL = `UPDATE Deals  SET enabled = \"Active\" WHERE id = ${dealID}`

    db.query(SQL,(error , result)=>{
       if(error){
           console.log(error)
       }else{
        res.status(201).json({status:"Active"});
   
       }
    })

  }

 })


const updateDeal = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const id = req.body.id
  const title = req.body.title
  const color = req.body.color
  const startDate = req.body.startDate
  const endDate = req.body.endDate
 

  console.log(title)
  console.log(startDate)
  console.log(endDate)
  
  
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)
     console.log("starting upload....")
     const SQL = `UPDATE Deals SET title = \'${title}\', color=\'${color}\', image=\'${imageUrl}\', start_date=\'${startDate}\', end_date=\'${endDate}\',updated_at=\'${currentDate()}\' WHERE id=\'${id}\'`
      db.query(SQL,(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
         console.log("uploaded successfully")
         res.status(200).json({message: "Upload Successfully",status:200});
       }
          
      });
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });


  }
  
})


const deleteDeal = asyncHandler( async (req,res)=>{

  const {id,userID,passCode} = req.body
  console.log(userID)

  const SQL = `SELECT * from Users WHERE id=${userID}`;
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
          subject:"Category Deleted",
          text:`You just deleted a deal from your store at ${currentDate()}`
      } 

      const SQL = `DELETE FROM Deals_items WHERE deal_id=${id}`;
      db.query(SQL,(err,result)=>{
          if(err){
              console.log(error)
              return res.status(404).json({message: "Error Querying database",status:404});
            }else{
              const SQL = `DELETE FROM Deals WHERE id=${id}`;
              db.query(SQL,(err,result)=>{
                  if(err){
                      console.log(error)
                      return res.status(404).json({message: "Error Querying database",status:404});
                    }else{
        
                  sendEmail(data)
                  return res.status(202).json({message: "Accepted",status:1});       
               }
            });
              
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


const getDealProducts = asyncHandler (async(req,res)=>{
   
     const {dealID,productID} = req.body

  const SQL = `SELECT * FROM Deals_items WHERE deal_id = ${dealID} AND product_id = ${productID}`;  
  db.query(SQL,(error , result)=>{
    if(error){
      console.log(error)
  }else{
       if(result.length===0){//notfound
          res.status(201).json({status:0});
       }else{
        res.status(201).json({status:1});
       }
      
  }
  })
})


const addDealProducts = asyncHandler (async(req,res)=>{
   
  const {dealID,productID} = req.body

const SQL = `SELECT * FROM Deals_items WHERE deal_id = ${dealID} AND product_id = ${productID}`;  
db.query(SQL,(error , result)=>{
 if(error){
   console.log(error)
}else{
    if(result.length===0){//notfound
      const SQL = `INSERT INTO  Deals_items(deal_id,product_id,date)VALUES(?,?,?)`
      db.query(SQL,[dealID,productID,currentDate()],(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
        
          const SQL = `SELECT * FROM Deals WHERE id=${dealID} `;  
          db.query(SQL,(err , result)=>{
            if(err){
              console.log(err)
              res.status(201).json({message: err,status:500});
            }else{
                   const numberOfProducts = Number(result[0].numberOfProducts)
          const SQL = `UPDATE Deals SET numberOfProducts = \'${numberOfProducts + 1}\' ,updated_at=\'${currentDate()}\' WHERE id=${dealID}`
          db.query(SQL,(err, result) => {
         if(err){
           console.log(err)
           res.status(201).json({message: err,status:500});
         }else{
             res.status(201).json({status:1});
         }
            
        });
            }
          })
         
       }
          
      });
    }else{//item found
     res.status(201).json({status:1});
    }
   
}
})
})


const getDealProductsByID = asyncHandler (async(req,res)=>{
   
  const {id} = req.body

const SQL = `SELECT * FROM products INNER JOIN Deals_items ON  Deals_items.product_id = products.id AND deal_id = ${id}`;  
db.query(SQL,(error , result)=>{
 if(error){
   console.log(error)
}else{
       res.send(result);
}
})
})

const upDateDealEndDate = asyncHandler (async(req,res)=>{
  
  const SQL = `SELECT * FROM Deals`;  

db.query(SQL,(error , result)=>{
 if(error){
   console.log(error)
}else{
     result.map((data)=>{
      let timeLeft = getTimeLeft(data.end_date)
      const SQL = `UPDATE Deals SET timeLeft = \'${timeLeft}\' WHERE id = ${data.id}`;
      db.query(SQL,(error , result)=>{
        if(error){
          console.log(error)
       }else{
          console.log("Updated time successfully")
       }

      })

     })
    
}
})
})


  module.exports = {getDealProductsByID,addDealProducts,getDealProducts,deleteDeal,updateDeal,deactivateDeal,createDeal,getDeals,getDealsApp,allCategory,mainCategory,subcategory,deactivateCategory,deleteCategory,createCategory,updateCategory,titlecategory,categoryTitleController,deactivateTitleCategory,deleteTitleCategory,updateTitleCategory,upDateDealEndDate};