const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const app = express();
const userModel = require("./models/user");
const { create } = require("domain");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.post("/create", (req, res) => {
  let { username, email, password, age } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        return res.status(500).send("Error hashing password");
      }
      password = hash;

      let createdUser = await userModel.create({
        username,
        email,
        password,
        age,
      });

      let token = jwt.sign(email, "secretkey");
      res.cookie("token", token);

      res.send(createdUser);
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
app.post("/login", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("User not found");
  }
  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if (err) {
      return res.status(500).send("Error comparing passwords");
    }
    if (!result) {
      return res.status(401).send("Invalid password");
    }

    let token = jwt.sign(user.email, "secretkey");
    res.cookie("token", token);
    res.send("Login successful");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
