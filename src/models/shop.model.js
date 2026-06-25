import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      required:true
    },

    address: {
      type: String,
      default: "",
    },

    shopLogo: {
      type: String,
      default: "",
      required:true
    },

    shopBanner: {
      type: String,
      default: "",
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = mongoose.model(
  "Shop",
  shopSchema
);