import mongoose,{ Schema } from "mongoose"



const productSchema =
new Schema(

   {

      name:{
         type:String,
         required:true,
         trim:true
      },

      description:{
         type:String,
         required:true,
         trim:true
      },

      image:{
         type:String,
         required:true
      },

      owner:{
         type:Schema.Types.ObjectId,
         ref:"User",
         required:true
      },

      price:{
         type:Number,
         required:true
      },

      category:{
         type:String,
         required:true
      },

      state:{
         type:String,
         enum:["visible","notVisible"],
         default:"visible"
      },

      rating:{
         type:Number,
         default:4.5
      },

      info:{

         protein:{
            type:String
         },

         fat:{
            type:String
         },
         calories:{
            type:String
         },
         quantity :{
            type:String
         },
      }

   },

   {

      timestamps:true
   }
)



export const Product =mongoose.model("Product",productSchema)