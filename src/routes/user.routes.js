import { Router } from "express";
import { changeCurrentPassword, loginUser, logOut, refreshAccessToken, registerUser,getCurrentUser, userWatchHistory, updateAccountDetails, updateAvatar, updateCoverImage, userSubscription,verifyOtp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { googleLogin } from "../controllers/user.controller.js"

const router= Router();

router.route("/register").post(
     (req, res, next) => {
    next();
  },
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    (req, res, next) => {
    next();
  },
    registerUser
  )

  router.route("/login").post(loginUser)

  router.route("/verify-otp").post(verifyOtp)

  router.route("/google-login").post(googleLogin)

  router.route("/logout").post(verifyJWT,logOut)

  router.route("/refresh-token").post(refreshAccessToken)

  router.route("/changePassword").post(verifyJWT,changeCurrentPassword)

  router.route("/currentUser").get(verifyJWT,getCurrentUser)

  router.route("/update-profile").patch(verifyJWT,updateAccountDetails)

  router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

  router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)

  router.route("/c/:username").get(verifyJWT,userSubscription)

  router.route("/watchHistory").get(verifyJWT,userWatchHistory)

export {router};