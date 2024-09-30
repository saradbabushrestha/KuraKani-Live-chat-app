import mongoose from "mongoose";

const connectToMongoDB = async (res, req) => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error Connecting to MongoDB", error.message);
  }
};
export default connectToMongoDB;
