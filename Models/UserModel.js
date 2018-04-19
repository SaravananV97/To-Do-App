const mongoose = require('mongoose');
const _ = require("lodash");
const passwordHash = require("password-hash");
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Schema = mongoose.Schema;
const UserSchema = new Schema({password: {type: String, required: true,
                              trim: true, minlength: 6},
                              email:{type: String, required: true,unique:true,
                              minlength: 4, validate: {validator: validator.isEmail,
                              message:"{VALUE} is not a valid E-mail."}
                            },
                            access:{
                                    type: String,
                                    required: false
                              }
                            ,token:{
                                type: String,
                                required: false
                              }
                            });

UserSchema.statics.findByCredentials = function (email,password) {
  var User = this;
  return User.findOne({email}).then((user) => {
    if(!user)
      return Promise.reject();
    return new Promise((resolve,reject) => {
        if(passwordHash.verify(password,user.password))
            resolve(user);
        else {
          reject();
        }
    })
  })
}

UserSchema.methods.toJSON = function () {
  var user = this;
  var obj = user.toObject();
  return _.pick(obj,["email","_id"]);
}

UserSchema.pre("save",function(next,done){
  var user = this;
  if(user.isModified("password")){
    var hashedPwd = passwordHash.generate(user.password);
    user.password = hashedPwd;
    next();
  }else {
    next();
  }
})

UserSchema.statics.findByToken = function (token) {
  var UserModel = this;
  var decoded;
  try {
    decoded =  jwt.verify(token,"abc123");
  } catch(e){
    return Promise.reject();
  }
  return UserModel.findOne({_id:decoded._id,
                          access:'auth',
                          token
                          });

}

UserSchema.methods.removeToken = function (token) {
  var user = this;
  return new Promise((resolve,reject) => {
    if(user.token !== token)
      reject();
    else{
  user.token = null;
  user.save();
  resolve();
    }
  })
}

UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = "auth";
  var token = jwt.sign({_id: user._id.toHexString(),access},"abc123").toString();
  user.token= token;
  user.access = access;
  return user.save().then(() => {
    return token;
  });
};
const UserModel = mongoose.model("User",UserSchema);
module.exports = UserModel;
