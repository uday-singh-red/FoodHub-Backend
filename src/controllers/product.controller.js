import { Product } from "../models/product.model.js"

import { ApiError } from "../utils/ApiError.js"

import { asynHandler } from "../utils/asyncHandler.js"
import { uploadOnClodinary } from "../utils/cloudinary.js";



const createProduct =asynHandler(async(req,res)=>{

   const {name,
   description,
   price,
   category,
   protein,
   fat,
   calories,
   quantity} = req.body;

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
    category,
    price,
    image:productImage.url,
    owner:req.user._id,
     info:{
      protein,
      fat,
      calories,
      quantity,
   }
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

   const products =await Product.find({})

   return res.status(200)
   .json({
      success:true,
      products
   })
})

const getSingleProduct =asynHandler(async(req,res)=>{

   const product =await Product.findById(req.params.id)

  

   if(!product){

      throw new ApiError(
         404,
         "Product not found"
      )
   }


   return res.status(200)
   .json({
      success:true,
      product
   })
})

const updateProduct = async (req, res) => {

   try {

      const { id } = req.params;

      const {
         name,
         description,
         price,
         protein,
         fat,
         quantity,
         amount
      } = req.body;

      const product =
      await Product.findById(id);

      if (!product) {

         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      if(req.file){

         const imageUrl =
         await uploadOnCloudinary(
            req.file.path
         );

         product.image =
         imageUrl.url;
      }

      product.name =
         name || product.name;

      product.description =
         description || product.description;

      product.price =
         price || product.price;

      product.info = {

         protein:
         protein || product.info.protein,

         fat:
         fat || product.info.fat,

         quantity:
         quantity || product.info.quantity,

         amount:
         amount || product.info.amount

      };

      await product.save();

      return res.status(200).json({

         success: true,

         message:
         "Product updated successfully",

         product

      });

   }

   catch (error) {

      console.log(error);

      return res.status(500).json({

         success: false,

         message:
         "Server error"

      });

   }

};



export { createProduct , getAllProducts ,getSingleProduct,  updateProduct}