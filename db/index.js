const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

module.exports = async () => {

    try {
        const x = await mongoose.connect(MONGODB_URI);
        console.log(`Connected to Mongo.Database name:${x.connections[0].name}`)
    } catch (err) {
        console.log('Error connecting to Mongo:', err);
    }
}