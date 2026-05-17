import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/adminVerify.middleware.js";
import { createProduct, getAllProducts } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router= Router();

router.route("/create-product").post(verifyJWT,verifyAdmin, upload.single("image"),createProduct)

router.route("/all-products").get(getAllProducts)

export default router;