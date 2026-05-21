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

      info:{

         protein:{
            type:String
         },

         fat:{
            type:String
         },

         quantity:{
            type:String
         },

         amount:{
            type:String
         }
      }

   },

   {

      timestamps:true
   }
)



export const Product =mongoose.model("Product",productSchema)