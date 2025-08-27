// const { name } = require("ejs");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://piyush19:piyush19%23@cluster0.k4p6vwq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
console.log("Connected to MongoDB :" + mongoose.connection.readyState);
const userSchema = mongoose.Schema({
  username: String,
  email: String,
  name: String,
  age: Number,
  password: String,
  profilepic:{
   type:String,
   default:"default.jpg",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});

module.exports = mongoose.model("User", userSchema);
