const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ChatroomSchema = new Schema({
  title: String,
  conversations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Conversations"
    }
  ],
  host: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  emotes: [String],
  created: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Chatroom", ChatroomSchema);
