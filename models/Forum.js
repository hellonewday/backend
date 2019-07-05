var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Forum = new Schema(
  {
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
    genre: {
      type: String,
      enum: ["Liên Minh Huyền Thoại", "Dota 2", "PUBG", "Mọi thể loại"]
    },
    imageUrl: {
      type: String,
      required: true
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    shared: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);
module.exports = mongoose.model("Forum", Forum);
