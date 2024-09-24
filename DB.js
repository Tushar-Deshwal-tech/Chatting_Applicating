const mongoose = require("mongoose");


async function connectDatabase() {
    try{
        await mongoose.connect("mongodb+srv://tushardeshwal:nmo8pXRAfMpU4lLm@chating-application.d0tos.mongodb.net/")
        console.log("Connected to Database")
    } catch(error){
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDatabase