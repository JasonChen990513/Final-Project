const mongoose = require('mongoose');

const connectDB = async (connectionUri) => {
    console.log('inside connectDB');
    try {
        const conn = await mongoose.connect(connectionUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`error connecting: ${error}`);
        process.exit(1);
    }
}

module.exports = {connectDB}