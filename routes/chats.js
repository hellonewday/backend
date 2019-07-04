var router = require("express").Router();
var Chatroom = require("../models/Chatroom");
var isProtected = require("../controllers/validation");

router.get("/", (req, res) => {
  Chatroom.find()
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
router.patch("/", isProtected);
module.exports = router;
