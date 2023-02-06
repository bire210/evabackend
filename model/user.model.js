const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {type : String},
    email : String,
    password : String,
    role : {type : String, enum : ["user", "manager"], default : "user"}
})

const UserModel = mongoose.model("user", userSchema);


module.exports = {
    UserModel
}
