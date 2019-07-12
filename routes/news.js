const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const router = require("express").Router();
const isProtected = require("../controllers/validation");
const News = require("../models/News");
const Comment = require("../models/Comment");
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
  if (req.query.sortByLikes !== undefined) {
    News.find()
      .sort({ likes: 1 })
      .limit(parseInt(req.query.sortByLikes))
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
  } else if (req.query.searchBox !== undefined) {
    News.find({ title: { $regex: req.query.searchBox, $options: "i" } }) //Refund => req.query.searchBox
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
    News.find()
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
              news_id: item._id,
              method: req.method,
              title: item.title,
              content: item.content,
              subtitle: item.subtitle,
              author: item.author.nickname,
              author_id: item.author._id,
              author_ava: item.author.avatarUrl,
              image: item.imageUrl,
              created: moment(item.created).format("LLLL"),
              created_at: moment(item.created).calendar(),
              interaction: {
                likes: item.likes,
                shares: item.shared,
                tags: item.tags
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

router.get("/favorites", (req, res) => {
  News.find()
    .sort({})
    .exec()
    .then()
    .catch();
});

router.get("/:newsId", (req, res) => {
  News.findOne({ _id: req.params.newsId })
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
          subtitle: doc.subtitle,
          content: doc.content,
          created: moment(doc.created).format("LLL"),
          likes: doc.likes,
          shares: doc.shared,
          image: doc.imageUrl,
          author_name: doc.author.nickname,
          comments: doc.comments,
          comment_counts: doc.comments.length,
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
  const authorizeRole = req.userData.level;
  if (authorizeRole === "Moderator" || authorizeRole === "Administrator") {
    cloudinary.uploader
      .upload(req.file.path, { resource_type: "image" })
      .then(doc => {
        const news = new News({
          author: req.userData._id,
          title: req.body.title,
          subtitle: req.body.subtitle,
          content: req.body.content,
          tags: req.body.tags,
          imageUrl: doc.secure_url
        });
        news.save().then(async item => {
          res.status(201).json({
            data: item
          });
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Cannot upload image",
          error: err
        });
      });
  } else {
    res.status(401).json({
      message: `You are not allowed to post news as ${authorizeRole}`
    });
  }
});

router.patch("/:newsId", isProtected, (req, res) => {
  News.updateOne({ _id: req.params.newsId }, req.body)
    .exec()
    .then(response => {
      res.status(200).json({
        data: response
      });
    })
    .catch(err => {
      res.status(400).json({ error: err });
    });
});

router.delete("/:newsId", isProtected, async (req, res) => {
  let existNews = await News.findById({ _id: req.params.newsId });
  if (existNews) {
    News.deleteOne({ _id: req.params.newsId })
      .exec()
      .then(response => {
        res.status(200).json({ data: response });
      })
      .catch(err => res.status(400).json({ error: err }));
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/:newsId/comment", isProtected, async (req, res) => {
  // isProtected: ensure that user comment this post is authorizedId user, not other user!
  let existNews = await News.findOne({ _id: req.params.newsId });
  if (existNews) {
    authorized_id = req.userData._id;
    let comment = new Comment({
      author: authorized_id,
      news: req.params.newsId,
      content: req.body.content
    });
    comment
      .save()
      .then(async doc => {
        res.status(201).json({
          response: doc
        });
        existNews.comments.push(doc._id);
        await existNews.save();
      })
      .catch(err => {
        res.status(400).json({
          message: "Cannot send this comment to the post",
          error: err
        });
      });
  } else {
    res.status(400).json({
      message: "News has been deleted or not found"
    });
  }
});

router.post("/:newsId/comment", isProtected, async (req, res) => {
  let existNews = await News.findOne({ _id: req.params.newsId });
  if (existNews) {
    authorized_id = req.userData._id;
    let comment = new Comment({
      author: authorized_id,
      targetType: "News",
      target: req.params.newsId,
      content: req.body.content
    });
    comment.save().then(async doc => {
      res.status(201).json({
        response: doc
      });
      existNews.comments.push(doc._id);
      await existNews.save();
    });
  } else {
    res.status(400).json({
      message: "News post has been deleted or not found"
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
