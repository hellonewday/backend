const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ClubSchema = new Schema({
  clubname: String,
  description: String,
  genre: String,
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
  },
  created: {
    type: Date,
    default: Date.now()
  }
});
module.exports = mongoose.model("Club", ClubSchema);
