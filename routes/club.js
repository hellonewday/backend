const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const moment = require("moment");

const isProtected = require("../controllers/validation");
const Club = require("../models/Club");
const Chatroom = require("../models/Chatroom");
const router = require("express").Router();

router.get("/", (req, res) => {
  Club.find()
    .sort({ quantity: 1 })
    .populate("members", "nickname avatarUrl")
    .populate({
      path: "chatroom",
      select: "title host conversations",
      populate: {
        path: "host",
        select: "nickname avatarUrl"
      }
    })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: doc
      });
    })
    .catch();
});
router.post("/", isProtected, (req, res) => {
  let data = new Club({
    clubname: req.body.clubname,
    genre: req.body.genre,
    description: req.body.description
  });
  data
    .save()
    .then(async doc => {
      let thisClub = await Club.findOne({ _id: doc._id });
      thisClub.members.push(req.userData._id);
      await thisClub.save();
      res
        .json({
          message: "Club created!",
          data: doc
        })
        .status(201);
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
});
router.get("/:clubId", (req, res) => {
  Club.findOne({ _id: req.params.clubId })
    .populate("members", "nickname avatarUrl")
    .populate({
      path: "chatroom",
      select: "title host conversations",
      populate: {
        path: "host",
        select: "nickname avatarUrl"
      }
    })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: doc
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err
      });
    });
});
router.patch("/:clubId", isProtected, async (req, res) => {
  let existClub = await Club.findOne({ _id: req.params.clubId });
  if (existClub && existClub.members[0] === req.userData._id) {
    Club.updateOne({ _id: req.params.clubId }, req.body)
      .exec()
      .then(response => {
        res.status(200).json({
          data: response
        });
      })
      .catch(err => {
        res.status(400).json({
          error: err
        });
      });
  }
});
router.post("/:clubId/chat", isProtected, (req, res) => {
  let data = new Chatroom({
    title: req.body.title,
    host: req.userData._id
  });
  data
    .save()
    .then(async doc => {
      let thisClub = await Club.findOne({ _id: req.params.clubId });
      thisClub.chatroom = doc._id;
      await thisClub.save();
      res.status(201).json({
        message: "Chatroom created",
        data: doc
      });
    })
    .catch(err => {
      res.status(400).json({
        error: err
      });
    });
});
module.exports = router;
