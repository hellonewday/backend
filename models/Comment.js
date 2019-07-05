const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    TargetType: {
      type: String,
      enum: ["Highlight", "Forum", "News"]
    },
    target: {
      type: Schema.Types.ObjectId,
      refPath: "TargetType"
    },
    content: {
      type: String,
      required: true
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
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
module.exports = mongoose.model("Comment", CommentSchema);
