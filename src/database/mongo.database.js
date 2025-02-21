import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({});

const mongoDBConnection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ecommerce-app.x82kj.mongodb.net/ecommerce-detail?retryWrites=true&w=majority`,
      { autoIndex: true }
    );
    console.log('mongoDB Database Connected', mongoose.version);
  } catch (err) {
    console.log('mongoDB Database Connection Error: ', err);
  }
};

export default mongoDBConnection;
