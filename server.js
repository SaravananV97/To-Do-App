require("./config/config");
const authenticate = require("./authenticate/auth")
const mongoose = require("./Data/mongo");
const _= require("lodash");
const passwordHash = require("password-hash");
const bodyparser = require('body-parser');
const ToDoModel = require("./Models/AppModel");
const UserModel = require("./Models/UserModel");
const {ObjectID} = require("mongodb");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var newToDo,newUser;
app.use(bodyparser.json());

app.post("/user",(req,res) => {
var body = _.pick(req.body,["email","password"]);
newUser = new UserModel(body);
newUser.save().then(() => {
     return newUser.generateAuthToken();
   })
   .then((token) => {
     res.header("x-auth",token).send(newUser);
   }).catch((err) => {res.status(400).send(err);
   });
 });
app.post("/todos",authenticate,(req,res) => {
  newToDo = new ToDoModel({task:req.body.task,completed:false,userid:req.user._id});
   newToDo.save().then((doc) => {
     res.send(doc);
     newToDo = "";
   },(err) => {res.status(400).send(err);
   });
});
app.post("/users/login",(req,res) => {
  var body = _.pick(req.body,["email","password"]);
  UserModel.findByCredentials(body.email,body.password).then((user) =>{
    return user.generateAuthToken().then((token) => {
      res.header("x-auth",token).send(user);
    })
  }).catch((err) => {
    res.status(400).send();
  })
});

app.patch("/todos/:id",authenticate,(req,res) => {
  var id = req.params.id;
  var body = _.pick(req.body,['task', 'completed' ]);
  if(!ObjectID.isValid(id))
    return  res.status(404).send()
  if(body.completed){
    body["completedTime"] = Date.now();
  }
  ToDoModel.findOneAndUpdate({_id:id,userid: req.user._id} ,{$set:body},{new:true}).then((doc) => {
    res.send(doc);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.delete("/users/me/token",authenticate,(req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  },() => {
    res.status(400).send();
  });
})

app.get("/users/me",authenticate,(req,res) => {
    res.send(req.user);
  });
app.delete("/todos/:id",authenticate,(req,res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id))
      res.status(404).send();
  ToDoModel.findOneAndRemove({userid:req.user._id,
                              _id:id}).then((todo) => {
    if(!todo)
      res.status(400).send()
    res.send(todo)
  },(err) => {
    res.send(err);
  });
});
app.get("/todos/:id",authenticate,(req,res) => {
  var id  = req.params.id;
  if(!ObjectID.isValid(id))
    res.status(404).send("Invalid ID");
  else{
    ToDoModel.findOne({_id:id,userid:req.user._id}).then((todo) => {
      if(!todo)
        res.status(404).send();
      res.send(todo).status(200);
    },(err) => {
      res.status(400).send();
    });
  }
});
app.get("/todos" ,authenticate ,(req,res) => {
  ToDoModel.find({userid:req.user._id}).then((todos) => {
    res.send(todos);
  }).catch(err => {
    res.status(400).send(err);
  })
})
app.listen(port,() =>{console.log("Listening on port " + port)});
module.exports = app;
