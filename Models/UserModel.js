const mongoose = require('mongoose');
const _ = require("lodash");
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Schema = mongoose.Schema;
const UserSchema = new Schema({password: {type: String, required: true,
                              trim: true, minlength: 6},
                              email:{type: String, required: true,unique:true,
                              minlength: 4, validate: {validator: validator.isEmail,
                              message:"{VALUE} is not a valid E-mail."}
                            },
                              tokens:[
                                {access:{
                                    type: String,
                                    required: true
                              }}
                              ,{token:{
                                type: String,
                                required: true
                              }}]
                            });

UserSchema.methods.toJSON = function () {
  var user = this;
  var obj = user.toObject();
  return _.pick(obj,["email","_id"]);
}

UserSchema.statics.findByToken = function (token) {
  var UserModel = this;
  var decoded;
  try {
    decoded =  jwt.verify(token,"abc123");
  } catch(e){
    return Promise.reject();
  }
  return UserModel.findOne({_id:decoded._id,
                            "tokens.access":'auth'
                          });

}

UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = "auth";
  var token = jwt.sign({_id: user._id.toHexString(),access},"abc123").toString();
  user.tokens.push({access,token});
  return user.save().then(() => {
    return token;
  });
};
const UserModel = mongoose.model("User",UserSchema);
module.exports = UserModel;
