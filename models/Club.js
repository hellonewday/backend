const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ClubSchema = new Schema(
  {
    clubname: String,
    description: String,
    genre: {
      type: String,
      enum: ["Liên Minh Huyền Thoại", "Dota 2", "PUBG", "Mọi thể loại"]
    },
    avatarUrl: {
      type: String,
      default: "None"
    },
    quantity: {
      type: Number,
      default: 50
    },
    level: {
      type: String,
      default: "Default"
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    chatroom: {
      type: Schema.Types.ObjectId,
      ref: "Chatroom"
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);
module.exports = mongoose.model("Club", ClubSchema);
