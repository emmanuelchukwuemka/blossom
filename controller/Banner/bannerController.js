const db = require('../../Database/db')
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
require("dotenv").config();
const currentDate = require("../../utils/Date/currentDate")



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

  const deleteUpload = async (publicID) =>{
  
    const res = await cloudinary.uploader.destroy(getPublicID(publicID), (error,result)=>{
     if(error){
        console.log(error);
        return error
      }
      console.log("Deleted")
      return result;
    });
    
    
  }

const getBanner = asyncHandler (async(req,res)=>{
    const SQL = `SELECT * FROM appBanner`;  
    db.query(SQL,(error , result)=>{
  
        res.send(result);
    })
  })

  const getAppBanner = asyncHandler (async(req,res)=>{
    const SQL = `SELECT * FROM appBanner WHERE  enabled = \'Active\' `;  
    db.query(SQL,(error , result)=>{
      if(error){
         console.log(error)
      }
        console.log(result)
        res.send(result);
    })
  })

 




const deactivateBanner = asyncHandler( async (req,res)=>{

    const id = req.body.id
    const enabled = req.body.enabled
    console.log(enabled)
    if(enabled==="Active"){
      const SQL = `UPDATE appBanner SET enabled=\'DISABLED\' WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
         return res.status(201).json({message: "Account Created Successfully",status:"DISABLED"});
          }
      }); 
  
    }else{
  
      const SQL = `UPDATE appBanner SET enabled=\'Active\' WHERE id=${id}`;
   
      db.query(SQL,(err,result)=>{
        if(err){
         console.log("error",err);       
        }else{
  
        return res.status(201).json({message: "Account Created Successfully",status:"Active"});
          }
      }); 
  
    }           
  })


const deleteBanner= asyncHandler( async (req,res)=>{

    const {id,userID,passCode,image} = req.body
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
           deleteUpload(image)
           const SQL = `DELETE FROM appBannerItems WHERE appBanner_id=${id}`;
           db.query(SQL,(err,result)=>{
               if(err){
                   console.log(error)
                   return res.status(404).json({message: "Error Querying database",status:404});
                 }else{
                   const SQL = `DELETE FROM appBanner WHERE id=${id}`;
                   db.query(SQL,(err,result)=>{
                       if(err){
                           console.log(error)
                           return res.status(404).json({message: "Error Querying database",status:404});
                         }else{
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



const createBanner = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const {title,keywords,creatorID} = req.body
  const enabled = "Active"
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)
   
     console.log("starting upload....")
     const SQL = `INSERT INTO appBanner(title,keywords,image,enabled,createdAt,creatorID)VALUES(?,?,?,?,?,?)`
      db.query(SQL,[title,keywords,imageUrl,enabled,currentDate(),creatorID],(err, result) => {
       if(err){
         console.log(err)
         deleteUpload(imageUrl)
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

const updateBanner = asyncHandler (async (req, res,next) => {
   
  const img = req.files;
  console.log(img)
  const {id,title,keywords,previousImage} = req.body
  
  try{
    let b64 = Buffer.from(img[0].buffer).toString("base64");
    let dataURI = "data:" + img[0].mimetype + ";base64," + b64;
    let cldRes = await createUpload(dataURI);
    let imageUrl = cldRes.secure_url
    console.log(cldRes)
    console.log(imageUrl)

      console.log("starting upload....")
           const SQL = `UPDATE appBanner SET  title=\'${title}\' , keywords=\'${keywords}\' , image=\'${imageUrl}\'  WHERE id=\'${id}\'`
       db.query(SQL,(err, result) => {
        if(err){
          console.log(err)
          deleteUpload(imageUrl)
          res.status(201).json({message: err,status:500});
        }else{
          deleteUpload(previousImage)
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



const getBannertProductsByID = asyncHandler (async(req,res)=>{
   
  const {keywords} = req.body
  let str = keywords
  let arr = str.split(",");
  console.log(arr)

const SQL = `SELECT * FROM products WHERE title LIKE '%${arr[0]}%'  OR title LIKE '%${arr[1]}%' OR title LIKE '%${arr[2]}%' OR title LIKE '%${arr[3]}%' OR title LIKE '%${arr[4]}%' `;  
db.query(SQL,(error , result)=>{
 if(error){
   console.log(error)
}else{
       res.send(result);
}
})
})



const addBannerProducts = asyncHandler (async(req,res)=>{
   
  const {bannerID,productID} = req.body

const SQL = `SELECT * FROM appBannerItems WHERE appBanner_id = \'${bannerID}\' AND product_id = ${productID}`;  
db.query(SQL,(error , result)=>{
 if(error){
   console.log(error)
}else{
    if(result.length===0){//notfound
      const SQL = `INSERT INTO  appBannerItems(appBanner_id,product_id,date)VALUES(?,?,?)`
      db.query(SQL,[bannerID,productID,currentDate()],(err, result) => {
       if(err){
         console.log(err)
         res.status(201).json({message: err,status:500});
       }else{
        
          const SQL = `SELECT * FROM appBannerItems WHERE appBanner_id=\'${bannerID}\' `;  
          db.query(SQL,(err , result)=>{
            if(err){
              console.log(err)
              res.status(201).json({message: err,status:500});
            }else{
                   const numberOfProducts = result.length
          const SQL = `UPDATE appBanner SET numberOfProducts = \'${numberOfProducts}\' , updated_at=\'${currentDate()}\' WHERE image=\'${bannerID}\'`
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

const getBannerProducts = asyncHandler (async(req,res)=>{
   
  const {bannerID,productID} = req.body

const SQL = `SELECT * FROM appBannerItems WHERE appBanner_id = \'${bannerID}\' AND product_id = ${productID}`;  
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








  module.exports = {createBanner,deleteBanner,deactivateBanner,getBanner,getAppBanner,updateBanner,getBannertProductsByID,addBannerProducts,getBannerProducts};