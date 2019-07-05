const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ChatroomSchema = new Schema({
  title: String,
  description: String,
  conversations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Conversations"
    }
  ],
  targetType: {
    type: String,
    enum: ["Club", "Team", "Tournament", "Couple"]
  },
  target: {
    type: Schema.Types.ObjectId,
    refPath: "targetType"
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  emotes: [String]
},{
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model("Chatroom", ChatroomSchema);
