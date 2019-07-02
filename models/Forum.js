var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Forum = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  genre: String,
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
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Forum_comment"
    }
  ],
  isPublished: {
    type: Boolean,
    default: false
  }
});
module.exports = mongoose.model("Forum", Forum);
