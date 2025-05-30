const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.get("/create", async function (req, res) {
  let user = await userModel.create({
    username: "john_doe",
    email: "john@example.com",
    age: 30,
    posts: [],
  });
  res.send(user);
});

app.get("/post/create", async (req, res) => {
  let post = await postModel.create({
    postdata: "shovon",
    user: "68387b3a0b33623931a7df90",
    date: new Date(),
  });
 

  let user = await userModel.findById("68387b3a0b33623931a7df90");
  user.posts.push(post._id); 
  user.save();
   res.send({post, user});
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
