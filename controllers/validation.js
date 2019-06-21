const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.body.token;
  if (!token) res.status(401).json({ message: "Not authorized!" });
  try {
    const decode = jwt.verify(token, process.env.TOKEN);
    req.userData = decode;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token!"
    });
  }
};
