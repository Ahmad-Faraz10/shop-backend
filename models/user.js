const mongoose = require("mongoose");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    tokens: [
      {
        _id: false,
        token: { type: String, required: true },
        token_expiry: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// hasing the password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 9);
  }
  next();
});
// generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "divadrapes");
  const token_expiry = moment().add(1, "day");
  user.tokens = user.tokens.concat({
    token,
    token_expiry,
  });
  await user.save();
  return { token, token_expiry };
};

userSchema.statics.login = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid credentials.");
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid credentials.");
  }
  return user;
};
userSchema.statics.changepassword = async (username, oldpwd, newpwd) => {
  var user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid user.");
  }
  const isPasswordMatch = await bcrypt.compare(oldpwd, user.password);
  if (!isPasswordMatch) {
    throw new Error("Invalid old password.");
  } else {
    user = await User.findOneAndUpdate(
      { username },
      { password: await bcrypt.hash(newpwd, 9) },
      { new: true }
    );
  }

  return user;
};

userSchema.statics.resetpassword = async (username, newpwd) => {
  var user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid user.");
  }

  user = await User.findOneAndUpdate(
    { username },
    { pwd: await bcrypt.hash(newpwd, 9) },
    { new: true }
  );
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
