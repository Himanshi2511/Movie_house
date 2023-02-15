const mongoose = require('mongoose');


let ChatSchema = new mongoose.Schema({
    user: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  })
  const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;

