import Router from "express"
import { createOrder, getAllOrders,deliveredOrder } from "../controllers/order.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {verifyAdmin} from "../middlewares/adminVerify.middleware.js"

const router = Router()

router.route("/create-order")
.post(
   verifyJWT,
   createOrder
)

router.route("/all-orders")
.get(
   verifyJWT,
   verifyAdmin,
   getAllOrders
)

router.route("/delivered")
.patch(
   verifyJWT,
   verifyAdmin,
   deliveredOrder
)



export default router