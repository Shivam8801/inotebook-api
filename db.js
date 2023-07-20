import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const mongoURI = process.env.MONGO_URI

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log("connected to database successfully!")
    } catch (error) {
        console.error(error)
    }
}

export default connectToMongo;
