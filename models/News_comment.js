const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const News_comment = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  news: {
    type: Schema.Types.ObjectId,
    ref: "News"
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

module.exports = mongoose.model("News_comment", News_comment);
