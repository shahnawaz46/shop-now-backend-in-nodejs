import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({});

const mongoDBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DATABASE_URI, { autoIndex: true });
    console.log("mongoDB Database Connected", mongoose.version);
  } catch (err) {
    console.log("mongoDB Database Connection Error: ", err);
  }
};

export default mongoDBConnection;
