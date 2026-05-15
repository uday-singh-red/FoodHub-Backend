import jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { Response } from "../utils/response.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendmail.js";
import crypto from "crypto"
import { truncate } from "fs";

const option={
      httpOnly:true,
      secure:true
  }

const generateRefreshAndAccessToken=async(userId)=>{
   try {
     const user= await User.findById(userId)
     const accessToken=user.generateAccessToken();
     const refreshToken=user.generateRefreshToken();

     user.refreshToken=refreshToken;
     await user.save({validateBeforeSave:false})

     return {accessToken,refreshToken}


   } catch (error) {
      throw new ApiError(500,"spmethin went wrong while generating token")
   }
}

const registerUser= asynHandler( async(req, res)=>{

   const otp =
      Math.floor(
      100000 + Math.random() * 900000
      ).toString()
   
   const {fullname , email, username, password } = req.body|| {};

 // console.log("CONTENT-TYPE:", req.headers["content-type"]);

      // console.log("BODY:", req.body);
      // console.log("FILES:", req.files);

     if ([username,email,fullname,password].some((field)=>field?.trim()===""))
         {
         throw new ApiError(400,"all field should be complete")
        }

        const existingUser=await User.findOne(
           {
            $or:[{email}, {username}]
           }
        )

        if(existingUser){
            throw new ApiError(409,"user is already registerd")
        }
      //   console.log(existingUser)

     const avatarLocalPath = req.files?.avatar?.[0]?.path;
     const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
     
       if (!avatarLocalPath) {
        throw new ApiError(400," avatar is mendatory ")
       }

       const avatar= await uploadOnClodinary(avatarLocalPath)
       const coverImage= await uploadOnClodinary(coverImageLocalPath)



       if (!avatar) {
         throw new ApiError(400," avatar is not uploaded ")
       }

     const user = await User.create({
                fullname,
                password,
                username: username.toLowerCase(),
                email,
                avatar: avatar.url,
                coverimage: coverImage?.url || "", // this line check aur cover image
                otp,
                otpExpiry :  Date.now() + 10 * 60 * 1000
            })

            try {
               await sendEmail(email, otp);

            } catch (error)
           {
                 await User.deleteOne({
                     _id:user._id
                  })

                  throw new ApiError(
                     500,
                     "Email not sent"
                  )
            }

     const createUser=await User.findById(user._id).select("-password -referstoken -otp")

     if(!createUser){
        throw new ApiError(500, "something went wrong during registration")
     }


   return res.status(201).json({
   success:true,
   message:"OTP sent to email",
   user:createUser
})
})


  const loginUser=asynHandler(async(req,res,next)=>{
 
const { email, username, password}=req.body;

   if(!email  && !username){
      throw new ApiError(403,"email or password is required")
   }

   const user = await User.findOne({
      $or:[{email},{username}]
   })

   if(!user){
      throw new ApiError(401,"user is not found")
   }

   if(user.googleAuth){
   throw new ApiError(
      401,
      "Please login with Google"
   )
}

   if(!password){
      throw new ApiError(403, "password is required")
   }


   const isPasswordValid= await user.isPasswordCorrect(password)

   if(!user.isVerified){
   throw new ApiError(
      401,
      "Please verify your email first"
   )
}

   if(!isPasswordValid){
      throw new ApiError(401,"your password and email is not match")
   }

  const {refreshToken,accessToken}=await generateRefreshAndAccessToken(user._id)

  const loggedInUser=await User.findById(user._id).select("-refreshToken -password")

  

  return res
  .status(200)
  .cookie('accessToken',accessToken,option)
  .cookie('refreshToken',refreshToken,option)
  .json(
   new Response(
      200,
      {
         user:loggedInUser
      },
      "user logedin successfully"
   )
  )

 

  })

  const googleLogin = asynHandler(async (req, res) => {

   const {
      fullname,
      email,
      avatar
   } = req.body

   console.log("google user a gaya")

   if (!email) {
      throw new ApiError(400, "Email is required")
   }

   // CHECK USER
   let user = await User.findOne({ email })

   // AGAR USER NAHI HAI
   if (!user) {

      user = await User.create({
         fullname,
         email,
         avatar,
         username:
         email.split("@")[0] +
         Math.floor(Math.random() * 1000),

         password:crypto.randomBytes(32).toString("hex"),
         isVerified:true,
         googleAuth:true

      })
   }
   // TOKENS
   const {refreshToken,accessToken}=await generateRefreshAndAccessToken(user._id)


   await user.save({ validateBeforeSave:false })


   // FINAL USER
   const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

   return res
   .status(200)
   .cookie(
      "accessToken",
      accessToken,
      option
   ).cookie(
      "refreshToken",
      refreshToken,
      option
   )
   .json(new Response(
         200,
         loggedInUser,
         "Google login success"
      )
   )
})

const verifyOtp = asynHandler(
async(req,res)=>{
   const {email, otp} = req.body

   if(!email || !otp){
      throw new ApiError(
         400,
         "Email and OTP required"
      )
   }

   const user =await User.findOne({email})

   if(!user){
      throw new ApiError(
         404,
         "User not found"
      )
   }

   if(user.otp !== otp){
      throw new ApiError(
         400,
         "Invalid OTP"
      )
   }

   if(user.otpExpiry < Date.now()){
      throw new ApiError(
         400,
         "OTP expired"
      )
   }

   // VERIFIED
   user.isVerified = true
   user.otp = undefined
   user.otpExpiry = undefined
   await user.save()

   // TOKENS
   const {
      accessToken,
      refreshToken
   } =
   await generateRefreshAndAccessToken(
      user._id
   )

   // LOGIN USER
   const loggedInUser =
   await User.findById(user._id)
   .select("-password -refreshToken")

   return res
   .status(200)
   .cookie(
      "accessToken",
      accessToken,
      option
   )
   .cookie(
      "refreshToken",
      refreshToken,
      option
   )
   .json({
      success:true,
      user:loggedInUser,
      message:
      "Email verified & logged in"
   })
})

  const logOut= asynHandler(async (req,res)=>{
     await User.findByIdAndUpdate(
         req.user._id,
         {
            $set: {refreshToken:undefined}
         },
         {new:true}
      )

 return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(
   new Response(200,{},"user loged out")
  )


  })


  const refreshAccessToken = asynHandler(async(req,res)=>{

   const incomingRefreshToken=  req.cookies.refreshToken||req.body.refreshToken

   try {
      if(!incomingRefreshToken){
         throw new ApiError(401,"token is not right or recieve"); 
      }
   
      const decodedToken=await jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
      const user=await User.findById(decodedToken?._id)
   
      if(!user){
         throw new ApiError(401,"invalid refresh token")
      }
   
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"invalid token")
      }
   
      const {accessToken,refreshToken}= await generateRefreshAndAccessToken(user._id)
   
      return res
      .status(200)
      .cookie('accessToken',accessToken,option)
      .cookie('refreshToken',refreshToken,option)
      .json(
         new Response(
            200,
            {
               refreshToken,
               accessToken
            },
            "token is refresh successfully"
         )
      )
   } catch (error) {
      throw new ApiError(401,error?.message || "invalid token")
   }

  })

  const changeCurrentPassword= asynHandler(async(req,res)=>{

   console.log(req.body)

   const {oldPassword, newPassword}=req.body
   console.log(req.user)

   const user=await User.findById(req.user?._id)
   const isCorrect=await user.isPasswordCorrect(oldPassword)

   if(!isCorrect){
      throw new ApiError(401,"old password is not correct");
   }

   user.password=newPassword;
   await user.save({validateBeforeSave:false});

   return res
   .status(200)
   .json(new Response(200,{},"password change successfully"))

  })

  const getCurrentUser= asynHandler(async(req,res)=>{
   return res
   .status(200)
   .json(new Response(200,req.user,"current user fetched successfull"))
  })

  const updateAccountDetails= asynHandler(async(req,res)=>{
   const{fullname,email}=req.body

   if(!fullname || !email){
      throw new ApiError(401, "all filds are required")
   }

     const user = await User.findByIdAndUpdate(
         req.user?._id,
         {
           $set:{
            fullname,
            email
           } 
         },
         {returnDocument:"after"}
  ).select("-password")

  return res
  .status(200)
  .json(new Response(200,user,"your profile is update"))
  })

  const updateAvatar=asynHandler(async(req,res)=>{
  const avatarLocalPath= req.file?.path

  if(!avatarLocalPath){
   throw new ApiError(400,"avtar is not load")
  }

  const avatar=await uploadOnClodinary(avatarLocalPath)

  
  if(!avatar){
   throw new ApiError(400,"avtar is not upload on cloudinary")
  }

  const user= await User.findByIdAndUpdate(
   req.user?._id,
   {
      $set:{
         avatar:avatar.url
      }
   },
   {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new Response(200,user,"avatar upload successfully"))
  })

 const updateCoverImage=asynHandler(async(req,res)=>{
  const coverImageLocalPath= req.file?.path

  if(!coverImageLocalPath){
   throw new ApiError(400,"coverImage is not load")
  }

  const coverImage=await uploadOnClodinary(coverImageLocalPath)

  
  if(!coverImage){
   throw new ApiError(400,"coverImage is not upload on cloudinary")
  }

  const user= await User.findByIdAndUpdate(
   req.body?._id,
   {
      $set:{
         coverImage:coverImage.url
      }
   },
   {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new Response(200,user,"coverImage upload successfully"))
  })

 const userSubscription=asynHandler(async()=>{
   const {username} = req.params.username

   if(!username){
      throw new ApiError(400, "usename not found in subscription")
   }

   const channel= await User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         }
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
         }
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
         }
      },
      {
         $addFields:{
            subscriberCount:{
               $size:"$subscribers"
            },
            subscribedCount:{
                $size:"$subscribedTo"
            },

            isSubscribed:{
               $cond:{
                  if:{
                     $in:[req.user?._id,"$subscribers.subscriber"]
                  },
                  then:true,
                  else:false
               }
            }     
         }
      },
      {
         $project:{
            username:1,
            fullname:1,
            email:1,
            isSubscribed:1,
            subscriberCount:1,
            subscribedCount:1,
            avatar:1,
            coverImage:1
         }
      }
   ])

   if(!channel?.length){
      throw new ApiError(200,"channel is not found")
   }

   return res
   .status(200)
   .json(
      new Response(200,channel[0],"channel is fetched successfully")
   )
 })

 const userWatchHistory=asynHandler(async(req,res)=>{
   
   const user = await User.aggregate([
      {
         $match:{
            _id: new mongoose.Types.ObjectId(req.user?._id)
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:"watchhistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline : [
               {
                  $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"owner",
                     pipeline: [
                        {
                           $project:{
                              username:1,
                              fullname:1,
                              avatar:1
                           }
                        }
                     ]
                  }
               }
            ]
         }
      }

   ])

   res
   .status(200)
   .json(
      new Response(200, user[0].watchhistory, " watch history")
   )
 })


export { registerUser,
         loginUser,
         logOut,
         refreshAccessToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateAvatar,
         updateCoverImage,
         userSubscription,
         userWatchHistory,
         googleLogin,
         verifyOtp
   }