import { Cart } from "../models/cart.model.js"
import { Product } from "../models/product.model.js"
import { ApiError } from "../utils/ApiError.js"

import { asynHandler } from "../utils/asyncHandler.js"

const addToCart = asynHandler(async(req,res)=>{

   const { productId, quantity} = req.body

   if(!productId){
      throw new ApiError(
         400,
         "Product id required"
      )
   }


   const product =await Product.findById( productId)

   if(!product){
      throw new ApiError(
         404,
         "Product not found"
      )
   }

   const existingCart = await Cart.findOne(
    {
    user:req.user._id,
    product:productId
     })



   if(existingCart){
      existingCart.quantity += quantity
      await existingCart.save()

      return res.status(200)
      .json({
         success:true,
         message:
         "Quantity updated"
      })
   }



   const cart = await Cart.create({
      user:req.user._id,
      product:productId,
      quantity
   })



   return res.status(201)
   .json({
      success:true,
      message:
      "Added to cart",
      cart
   })
})

const getMyCart =asynHandler(async(req,res)=>{
   const cart =await Cart.find({user:req.user._id}).populate("product")


   return res.status(200)
   .json({
      success:true,
      cart
   })
})

const updateQuantity =asynHandler(async(req,res)=>{
   const {
      cartId,
      quantity
   } = req.body



   const cart = await Cart.findById( cartId )

   if(!cart){
      throw new ApiError(
         404,
         "Cart not found"
      )
   }

   cart.quantity = quantity
   await cart.save()


   return res.status(200)
   .json({
      success:true,
      message:
      "Quantity updated"
   })
})

const removeCartItem =asynHandler(async(req,res)=>{

   const { cartId } =req.params

   await Cart.findByIdAndDelete(
      cartId
   )



   return res.status(200)
   .json({
      success:true,
      message:
      "Item removed"
   })
})

export { addToCart , getMyCart , updateQuantity, removeCartItem}