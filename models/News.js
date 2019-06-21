var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var News = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: false,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  imageUrl: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  shared: {
    type: Number,
    default: 0
  },
  tags: [String],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "News_comment"
    }
  ]
});
module.exports = mongoose.model("News", News);
