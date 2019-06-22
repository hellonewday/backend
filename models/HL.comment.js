const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HL_comment = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  content: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  likes: {
    type: Number,
    default: 0
  }
});
module.exports = mongoose.model("HL_comment", HL_comment);
