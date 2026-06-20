import mongoose,{ Schema } from "mongoose"



const productSchema = new mongoose.Schema({

   shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
   },

   name: {
      type: String,
      required: true,
      trim: true
   },

   description: {
      type: String
   },

   images: [
      {
         url: String,
         publicId: String
      }
   ],

   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
   },

   price: {
      type: Number,
      required: true
   },

   discountedPrice: Number,

   stock: {
      type: Number,
      default: 0
   },

   isAvailable: {
      type: Boolean,
      default: true
   },

   // Optional Tags
   isVeg: Boolean,
   isVegan: Boolean,
   isSpicy: Boolean,
   isFeatured: Boolean,
   isBestSeller: Boolean,

   // Optional
   preparationTime: Number,

   ingredients: [String],

   allergens: [String],

   nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number
   },

   sizes: [
      {
         name: String,
         price: Number
      }
   ],

   addons: [
      {
         name: String,
         price: Number
      }
   ],

   averageRating: {
      type: Number,
      default: 0
   },

   totalReviews: {
      type: Number,
      default: 0
   }

}, { timestamps: true })



export const Product =mongoose.model("Product",productSchema)