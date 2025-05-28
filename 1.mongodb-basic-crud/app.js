const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./usermodel");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB with error handling
mongoose
  .connect("mongodb://localhost:27017/mongopractice", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/create", async (req, res) => {
  try {
    const createdUser = await userModel.create({
      name: "John Doe",
      username: "johndoe",
      email: "johndoe@example.com",
    });
    res.send(createdUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Failed to create user.");
  }
});

app.get("/update", async (req, res) => {
  let updateUser = await usermodel.findOneAndUpdate(
    { username: "johndoe" },
    { name: "Shovon", email: "shovon@example.com" ,username: "shovon"}, 
    { new: true }
  );

  res.send(updateUser);
});

app.get('/read' , async (req, res) => {
  let readUser = await usermodel.find({});

  res.send(readUser);
});

app.get('/delete', async (req, res) => {
  let deleteUser = await usermodel.findOneAndDelete({username : "shovon"});
  res.send(deleteUser);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
