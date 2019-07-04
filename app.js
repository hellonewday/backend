const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const UserRoute = require("./routes/users");
const NewsRoute = require("./routes/news");
const ForumRoute = require("./routes/forums");
const HLroute = require("./routes/highlights");
const clubRoute = require("./routes/club");
const chatRoute = require("./routes/chats");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${
      process.env.DB_PASSWORD
    }@vnesports-zxevx.gcp.mongodb.net/main?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true
    }
  )
  .then(() => {
    console.log("Connect to database!");
  });

// mongoose
//   .connect("mongodb://localhost:27017/main", { useNewUrlParser: true })
//   .then(() => console.log("Connect to database"))
//   .catch(err => console.log("Unable to connect to database" + err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use("/", express.static(__dirname));
app.use("/users", UserRoute);
app.use("/uploads", express.static("uploads"));
app.use("/news", NewsRoute);
app.use("/forums", ForumRoute);
app.use("/highlights", HLroute);
app.use("/clubs", clubRoute);
app.use("/chatrooms", chatRoute);
module.exports = app;
