import { Order }
from "../models/order.model.js"

import { Product }
from "../models/product.model.js"

import { ApiError }
from "../utils/ApiError.js"

import { asynHandler }
from "../utils/asyncHandler.js"



const createOrder =asynHandler(async(req,res)=>{
   const {
      productId,
      quantity,
      address,
      phone,
      paymentMethod,
      paymentApp
   } = req.body



   if(
      !productId ||
      !quantity ||
      !address ||
      !phone ||
      !paymentMethod
   ){

      throw new ApiError(
         400,
         "All fields required"
      )
   }

   const product =
   await Product.findById(productId)

   if(!product){
      throw new ApiError(
         404,
         "Product not found"
      )
   }

   const order =await Order.create({
      user:req.user._id,
      product:productId,
      quantity,
      address,
      phone,
      paymentMethod,
      paymentApp
   })


   return res.status(201)
   .json({

      success:true,

      message:
      "Order placed successfully",

      order
   })
})



const getAllOrders =asynHandler(async(req,res)=>{
   const orders = await Order.find({status: "Pending"}).populate("user").populate("product")

   return res.status(200)
   .json({
      success:true,
      orders
   })
})

const deliveredOrder = asynHandler(

async(req,res)=>{

   const { orderId } =
   req.body



   const order =
   await Order.findById(
      orderId
   )



   if(!order){

      throw new ApiError(
         404,
         "Order not found"
      )
   }



   order.status ="Delivered"

   await order.save()



   return res.status(200)
   .json({

      success:true,

      message:
      "Order delivered"
   })
})

export {
   createOrder,
   getAllOrders,
   deliveredOrder
}