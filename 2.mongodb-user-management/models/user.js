const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/testapp1")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  image: String,
  email: String,
  name: String,
});

module.exports = mongoose.model("user", userSchema);
