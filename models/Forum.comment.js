const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Forum_comment = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  forum: {
    type: Schema.Types.ObjectId,
    ref: "Forum"
  },
  content: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Forum_comment", Forum_comment);
