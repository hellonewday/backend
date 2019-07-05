const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HL = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      trim: true
    },
    mediaUrl: String,
    genre: {
      type: String,
      enum: ["Liên Minh Huyền Thoại", "Dota 2", "PUBG", "Mọi thể loại"]
    },
    description: String,
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
module.exports = mongoose.model("Highlight", HL);
