var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = new Schema(
  {
    nickname: {
      type: String,
      default: "Anonymous" + parseInt(Math.random() * Math.PI)
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    level: {
      type: String,
      default: "Member"
    },
    avatarUrl: {
      type: String,
      default: "None"
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Forum"
      }
    ],
    highlights: [
      {
        type: Schema.Types.ObjectId,
        ref: "Highlight"
      }
    ],
    teams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Team"
      }
    ],
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club"
    },
    tournaments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tournament"
      }
    ],
    relationship: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);
module.exports = mongoose.model("User", User);
