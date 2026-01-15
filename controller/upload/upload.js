require("dotenv").config();
const asyncHandler = require("express-async-handler");
const db = require('../../Database/db')
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
      }
    });
    console.log("Deleted")
  
  }



  //route for post shop avatar image
  const uploadProfilePhoto = asyncHandler (async (req, res,next) => {
    if (!req.files) {
        console.log("No file upload");
        next();
    } else {
       const img = req.files;
       const user_id = req.body.user_id 
       console.log(img[0]);
       const objectData = img[0]
       console.log(user_id)
       const SQL = `SELECT avatar from Users WHERE id=${user_id}`
       db.query(SQL,async (error, result) => {
         if(error){
            console.log(error)
         }
         console.log(result)
         if((result!=undefined)&(result.length!=0)){
            const prevAvatar = result[0].avatar;
            if(result[0].avatar===null||result[0].avatar==="NULL"){
                try{
                    const b64 = Buffer.from(objectData.buffer).toString("base64");
                    let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
                    const cldRes = await createUpload(dataURI);
                    const imageUrl = cldRes.secure_url
                    console.log(cldRes)
                    let SQL = `UPDATE  users SET avatar = \'${imageUrl}\' , updated_at= \'${currentDate()}\'    WHERE id = ${user_id}`
                    db.query(SQL,(error, result) => {
                      if(error){
                         console.log(error)
                      }
                     // res.json({status:1}).status(201);
                    });
                
                  } catch (error) {
                    console.log(error);
                    res.send({
                      message: error.message,
                    });
                  }
            

            }else{
         try{
        const b64 = Buffer.from(objectData.buffer).toString("base64");
        let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
        const cldRes = await createUpload(dataURI);
        const imageUrl = cldRes.secure_url
        console.log(cldRes)
        let SQL = `UPDATE  users SET avatar = \'${imageUrl}\' , updated_at= \'${currentDate()}\'    WHERE id = ${user_id}`
        db.query(SQL,(error, result) => {
          if(error){
             console.log(error)
             deleteUpload(imageUrl)
          }
        
          const res = deleteUpload(prevAvatar)
          console.log(res)
        });
    
      } catch (error) {
        console.log(error);
        res.send({
          message: error.message,
        });
      }

            

            }
               
            
         }
       });
  
      next();
    }
  })
  

  
  
  
  

  //route for post shop avatar image
  const uploadShopID = asyncHandler (async (req, res,next) => {
    if (!req.files) {
        console.log("No file upload");
        next();
    } else {
       const img = req.files;
       const user_id = req.body.user_id 
       const columnName = req.body.column_name
       console.log(img[0]);
       const objectData = img[0]
       const SQL = `SELECT  ${columnName} from shops WHERE user_id = ${user_id}`
       db.query(SQL,async (error, result) => {
         if(error){
            console.log(error)
         }
         if((result!=undefined)&(result.length!=0)){
             const obj = result[0]
            const prevAvatar = Object.values(obj)[0];
            console.log(prevAvatar)
            if(result[0].columnName===null||result[0].columnName==="NULL"){
                try{
                    const b64 = Buffer.from(objectData.buffer).toString("base64");
                    let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
                    const cldRes = await createUpload(dataURI);
                    const imageUrl = cldRes.secure_url
                    console.log(cldRes)
                    let SQL = `UPDATE  shops SET ${columnName} = \'${imageUrl}\' , updated_at= \'${currentDate()}\'    WHERE user_id = ${user_id}`
                    db.query(SQL,(error, result) => {
                      if(error){
                         console.log(error)
                         deleteUpload(imageUrl)
                      }
                     // res.json({status:1}).status(201);
                    });
                
                  } catch (error) {
                    console.log(error);
                    res.send({
                      message: error.message,
                    });
                  }
            

            }else{
         try{
        const b64 = Buffer.from(objectData.buffer).toString("base64");
        let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
        const cldRes = await createUpload(dataURI);
        const imageUrl = cldRes.secure_url
        console.log(cldRes)
        let SQL = `UPDATE  shops SET ${columnName} = \'${imageUrl}\', updated_at= \'${currentDate()}\'   WHERE user_id = ${user_id}`
        db.query(SQL,(error, result) => {
          if(error){
             console.log(error)
             deleteUpload(imageUrl)
          }
         
          const res = deleteUpload(prevAvatar)
          console.log(res)
        });
    
      } catch (error) {
        console.log(error);
        res.send({
          message: error.message,
        });
      }

            

            }
               
            
         }
       });
  
      next();
    }
  })
  

  
  
  


//route for post shop avatar image
      const uploadShopAvatar = asyncHandler (async (req, res,next) => {
    if (!req.files) {
        console.log("No file upload");
        next();
    } else {
       const img = req.files;
       const user_id = req.body.user_id 
       console.log(img[0]);
       const objectData = img[0]
       const SQL = `SELECT logo from shops WHERE user_id = ${user_id}`
       db.query(SQL,async (error, result) => {
         if(error){
            console.log(error)
         }
         if((result!=undefined)&(result.length!=0)){
            const prevAvatar = result[0].logo;
            if(result[0].logo===null||result[0].logo==="NULL"){
                try{
                    const b64 = Buffer.from(objectData.buffer).toString("base64");
                    let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
                    const cldRes = await createUpload(dataURI);
                    const imageUrl = cldRes.secure_url
                    console.log(cldRes)
                    let SQL = `UPDATE  shops SET logo = \'${imageUrl}\' ,  updated_at = \'${currentDate()}\'   WHERE user_id = ${user_id}`
                    db.query(SQL,(error, result) => {
                      if(error){
                         console.log(error)
                      }
                     // res.json({status:1}).status(201);
                    });
                
                  } catch (error) {
                    console.log(error);
                    res.send({
                      message: error.message,
                    });
                  }
            

            }else{
         try{
        const b64 = Buffer.from(objectData.buffer).toString("base64");
        let dataURI = "data:" + objectData.mimetype + ";base64," + b64;
        const cldRes = await createUpload(dataURI);
        const imageUrl = cldRes.secure_url
        console.log(cldRes)
        let SQL = `UPDATE  shops SET logo = \'${imageUrl}\'  , updated_at = \'${currentDate()}\'  WHERE user_id = ${user_id}`
        db.query(SQL,(error, result) => {
          if(error){
             console.log(error)
          }
  
          const res = deleteUpload(prevAvatar)
          console.log(res)
        });
    
      } catch (error) {
        console.log(error);
        res.send({
          message: error.message,
        });
      }

            

            }
               
            
         }
       });
  
      next();
    }
  })
  


//route for post shop avatar image
      const updateProduct = asyncHandler (async (req, res,next) => {
     const img = req.files;
      
     console.log(img)
      const size = img.length
      let count = 0;
     let cloudinaryArray = []

     const user_id = req.body.product_id
     const  product_id = req.body.product_id
     const previous_images = req.body.previous_images
     const title = req.body.title
     const description = req.body.description
     const price =  req.body.price
     const categoryId = req.body.categoryId
     const moq = req.body.moq
     const video = req.body.video
     const countryId = req.body.countryId
     const stateId = req.body.stateId
     const sellerId = req.body.sellerId 
     const colors = req.body.colors
     const sizes = req.body.sizes

     console.log(sizes)
     const ratings = req.body.ratings
     const percentageOff = req.body.percentageOff
     const slashPrice = req.body.slashPrice
     const likes = req.body.likes
     const shippingcost = req.body.shippingcost
     const unitPrice = req.body.unitPrice
     const purchasePrice = req.body.purchasePrice
     const tax = req.body.tax
     const discount = req.body.discount
     const totalQuantity = req.body.totalQuantity
     const shippingDays = req.body.shippingDays
     const deliveryDays = req.body.deliveryDays
     const freeShipping = req.body.freeShipping
     const seoTitle = req.body.seoTitle
     const seoDescription = req.body.seoDescription
     const flatRate = req.body.flatRate
     const productstyle = req.body.productstyle
     const warranty = req.body.warranty
     const inStock = req.body.inStock
     const returnpolicy = req.body.returnpolicy
     const disclaimer = req.body.disclaimer
     const sizeguide = req.body.sizeguide
     const deliverytime = req.body.deliverytime
     const state = req.body.state 

     if(img.length===0){

      const images = previous_images
      const SQL = `UPDATE  products SET title = \"${title}\" ,description = \"${description}\", images = \"${images}\" ,price = \"${price}\" ,categoryId = \"${categoryId}\" ,sellerId = \"${sellerId}\" , moq = \"${moq}\" , video = \"${video}\" , countryId = \"${countryId}\" , stateId = \"${stateId}\"  , colors = \"${colors}\"  , size = \"${sizes}\" , rating = \"${ratings}\" , percentageOff = \"${percentageOff}\" ,slashPrice = \"${slashPrice}\" ,likes = \"${likes}\" , shippingcost = \"${shippingcost}\"  , unitPrice = \"${unitPrice}\" , purchasePrice = \"${purchasePrice}\", tax = \"${tax}\", discount = \"${discount}\",totalQuantity = \"${totalQuantity}\",  shippingDays = \"${shippingDays}\", deliveryDays = \"${deliveryDays}\",freeShipping = \"${freeShipping}\", seoTitle = \"${seoTitle}\" , seoDescription = \"${seoDescription}\",flatRate = \"${flatRate}\", style = \"${productstyle}\", warranty = \"${warranty}\", inStock = \"${inStock}\", returnpolicy = \"${returnpolicy}\", disclaimer = \"${disclaimer}\", sizeguide = \"${sizeguide}\", deliverytime = \"${deliverytime}\", state = \"${state}\" WHERE id = ${product_id}`
       db.query(SQL,(err, result) => {
        if(err){
          console.log(err)
        }else{
          console.log("updated successfully")
        }
           
       });
    
     }else{

      img.map(async(data)=>{
        try{
          let b64 = Buffer.from(data.buffer).toString("base64");
          let dataURI = "data:" + data.mimetype + ";base64," + b64;
          let cldRes = await createUpload(dataURI);
          let imageUrl = cldRes.secure_url
          console.log(cldRes)
          count = count + 1;
          cloudinaryArray.push(imageUrl);
          if(count === size){
           const images = previous_images + ',' + cloudinaryArray.toString()
           console.log(images)
           const SQL = `UPDATE  products SET title = \"${title}\" ,description = \"${description}\", images = \"${images}\" ,price = \"${price}\" ,categoryId = \"${categoryId}\" ,sellerId = \"${sellerId}\" , moq = \"${moq}\" , video = \"${video}\" , countryId = \"${countryId}\" , stateId = \"${stateId}\"  , colors = \"${colors}\"  , size = \"${sizes}\" , rating = \"${ratings}\" , percentageOff = \"${percentageOff}\" ,slashPrice = \"${slashPrice}\" ,likes = \"${likes}\" , shippingcost = \"${shippingcost}\"  , unitPrice = \"${unitPrice}\" , purchasePrice = \"${purchasePrice}\", tax = \"${tax}\", discount = \"${discount}\",totalQuantity = \"${totalQuantity}\",  shippingDays = \"${shippingDays}\", deliveryDays = \"${deliveryDays}\",freeShipping = \"${freeShipping}\", seoTitle = \"${seoTitle}\" , seoDescription = \"${seoDescription}\",flatRate = \"${flatRate}\", style = \"${productstyle}\", warranty = \"${warranty}\", inStock = \"${inStock}\", returnpolicy = \"${returnpolicy}\", disclaimer = \"${disclaimer}\", sizeguide = \"${sizeguide}\", deliverytime = \"${deliverytime}\", state = \"${state}\" WHERE id = ${product_id}`
            db.query(SQL,(err, result) => {
             if(err){
               console.log(err)
               cloudinaryArray.map((data)=>deleteUpload(data));
             }else{
               console.log("updated successfully")
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


     }
     
 
      next();
    
  })
  

  const createProduct = asyncHandler (async (req, res,next) => {
   
    const img = req.files;
    const size = img.length
    console.log(img)
    let count = 0;
    let cloudinaryArray = []
    const userID = req.body.userID
    const title = req.body.title
    const description = req.body.description
    const price =  req.body.price
    const categoryId = req.body.categoryId
    const moq = req.body.moq
    const video = req.body.video
    const countryId = req.body.countryId
    const stateId = req.body.stateId
    const sellerId = req.body.sellerId
    const colors = req.body.colors
    const sizes = req.body.sizes
    const ratings = req.body.ratings
    const percentageOff = req.body.percentageOff
    const slashPrice = req.body.slashPrice
    const likes = req.body.likes
    const shippingcost = req.body.shippingcost
    const unitPrice = req.body.unitPrice
    const purchasePrice = req.body.purchasePrice
    const tax = req.body.tax
    const discount = req.body.discount
    const totalQuantity = req.body.totalQuantity
    const shippingDays = req.body.shippingDays
    const deliveryDays =  req.body.shippingDays
    const freeShipping = req.body.freeShipping
    const seoTitle = req.body.seoTitle
    const seoDescription = req.body.seoDescription
    const flatRate = req.body.flatRate
    const productstyle = req.body.productstyle
    const warranty = req.body.warranty
    const inStock = req.body.inStock
    const returnpolicy = req.body.returnpolicy
    const disclaimer = req.body.disclaimer
    const sizeguide = req.body.sizeguide
    const deliverytime = req.body.deliverytime
    const state = req.body.state 
  img.map(async(data)=>{
    try{
      let b64 = Buffer.from(data.buffer).toString("base64");
      let dataURI = "data:" + data.mimetype + ";base64," + b64;
      let cldRes = await createUpload(dataURI);
      let imageUrl = cldRes.secure_url
      console.log(cldRes)
      count = count + 1;
      cloudinaryArray.push(imageUrl);
      if(count === size){
       const images =  cloudinaryArray.toString()
       console.log(images)
       console.log("starting upload....")
       const SQL = `INSERT INTO products(title,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,size,rating,percentageOff,slashPrice,likes,unitPrice,purchasePrice,shippingcost,tax,discount,totalQuantity,shippingDays,deliveryDays,freeShipping,seoTitle,seoDescription,flatRate,style,warranty,inStock,returnpolicy,disclaimer,sizeguide,deliverytime,state)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        db.query(SQL,[title,description,images,price,categoryId,sellerId,moq,video,countryId,stateId,colors,sizes,ratings,percentageOff,slashPrice,likes,unitPrice,purchasePrice,shippingcost,tax,discount,totalQuantity,shippingDays,deliveryDays,freeShipping,seoTitle,seoDescription,flatRate,productstyle,warranty,inStock,returnpolicy,disclaimer,sizeguide,deliverytime,state],(err, result) => {
         if(err){
           console.log(err)
           cloudinaryArray.map((data)=>deleteUpload(data));
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
    
  })
  


  const createRealEstatePost = asyncHandler (async (req, res,next) => {
   
    const img = req.files;
    const size = img.length
    console.log(img)
    let count = 0;
    let cloudinaryArray = []
    const {userID,drafted,areaSizeUnit,est,address,purposeChoice,homeChoice,bedRoom,bathRoom,sqft,yearBuilt,garage,description,phone,propertyType,email,propertyTitle,listingStatus,pricePerSqft,Stories,neighborhood,MLS,presentedBy,areaSize,totalPrice,advanceAmount,monthlyInstallment,numberofmonthlyInstallment,heatingAndCooling,lotSizeAcres,lotSizeSource,lotSizeSquareFeet,garageDescription,Association,calculatedTotalMonthlyAssociationFee,numberOfBuildings,numberOfunits,sourceListingStatus,County,sourcePropertyType,Area,sourceNeigborhood,parcelNumber,postalCodePlus4,Zoning,sourceSystemName,totalSquareFeetLiving,Levels,livingAreaSource,propertyAge,levelOrStories,buildingTotalStories,yearBuiltSource,yearSource} = req.body
     
  img.map(async(data)=>{
    try{
      let b64 = Buffer.from(data.buffer).toString("base64");
      let dataURI = "data:" + data.mimetype + ";base64," + b64;
      let cldRes = await createUpload(dataURI);
      let imageUrl = cldRes.secure_url
      console.log(cldRes)
      count = count + 1;
      cloudinaryArray.push(imageUrl);
      if(count === size){
       const images =  cloudinaryArray.toString()
       console.log(images)
       console.log("starting upload....")
       const SQL = `INSERT INTO realEstateProduct(user_id,drafted,purposeChoice,homeChoice,est,images,address,bedRoom,bathRoom,sqft,yearBuilt,garage,description,phone,propertyType,email,propertyTitle,listingStatus,pricePerSqft,Stories,neighborhood,MLS,presentedBy,areaSize,areaSizeUnit,totalPrice,advanceAmount,monthlyInstallment,numberofmonthlyInstallment,heatingAndCooling,lotSizeAcres,lotSizeSource,lotSizeSquareFeet,garageDescription,Association,calculatedTotalMonthlyAssociationFee,numberOfBuildings,numberOfunits,sourceListingStatus,County,sourcePropertyType,Area,sourceNeigborhood,parcelNumber,postalCodePlus4,Zoning,sourceSystemName,totalSquareFeetLiving,Levels,livingAreaSource,propertyAge,levelOrStories,buildingTotalStories,yearBuiltSource,yearSource)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        db.query(SQL,[userID,drafted,purposeChoice,homeChoice,est,images,address,bedRoom,bathRoom,sqft,yearBuilt,garage,description,phone,propertyType,email,propertyTitle,listingStatus,pricePerSqft,Stories,neighborhood,MLS,presentedBy,areaSize,areaSizeUnit,totalPrice,advanceAmount,monthlyInstallment,numberofmonthlyInstallment,heatingAndCooling,lotSizeAcres,lotSizeSource,lotSizeSquareFeet,garageDescription,Association,calculatedTotalMonthlyAssociationFee,numberOfBuildings,numberOfunits,sourceListingStatus,County,sourcePropertyType,Area,sourceNeigborhood,parcelNumber,postalCodePlus4,Zoning,sourceSystemName,totalSquareFeetLiving,Levels,livingAreaSource,propertyAge,levelOrStories,buildingTotalStories,yearBuiltSource,yearSource],(err, result) => {
         if(err){
           console.log(err)
            cloudinaryArray.map((data)=>deleteUpload(data));
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
    
  })


  const editRealEstatePost = asyncHandler (async (req, res,next) => {
   
    const img = req.files;
    const size = img.length
    console.log(img)
    let count = 0;
    let cloudinaryArray = []
    const {id,drafted,previous_images,est,address,purposeChoice,homeChoice,bedRoom,bathRoom,sqft,yearBuilt,garage,description,phone,propertyType,email,propertyTitle,listingStatus,pricePerSqft,Stories,neighborhood,MLS,presentedBy,areaSize,totalPrice,advanceAmount,monthlyInstallment,numberofmonthlyInstallment,heatingAndCooling,lotSizeAcres,lotSizeSource,lotSizeSquareFeet,garageDescription,Association,calculatedTotalMonthlyAssociationFee,numberOfBuildings,numberOfunits,sourceListingStatus,County,sourcePropertyType,Area,sourceNeigborhood,parcelNumber,postalCodePlus4,Zoning,sourceSystemName,totalSquareFeetLiving,Levels,livingAreaSource,propertyAge,levelOrStories,buildingTotalStories,yearBuiltSource,yearSource} = req.body
    if(img.length===0){

      const images = previous_images
              const SQL = `UPDATE  realEstateProduct SET drafted = \"${drafted}\", images = \"${images}\" ,purposeChoice = \"${purposeChoice}\" ,homeChoice = \"${homeChoice}\" ,est = \"${est}\" , bedRoom = \"${bedRoom}\" , bathRoom = \"${bathRoom}\"  , sqft = \"${sqft}\"  , yearBuilt = \"${yearBuilt}\" , garage = \"${garage}\" , description = \"${description}\" ,phone = \"${phone}\" ,areaSize = \"${areaSize}\" , totalPrice = \"${totalPrice}\"  , advanceAmount = \"${advanceAmount}\" , monthlyInstallment = \"${monthlyInstallment}\", numberofmonthlyInstallment = \"${numberofmonthlyInstallment}\", email = \"${email}\", neighborhood = \"${neighborhood}\",  MLS = \"${MLS}\", Stories = \"${Stories}\",  heatingAndCooling = \"${heatingAndCooling}\", lotSizeAcres = \"${lotSizeAcres}\" , lotSizeSource = \"${lotSizeSource}\",lotSizeSquareFeet = \"${lotSizeSquareFeet}\", garageDescription = \"${garageDescription}\", Association = \"${Association}\"  WHERE id = ${id}`
       db.query(SQL,(err, result) => {
        if(err){
          console.log(err)
        }else{
          console.log("uploaded successfully")
          res.status(200).json({message: "Upload Successfully",status:200});
        }
           
       });
    
     }else{
  img.map(async(data)=>{
    try{
      let b64 = Buffer.from(data.buffer).toString("base64");
      let dataURI = "data:" + data.mimetype + ";base64," + b64;
      let cldRes = await createUpload(dataURI);
      let imageUrl = cldRes.secure_url
      console.log(cldRes)
      count = count + 1;
      cloudinaryArray.push(imageUrl);
      if(count === size){
        const images = previous_images + ',' + cloudinaryArray.toString()
       console.log(images)
       console.log("starting update....")
        const SQL = `UPDATE  realEstateProduct SET status = \"${status}\" ,drafted = \"${drafted}\", images = \"${images}\" ,purposeChoice = \"${purposeChoice}\" ,homeChoice = \"${homeChoice}\" ,est = \"${est}\" , bedRoom = \"${bedRoom}\" , bathRoom = \"${bathRoom}\"  , sqft = \"${sqft}\"  , yearBuilt = \"${yearBuilt}\" , garage = \"${garage}\" , description = \"${description}\" ,phone = \"${phone}\" ,areaSize = \"${areaSize}\" , totalPrice = \"${totalPrice}\"  , advanceAmount = \"${advanceAmount}\" , monthlyInstallment = \"${monthlyInstallment}\", numberofmonthlyInstallment = \"${numberofmonthlyInstallment}\", email = \"${email}\", neighborhood = \"${neighborhood}\",  MLS = \"${MLS}\", Stories = \"${Stories}\",  heatingAndCooling = \"${heatingAndCooling}\", lotSizeAcres = \"${lotSizeAcres}\" , lotSizeSource = \"${lotSizeSource}\",lotSizeSquareFeet = \"${lotSizeSquareFeet}\", garageDescription = \"${garageDescription}\", Association = \"${Association}\"  WHERE id = ${id}`
        db.query(SQL,(err, result) => {
         if(err){
           console.log(err)
            cloudinaryArray.map((data)=>deleteUpload(data));
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
  
  }
    
  })
  







 
module.exports = {createProduct,updateProduct,uploadShopAvatar,uploadShopID,uploadProfilePhoto,createRealEstatePost,editRealEstatePost}

