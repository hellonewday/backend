var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = new Schema({
  nickname: {
    type: String,
    default: "Anonymous" + parseInt(Math.random() * Math.PI)
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  level: {
    type: String,
    default: "Member"
  },
  avatarUrl: {
    type: String,
    default: "None"
  },
  created: {
    type: Date,
    default: Date.now()
  }
});
module.exports = mongoose.model("User", User);
