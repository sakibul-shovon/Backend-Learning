const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multerconfig = require("./config/multerconfig");

// Middleware Configuration
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Authentication Middleware
function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    return res.redirect("/login");
  }
  try {
    const data = jwt.verify(req.cookies.token, "secretkey");
    req.user = data;
    next();
  } catch (error) {
    res.redirect("/login");
  }
}

// Auth Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      const token = jwt.sign(
        { email: user.email, userid: user._id },
        "secretkey"
      );
      res.cookie("token", token);
      res.status(200).send("Login successful");
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send("Login error");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, username, name, age } = req.body;
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      email,
      password: hash,
      username,
      age: parseInt(age),
    });

    const token = jwt.sign({ email: email, userid: user._id }, "secretkey");
    res.cookie("token", token);
    res.send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user");
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

// Profile Routes
app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ email: req.user.email });
    const allPosts = await postModel
      .find({})
      .populate("user")
      .sort({ _id: -1 });

    res.render("profile", { user: currentUser, allPosts });
  } catch (error) {
    res.status(500).send("Error loading profile");
  }
});

// Post Routes
app.post("/posts", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const { content } = req.body;

    const post = await postModel.create({
      content,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error creating post");
  }
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");
    const likeIndex = post.likes.indexOf(req.user.userid);

    if (likeIndex === -1) {
      post.likes.push(req.user.userid);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error updating like");
  }
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id).populate("user");
    res.render("edit", { post });
  } catch (error) {
    res.status(500).send("Error loading edit page");
  }
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  try {
    await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { content: req.body.content },
      { new: true }
    );
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Error updating post");
  }
});

// Add this route after your profile routes
app.post("/upload-profile-pic", isLoggedIn, multerconfig.single("profilepic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const user = await userModel.findOne({ email: req.user.email });
    
    // If there's an existing profile pic and it's not the default, delete it
    if (user.profilepic && user.profilepic !== 'default.jpg') {
      const oldPicPath = path.join(__dirname, 'public', 'images', 'upload', user.profilepic);
      try {
        require('fs').unlinkSync(oldPicPath);
      } catch (err) {
        console.error("Error deleting old profile picture:", err);
      }
    }

    // Update user's profile picture
    user.profilepic = req.file.filename;
    await user.save();
    
    res.redirect("/profile");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).send("Error uploading profile picture");
  }
});

// Server Start
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
