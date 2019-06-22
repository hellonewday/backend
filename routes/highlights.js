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
        data: doc.map(item =>{
          return{
            title: item.title,
            author: item.author.nickname,
            id: item._id,
            author_id: item.author._id,
            description: item.description,
            video: item.mediaUrl,
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
                  comment_author: cmt.author.nickname,
                  comment_avatar: cmt.author.avatarUrl,
                  comment_created: moment(cmt.created).calendar(),
                  comment_content: cmt.content,
                  comment_interaction: cmt.likes
                };
              })
            }
          }
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

router.post("/create", upload.single("video"), isProtected, (req, res) => {
  let authorizeId = req.userData._id;
  cloudinary.uploader
    .upload(req.file.path, { resource_type: "video" })
    .then(doc => {
      const data = new HL({
        title: req.body.title,
        author: authorizeId,
        description: req.body.description,
        mediaUrl: doc.secure_url
      });
      data
        .save()
        .then(response => {
          res.status(201).json({
            data: response
          });
        })
        .catch(err => {
          res.status(500).json({
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

module.exports = router;
