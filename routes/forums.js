const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const router = require("express").Router();
const isProtected = require("../controllers/validation");
const Forum = require("../models/Forum");
const Comment = require("../models/Comment");
const User = require("../models/User");
const moment = require("moment");

moment.locale("vi");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
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
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "video/webm" ||
    file.mimetype === "video/mp4"
  ) {
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
if (req.query.searchBox !== undefined) {
    Forum.find({ title: { $regex: req.query.searchBox, $options: "i" } }) //Refund => req.query.searchBox
      .populate("author", "nickname avatarUrl")
      .populate({
        path: "comments",
        select: "author created content likes",
        populate: {
          path: "author",
          select: "nickname avatarUrl"
        }
      })
      .exec()
      .then(doc =>
        res.status(200).json({
          counts: doc.length,
          data: doc
        })
      )
      .catch(err => {
        res.status(400).json({
          message: "Error",
          error: err
        });
      });
  } else {
    Forum.find()
      .populate("author", "nickname avatarUrl")
      .populate({
        path: "comments",
        select: "author created content likes",
        populate: {
          path: "author",
          select: "nickname avatarUrl"
        }
      })
      .exec()
      .then(doc =>
        res.status(200).json({
          counts: doc.length,
          data: doc.map(item => {
            return {
              forum_id: item._id,
              method: req.method,
              title: item.title,
              content: item.content,
              author: item.author.nickname,
              author_id: item.author._id,
              author_ava: item.author.avatarUrl,
              image: item.imageUrl,
              created: moment(item.created).format("LLLL"),
              created_at: moment(item.created).calendar(),
              interaction: {
                likes: item.likes.length,
                shares: item.shared.length
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
        })
      )
      .catch(err => {
        res.status(400).json({
          message: "Error",
          error: err
        });
      });
  }
});

router.get("/:forumId", (req, res) => {
  Forum.findOne({ _id: req.params.forumId })
    .populate("author", "nickname avatarUrl")
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
        data: {
          id: doc._id,
          title: doc.title,
          content: doc.content,
          created: moment(doc.created).format("LLL"),
          likes: doc.likes,
          shares: doc.shared,
          comments: doc.comments,
          comment_counts: doc.comments.length,
          image: doc.imageUrl,
          author_name: doc.author.nickname,
          author_avatar: doc.author.avatarUrl,
          author_id: doc.author._id
        },
        method: req.method
      });
    })
    .catch(err => {
      res.status(400).json({
        message: "Cannot find the post",
        error: err
      });
    });
});

router.post("/create", upload.single("image"), isProtected, (req, res) => {
  cloudinary.uploader
    .upload(req.file.path, { resource_type: "image" })
    .then(doc => {
      const forum = new Forum({
        genre: req.body.genre,
        author: req.userData._id,
        title: req.body.title,
        content: req.body.content,
        imageUrl: doc.secure_url
      });
      forum.save().then(async item => {
        let aUser = await User.findOne({ _id: req.userData._id });
        res.status(201).json({
          data: item
        });
        aUser.posts.push(item._id);
        await aUser.save();
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Cannot upload image",
        error: err
      });
    });
});

router.patch("/:forumId", isProtected, async (req, res) => {
  let existForum = await Forum.findOne({ _id: req.params.forumId });
  if (existForum) {
    // Handle normal update
    
    Forum.updateOne({ _id: req.params.forumId }, req.body)
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
      message: "post has been deleted or not found!"
    });
  }
});

router.delete("/:forumId", isProtected, async (req, res) => {
  let existForum = await Forum.findOne({ _id: req.params.forumId });
  if (existForum) {
    Forum.deleteOne({ _id: req.params.forumId })
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
      message: "Post has been deleted or not found"
    });
  }
});

router.post("/:forumId/comment", isProtected, async (req, res) => {
  let existForum = await Forum.findOne({ _id: req.params.forumId });
  if (existForum) {
    authorized_id = req.userData._id;
    let comment = new Comment({
      author: authorized_id,
      targetType: "Forum",
      target: req.params.forumId,
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

router.patch("/comments/:commentId", isProtected, async (req, res) => {
  let commentExist = await Comment.findOne({ _id: req.params.commentId });
  if (commentExist) {
    Comment.updateOne(
      { _id: req.params.commentId, author: req.userData._id },
      req.body
    )
      .exec()
      .then(response => {
        res.status(200).json({ response });
      })
      .catch(err => {
        res.status(400).json({ err });
      });
  } else {
    res
      .status(404)
      .json({ message: "Comment has been deleted or not found !" });
  }
});

router.delete("/comments/:commentId", isProtected, async (req, res) => {
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
          message: "Error",
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
