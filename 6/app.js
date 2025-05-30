const express = require("express");
const app = express();
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const postModel = require("./models/post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, (req, res) => {
  console.log(req.user);
  res.render("login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      res.status(200).send("you can login");
      let token = jwt.sign(
        { email: user.email, userid: user._id },
        "secretkey"
      );
      res.cookie("token", token);
    } else res.redirect("/login");
  });
});

app.get("/logout", async (req, res) => {
  res.cookie("token", ""), res.redirect("/login");
});

app.post("/register", async (req, res) => {
  try {
    let { email, password, username, name, age } = req.body;
    let existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    let user = await userModel.create({
      email,
      password: hash,
      username,
      name,
      age: parseInt(age),
    });

    let token = jwt.sign({ email: email, userid: user._id }, "secretkey");
    res.cookie("token", token);
    res.send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token == "") {
    return res.redirect("/login");
  } else {
    let data = jwt.verify(req.cookies.token, "secretkey");
    req.user = data;
  }
  next();
}

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
