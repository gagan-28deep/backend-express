import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    // MongoDB returns object , after connection is successfull we can hold response
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // console.log(connectionInstance);
    console.log("DB connected");
    console.log(`MongoDB connected , DB-host -> ${connectionInstance}`);
    console.log(
      `MongoDB connected , DB-host -> ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error connecting DB", error);
    process.exit(1);
  }
};

export default connectDb;
