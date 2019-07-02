const router = require("express").Router();
const User = require("../models/User");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const multer = require("multer");
const isProtected = require("../controllers/validation");
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
  // Get the administrator accounts and member accounts
  if (req.query.level !== undefined) {
    User.find({ level: req.query.level })
      .exec()
      .then(doc => {
        res.status(200).json({
          counts: doc.length,
          data: doc
        });
      })
      .catch(err => {
        res.status(400).json({
          error: err
        });
      });
  } else {
    // Get all the accounts
    User.find()
      .exec()
      .then(doc => {
        res.status(200).json({
          counts: doc.length,
          data: doc
        });
      })
      .catch(err => {
        res.status(404).json({
          response: err
        });
      });
  }
});

router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: {
          nickname: doc.nickname,
          created: moment(doc.created).format("LLLL"),
          email: doc.email,
          id: doc._id,
          level: doc.level,
          avatar: doc.avatarUrl
        }
      });
    })
    .catch(err => res.status(400).json({ error: err }));
});

router.post("/register", upload.single("avatar"), async (req, res) => {
  let data = {
    email: req.body.email,
    nickname: req.body.nickname,
    password: req.body.password
  };
  let existUser = await User.find({ email: req.body.email });
  if (existUser.length >= 1) {
    return res.status(400).json({ message: "Account existed" });
  } else {
    let schema = {
      email: Joi.string()
        .email()
        .required()
        .trim(),
      nickname: Joi.string()
        .allow("")
        .min(6)
        .max(30)
        .trim(),
      password: Joi.string()
        .token()
        .required()
        .min(6)
        .max(30)
        .trim()
    };
    Joi.validate(data, schema)
      .then(doc => {
        bcrypt.hash(doc.password, 10, (err, hash) => {
          if (err) res.status(400).json({ error: err });
          else {
            const data = User({
              email: doc.email,
              nickname: doc.nickname,
              password: hash
            });
            data.save().then(doc => {
              res.status(201).json({
                response: doc
              });
            });
          }
        });
      })
      .catch(err => res.status(400).json({ error: err.details[0].message }));
  }
});

router.post("/login", async (req, res) => {
  let existUser = await User.findOne({ email: req.body.email });
  if (!existUser) {
    res.status(400).json({
      message: "No account is found"
    });
  }
  const validPassword = await bcrypt.compare(
    req.body.password,
    existUser.password
  );
  if (!validPassword) {
    res.json({ status: 400, message: "Email or password is invalid!" });
  }
  const token = jwt.sign(
    { _id: existUser._id, level: existUser.level },
    process.env.TOKEN,
    {
      expiresIn: "2h"
    }
  );
  res.status(200).json({
    message: "Logged in!",
    id: existUser._id,
    auth_token: token
  });
});

router.patch("/:id", isProtected, async (req, res, next) => {
  const UpdateCond = await User.findOne({ _id: req.params.id });
  if (UpdateCond) {
    authorizedId = req.userData._id;
    if (authorizedId === req.params.id) {
      User.updateOne({ _id: req.params.id }, req.body)
        .exec()
        .then(doc => {
          res.status(200).json({ data: doc });
        })
        .catch(err =>
          res.status(400).json({ message: "Error while editing", error: err })
        );
    } else {
      return res
        .status(401)
        .json({ message: "You are not allowed to update this account!" });
    }
  } else {
    return res.status(404).json({ message: "Not found" });
  }
});
router.patch(
  "/:id/avatar",
  upload.single("avatar"),
  isProtected,
  async (req, res) => {
    const UpdateCond = await User.findOne({ _id: req.params.id });
    if (UpdateCond) {
      authorizedId = req.userData._id;
      if (authorizedId === req.params.id) {
        cloudinary.uploader
          .upload(req.file.path, { resource_type: "image" })
          .then(doc => {
            User.updateOne(
              { _id: req.params.id },
              { avatarUrl: doc.secure_url }
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
          })
          .catch(err => {
            res.status(500).json({
              message: "Cannot send the image",
              error: err
            });
          });
      } else {
        return res
          .status(401)
          .json({ message: "You are not allowed to update this account!" });
      }
    } else {
      return res.status(404).json({ message: "Not found" });
    }
  }
);
module.exports = router;
