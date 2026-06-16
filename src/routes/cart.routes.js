import { Router} from "express"
import { addToCart , getMyCart, updateQuantity, removeCartItem} from "../controllers/cart.controller.js"
import { verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/add").post(
   verifyJWT,
   addToCart
)

router.route("/my-cart").get(
   verifyJWT,
   getMyCart
)

router.route("/update")
.patch(
   verifyJWT,
   updateQuantity
)



router.route("/remove/:cartId")
.delete(
   verifyJWT,
   removeCartItem
)

export default router