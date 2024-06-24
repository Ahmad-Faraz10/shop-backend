const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/insert", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    const result = await user.save();

    // const { token, token_expiry } = await user.generateAuthToken();
    // const response = { username: user.username, token, token_expiry };

    return res.send({
      status: 1,
      message: "User registered successfully.",
      data: result,
    });
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      if (error.message.includes("username:")) {
        return res.send({
          status: 0,
          message: "Username already exists.",
          data: "",
        });
      }
    } else {
      return res.send({
        status: 0,
        message: error.message,
        data: "",
      });
    }
  }
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(username, password)
    const user = await User.login(username, password);
    if (!user) {
      return res.send({
        error: "Login failed! Check authentication credentials",
      });
    }
    const { token, token_expiry } = await user.generateAuthToken();
    const response = {
      username: user.username,
      _id:user._id,
      token,
      token_expiry,
    };
    return res.send({
      status: 1,
      message: "Login successful.",
      data: response,
    });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "no" });
  }
});
// // Log user out of the application
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    return res.send({ status: 1, message: "Logout successfully.", data: "" });
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});
router.post("/logoutall", auth, async (req, res) => {
  // Log user out of all devices
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    return res.send({
      status: 1,
      message: "Logout from all devices successfully.",
      data: "",
    });
  } catch (error) {
    return res.send({ status: 0, message: "Something went wrong.", data: "" });
  }
});
router.post("/changepassword", auth, async (req, res) => {
  try {
    const { oldpwd, newpwd } = req.body;
    console.log(oldpwd, newpwd, "oldpwd, newpwd");
    const user = await User.changepassword(req.user.username, oldpwd, newpwd);

    if (!user) {
      return res.send({ status: 0, message: "Data does not exist.", data: "" });
    } else {
      return res.send({
        status: 1,
        message: "Password updated successfully.",
        data: "",
      });
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});
router.post("/resetpassword", async (req, res) => {
  try {
    if (req.user.role != "Admin") {
      return res.send({
        status: 0,
        message: "Only  can reset passwords.",
        data: "",
      });
    } else {
      const { username, newpwd } = req.body;
      const user = await User.resetpassword(username, newpwd);

      if (!user) {
        return res.send({
          status: 0,
          message: "Something went wrong.",
          data: "",
        });
      } else {
        return res.send({
          status: 1,
          message: "Password updated successfully.",
          data: "",
        });
      }
    }
  } catch (error) {
    return res.send({ status: 0, message: error.message, data: "" });
  }
});

module.exports = router;
