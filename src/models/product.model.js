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
      }

   },

   {

      timestamps:true
   }
)



export const Product =mongoose.model("Product",productSchema)