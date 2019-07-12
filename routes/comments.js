const Comment = require("../models/Comment");
const router = require("express").Router();
const isProtected = require("../controllers/validation");
router.get("/", (req, res) => {
  Comment.find()
    .exec()
    .then(data => {
      res.status(200).json({
        data
      });
    })
    .catch(error => {
      res.status(400).json({
        error
      });
    });
});
router.patch("/commentId", isProtected, async (req, res) => {
  if (req.body.likes !== undefined) {
    // Handle with likes array
    let existComment = await Comment.find({ _id: req.params.commentId });
    if (existComment) {
      let likesArray = existComment.likes;
      likesArray.push(req.body.likes);
      Comment.updateOne(
        { _id: req.params.commentId },
        { $set: { likes: likesArray } }
      )
        .exec()
        .then(response => res.status(200).json({ response }))
        .catch(error => res.status(400).json({ error }));
    } else {
      res.status(404).json({ message: "Comment not found" });
    }
  } else {
    // Handle with normal update: title, content, genre.
    Comment.updateOne({ _id: req.params.commentId }, req.body)
      .exec()
      .then(response => res.status(200).json({ response }))
      .catch(error => res.status(400).json({ error }));
  }
});

router.delete("/commentId", isProtected, (req, res) => {
  Comment.deleteOne({
    _id: req.params.commentId
  })
    .exec()
    .then(response => res.status(200).json({ response }))
    .catch(error => res.status(400).json({ error }));
});
module.exports = router;
