const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const moment = require("moment");

const isProtected = require("../controllers/validation");
const Club = require("../models/Club");
const Chatroom = require("../models/Chatroom");
const router = require("express").Router();

moment.locale("vi");
cloudinary.config({
  cloud_name: "vn-esports",
  api_key: "996178356223912",
  api_secret: "rC8_6QyIf1DIbokVgSYe0VLsJwQ"
});
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
const filterUpload = function(req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: filterUpload,
  limits: 1024 * 1024 * 25
});

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
        data: doc.map(item => {
          return {
            name: item.clubname,
            club_id: item._id,
            description: item.description,
            level: item.level,
            avatar: item.avatarUrl,
            members: item.members.map(member => {
              return {
                member_name: member.nickname,
                member_id: member._id
              };
            }),
            quantity: item.quantity,
            created_date: moment(item.created).format("LL"),
            game: item.genre,
            chatroom: {
              name: item.chatroom.title,
              chatroom_id: item.chatroom._id,
              host: item.chatroom.host.nickname
            }
          };
        })
      });
    })
    .catch(error => res.status(400).json({ error }));
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

router.patch("/:clubId/avatar", upload.single("avatar"), (req, res) => {
  cloudinary.uploader
    .upload(req.file.path, { resource_type: "image" })
    .then(async doc => {
      Club.updateOne({ _id: req.params.clubId }, { avatarUrl: doc.secure_url })
        .exec()
        .then(response => {
          res.status(200).json({
            message: "Update avatar successfully",
            avatarUrl: doc.secure_url,
            data: response
          });
        })
        .catch(err => {
          res.status(404).json({ error: err });
        });
    })
    .catch(err => {
      res
        .status(400)
        .json({ message: "Cannot upload image to server", error: err });
    });
});

router.delete("/clubId", isProtected, (req, res) => {
  Club.deleteOne({ _id: req.params.clubId })
    .exec()
    .then(response => {
      res.status(200).json({ response });
    })
    .catch(error => res.status(400).json({ error }));
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
