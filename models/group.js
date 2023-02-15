const mongoose = require("mongoose");
  
  let GroupSchema = new mongoose.Schema({
    groupname: {
      type: String,
      required: true
    },
    groupkey: {
      type: String,
      required: true
    },
    meets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meet'
    }],
  
  })
  const Group = mongoose.model("Group", GroupSchema);

  module.exports = Group;