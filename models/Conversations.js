const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var ConversationSchema = new Schema({
  user: String,
  message: String,
  created: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("Conversations", ConversationSchema);
