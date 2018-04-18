require("./config/config");
const mongoose = require("./Data/mongo");
const _= require("lodash");
const bodyparser = require('body-parser');
const ToDoModel = require("./Models/AppModel");
const UserModel = require("./Models/UserModel");
const {ObjectID} = require("mongodb");
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var newToDo;
app.use(bodyparser.json());
app.post("/user",(req,res) => {
var newUser = new UserModel({userid:req.body.userid,email:req.body.email});
newUser.save().then((doc) => {
     res.send(doc);
   },(err) => {res.status(400).send(err);
   });
});
app.post("/todos",(req,res) => {
  newToDo = new ToDoModel({task:req.body.task,completed:false});
   newToDo.save().then((doc) => {
     res.send(doc);
     newToDo = "";
   },(err) => {res.status(400).send(err);
   });
});
app.patch("/todos/:id",(req,res) => {
  var id = req.params.id;
  var body = _.pick(req.body,['task', 'completed' ]);
  if(!ObjectID.isValid(id))
    return  res.status(404).send()
  if(body.completed){
    body["completedTime"] = Date.now();
  }
  ToDoModel.findByIdAndUpdate(id,{$set:body},{new:true}).then((doc) => {
    res.send(doc);
  }).catch((err) => {
    res.status(400).send(err);
  })
});
app.delete("/todos/:id",(req,res) => {
  var id = req.params.id;
  if(!ObjectID.isValid(id))
      res.status(404).send();
  ToDoModel.findByIdAndRemove(id).then((todo) => {
    if(!todo)
      res.status(400).send()
    res.send(todo)
  },(err) => {
    res.send(err);
  });
});
app.get("/todos/:id",(req,res) => {
  var id  = req.params.id;
  if(!ObjectID.isValid(id))
    res.status(404).send("Invalid ID");
  else{
    ToDoModel.findById(id).then((todo) => {
      if(!todo)
        res.status(404).send()
      res.send(todo).status(200);
    },(err) => {
      res.status(400).send();
    });
  }
});
app.get("/todos",(req,res) => {
  ToDoModel.find({}).then((todos) => {
    res.send(todos);
  }).catch(err => {
    res.status(400).send(err);
  })
})
app.listen(port,() =>{console.log("Listening on port " + port)});
module.exports = app;
