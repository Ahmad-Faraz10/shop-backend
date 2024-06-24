const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const db_url = process.env.DATABASE;

mongoose
  .connect(db_url, {
    dbName: "BuyItem",
  })
  .then(() => {
    console.log("mongodb connected successfully!");
  })
  .catch((err) => console.log("mongodb not connected", err));
