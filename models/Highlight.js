const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HL = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    trim: true
  },
  mediaUrl: String,
  description: String,
  likes: {
    type: Number,
    default: 0
  },
  shared: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now()
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "HL_comment"
    }
  ]
});
module.exports = mongoose.model("Highlight", HL);
