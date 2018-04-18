const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ToDoSchema = new Schema({task: {type:String, required:true,
                              placeholder: "Create a task",min:3}, completed: Boolean,
                          completedTime:{type: Date, default: null}});
const ToDoModel = mongoose.model("ToDo",ToDoSchema);

module.exports = ToDoModel;
