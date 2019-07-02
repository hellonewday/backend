const router = require("express").Router();
const HL = require("../models/Highlight");
const isProtected = require("../controllers/validation");
const Comment = require("../models/HL.comment");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const moment = require("moment");

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
  if (file.mimetype === "video/webm" || file.mimetype === "video/mp4") {
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
  HL.find()
    .populate({ path: "author", select: "nickname avatarUrl" })
    .populate({
      path: "comments",
      select: "author created content likes",
      populate: {
        path: "author",
        select: "nickname avatarUrl"
      }
    })
    .exec()
    .then(doc => {
      res.status(200).json({
        counts: doc.length,
        data: doc.map(item => {
          return {
            title: item.title,
            author: item.author.nickname,
            id: item._id,
            author_id: item.author._id,
            description: item.description,
            video: item.mediaUrl,
            game: item.genre,
            created: moment(item.created).format("LLLL"),
            created_at: moment(item.created).calendar(),
            interaction: {
              likes: item.likes,
              shares: item.shares
            },
            comments: {
              comment_counts: item.comments.length,
              comments_details: item.comments.map(cmt => {
                return {
                  comment_id: cmt._id,
                  comment_author: cmt.author.nickname,
                  comment_avatar: cmt.author.avatarUrl,
                  comment_created: moment(cmt.created).calendar(),
                  comment_content: cmt.content,
                  comment_interaction: cmt.likes
                };
              })
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Error with the following request",
        error: err
      });
    });
});
router.get("/:id", (req, res) => {
  HL.findById({ _id: req.params.id })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: doc
      });
    })
    .catch(err => res.status(400).json({ error: err }));
});
router.post("/create", upload.single("video"), isProtected, (req, res) => {
  let authorizeId = req.userData._id;
  cloudinary.uploader
    .upload(req.file.path, { resource_type: "video" })
    .then(doc => {
      const data = new HL({
        title: req.body.title,
        author: authorizeId,
        description: req.body.description,
        mediaUrl: doc.secure_url,
        genre: req.body.genre
      });
      data
        .save()
        .then(response => {
          res.status(201).json({
            data: response
          });
        })
        .catch(err => {
          res.status(301).json({
            message: "Failed to upload highlight",
            error: err
          });
        });
    })
    .catch(err => {
      res.status(400).json({
        message: "Failed to upload video to the server",
        error: err
      });
    });
});
router.post("/:HLid/comment", isProtected, async (req, res) => {
  let existForum = await HL.findOne({ _id: req.params.HLid });
  if (existForum) {
    authorized_id = req.userData._id;
    let comment = new Comment({
      author: authorized_id,
      highlight: req.params.HLid,
      content: req.body.content
    });
    comment.save().then(async doc => {
      res.status(201).json({
        response: doc
      });
      existForum.comments.push(doc._id);
      await existForum.save();
    });
  } else {
    res.status(400).json({
      message: "Forum post has been deleted or not found"
    });
  }
});
router.patch("/:commentId", isProtected, async (req, res) => {
  let commentExist = await Comment.findOne({ _id: req.params.commentId });
  if (commentExist) {
    Comment.updateOne(
      { _id: req.params.commentId, author: req.userData._id },
      req.body
    )
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
  } else {
    res
      .status(404)
      .json({ message: "Comment has been deleted or not found !" });
  }
});
router.delete("/commentId", isProtected, async (req, res) => {
  let commentExist = await Comment.findOne({ _id: req.params.commentId });
  if (commentExist) {
    Comment.deleteOne({ _id: req.params.commentId, author: req.userData._id })
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
  } else {
    res.status(404).json({
      message: "Comment has been deleted or not found !"
    });
  }
});
module.exports = router;
