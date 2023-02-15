const mongoose = require("mongoose");

let UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    history: {
      type: String,
      required: false,
      default: 'Avatar'
    },
    groups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }]
  })
  const User = mongoose.model("User", UserSchema);
  
module.exports = User;