const mongoose = require('mongoose');
let MeetSchema = new mongoose.Schema({
    meetname: {
      type: String,
      required: true
    },
    meethost: {
      type: String,
      required: true
    },
    meetdetails: {
      type: String,
      required: true
    },
    startdate: {
      type: String,
      required: true
    },
    starttime: {
      type: String,
      required: true
    },
    enddate: {
      type: String,
      required: true
    },
    endtime: {
      type: String,
      required: true
    },
    status: Number, //Check for the meet is cancelled or not
    reminder: Number, //When the server reminds the users of this meet at the 'starttime' it changes this to 1
    chats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    }]
  })
  const Meet = mongoose.model("Meet", MeetSchema);

  module.exports = Meet;