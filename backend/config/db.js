const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Debug: Check if MONGO_URI exists
        console.log('MONGO_URI exists?', process.env.MONGO_URI ? 'YES' : 'NO');
        
        if (!process.env.MONGO_URI) {
            console.error('ERROR: MONGO_URI is not defined in environment variables');
            process.exit(1);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } 
    catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Stop the server if DB fails
    }
};

module.exports = connectDB;