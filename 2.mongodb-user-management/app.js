const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const userModel = require("./models/user");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get('/read', async (req, res) => {
    let allUsers = await userModel.find();
    res.render('read', { allUsers });
});

app.post("/create", async (req, res) => {
    let {name,email,image} = req.body;
    let createdUser = await userModel.create({
        name,
        email,
        image
    });
    res.redirect('/read'); // Redirect to read page after creating user
});

app.get('/delete/:id', async (req, res) => {
   let users = await userModel.findOneAndDelete({ _id: req.params.id });
   res.redirect('/read'); 
});

app.get('/edit/:id', async (req, res) => {
   let users = await userModel.findOne({ _id: req.params.id });
   res.render('edit', { user: users });
});

app.post('/update/:id', async (req, res) => {
   let { image, email, name } = req.body;
   let users = await userModel.findOneAndUpdate({ _id: req.params.id }, { image, email, name }, { new: true });
   res.redirect('/read');
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
