const mongoose = require("mongoose");
const dotenv = require('dotenv')

dotenv.config({})

console.log(process.env.DB_USER, process.env.DB_PASSWORD)
const Connection = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ecommerce-app.x82kj.mongodb.net/ecommerce-detail?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log("Database Connected");
    } catch (err) {
        console.log("Database Connection:- ",err);
    }
}

module.exports = Connection;