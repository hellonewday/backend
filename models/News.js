var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var News = new Schema(
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
    subtitle: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      enum: ["Liên Minh Huyền Thoại", "Dota 2", "PUBG", "Mọi thể loại"]
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
    tags: [String],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
    ]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);
module.exports = mongoose.model("News", News);
