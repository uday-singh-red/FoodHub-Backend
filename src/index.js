import dotenv from "dotenv"
dotenv.config({ path: "./.env" })
import connectDB from './db/index.js'
import { app } from "./app.js"
import cron from "node-cron"
import { User } from "./models/user.model.js"

cron.schedule(
   "0 * * * *",
   async()=>{
      try{
         await User.deleteMany({
            isVerified:false,
            createdAt:{
               $lt:
               new Date(
                  Date.now()
                  -
                  24 * 60 * 60 * 1000
               )
            }
         })
         console.log(
            "Unverified users deleted"
         )
      }catch(error){
         console.log(error)
      }
   }
)


connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000, ()=>{
        console.log('server is running WOW ')
        console.log("port is : ",process.env.PORT)
    })
})
.catch((err)=>{
    console.log('something went wrong :',err )
})
