import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import db from "./config/db.js"
import bodyParser from 'body-parser'; 
import userRoutes from "./routes/userRoutes.js"
import candidateRoutes from "./routes/candidateRoutes.js"
import { jwtAuthMiddleware } from "./middleware/auth.js"

dotenv.config();

const app = express();
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000


app.use("/user", userRoutes)
app.use("/candidate", candidateRoutes)

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
