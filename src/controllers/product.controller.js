import { Product } from "../models/product.model.js"

import { ApiError } from "../utils/ApiError.js"

import { asynHandler } from "../utils/asyncHandler.js"
import { uploadOnClodinary } from "../utils/cloudinary.js";



const createProduct =asynHandler(async(req,res)=>{

   const {name,description} = req.body;

   if(!name || !description){

      throw new ApiError(
         400,
         "All fields are required"
      )
   }

   const imageLocalPath =req.file?.path

   if(!imageLocalPath){

      throw new ApiError(
         400,
         "Product image required"
      )
   }

   const productImage= await uploadOnClodinary(imageLocalPath);



   const product =await Product.create({
    name,
    description,
    image:productImage.url,
    owner:req.user._id
   })



   return res.status(201)
   .json({
      success:true,
      message:
      "Product created successfully",
      product
   })
})

const getAllProducts =asynHandler(async(req,res)=>{

   const products =await Product.find()

   return res.status(200)
   .json({
      success:true,
      products
   })
})



export { createProduct , getAllProducts }