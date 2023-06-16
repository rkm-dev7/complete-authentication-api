require("dotenv").config();
const mongoose = require("mongoose");
const db_host = process.env.DB_HOST;
const connectToDatabase = async () => {
    try {
        await mongoose.connect(db_host);
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
};
module.exports = connectToDatabase;
