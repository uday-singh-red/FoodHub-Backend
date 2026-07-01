import express from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
   getPendingShops,
   approveShop,
   rejectShop,
   createShop,
   getAllShops,
   getSingleShop
}
from "../controllers/shop.controller.js";

import {
   verifyAdmin
}
from "../middlewares/adminVerify.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";


const router = express.Router();

router.route( "/create").post( verifyJWT,
     upload.fields([
      {
         name: "shopLogo",
         maxCount: 1
      },
      {
         name: "shopBanner",
         maxCount: 1
      }
   ])
   ,createShop);

router.get(
   "/pending",
   verifyJWT,
   verifyAdmin,
   getPendingShops
);

router.put(
   "/approve/:id",
   verifyJWT,
   verifyAdmin,
   approveShop
);

router.delete(
   "/reject/:id",
   verifyJWT,
   verifyAdmin,
   rejectShop
);

router.get(
   "/all-shops",
   getAllShops
);

router.get(
   "/:id",
   getSingleShop
);



export default router;