const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({userid: {type:String, required:true,
                              trim:true},email:{type:String, required: true}});
const UserModel = mongoose.model("User",UserSchema);
module.exports = UserModel;
