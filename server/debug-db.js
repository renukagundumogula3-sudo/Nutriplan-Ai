const mongoose = require('mongoose');
require('dotenv').config();
const Recipe = require('./models/Recipe');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'nutriplan' });
        console.log("Connected to Mongo");

        const recipes = await Recipe.find({});
        console.log(`Found ${recipes.length} recipes in Mongoose`);

        recipes.forEach(r => {
            console.log(`- ${r.title}: ${r._id.toString()}`);
        });

        // Test explicit query with string ID from user log
        const validationId = "6958187596f643f1d0e83cb1"; // From user log
        const test = await Recipe.findById(validationId);
        console.log(`\nDirect lookup for ${validationId}:`, test ? "FOUND" : "NOT FOUND");

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
