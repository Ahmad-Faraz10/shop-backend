const jwt = require("jsonwebtoken");
const Admin = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = jwt.verify(token, "divadrapes");

    const user = await Admin.findOne({
      _id: data._id,
      "tokens.token": token,
      "tokens.token_expiry": { $gte: new Date() },
    });
    if (!user) {
      throw new Error("invalid token");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ status: 0, message: error.message, data: "" });
  }
};
module.exports = auth;
