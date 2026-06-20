import express, { Router } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorMiddleware from "./middlewares/error.middleware.js"

const app= express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({limit: '16kb', extended:true}))

app.use(express.static("public"))

app.use(cookieParser())


//import router

import { router } from './routes/user.routes.js';
import productRouter from './routes/product.routes.js'
import orderRouter from "./routes/order.routes.js"
import cartRouter from "./routes/cart.routes.js"
import shopRouter from "./routes/shop.routes.js"


app.use("/api/v1/users", router)
app.use("/api/v1/products",productRouter)
app.use("/api/v1/orders", orderRouter)
app.use( "/api/v1/cart",  cartRouter )
app.use("/api/v1/shops", shopRouter)


app.use(errorMiddleware)

export { app }