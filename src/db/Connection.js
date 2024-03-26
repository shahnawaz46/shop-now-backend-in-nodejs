import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({});

const Connection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ecommerce-app.x82kj.mongodb.net/ecommerce-detail?retryWrites=true&w=majority`,
      { autoIndex: true }
    );
    console.log('Database Connected', mongoose.version);
  } catch (err) {
    console.log('Database Connection:- ', err);
  }
};

export default Connection;
