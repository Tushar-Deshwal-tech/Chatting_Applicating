const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    number: String,
    time: {
        type: Date,
        default: Date.now
    }
});


const Users = mongoose.model("Users", UserSchema);

module.exports = Users
