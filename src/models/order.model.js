import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
{
   user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
   },

   product:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Product",
      required:true
   },

   quantity:{
      type:Number,
      required:true
   },

   address:{
      type:String,
      required:true
   },

   phone:{
      type:String,
      required:true
   },

   paymentMethod:{
      type:String,
      enum:[ "cod","online" ],
      required:true
   },

   paymentApp:{
      type:String,
      default:""
   },


  status:{

   type:String,
   enum:[
      "Pending",
      "Delivered"
   ],
   default:"Pending"
   }

},

{
   timestamps:true
}

)


export const Order =
mongoose.model(
   "Order",
   orderSchema
)