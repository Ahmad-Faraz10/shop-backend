const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const db_url ="mongodb+srv://root:root@cluster0.vkunc9q.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(db_url, {
    dbName: "BuyItem",
  })
  .then(() => {
    console.log("mongodb connected successfully!");
  })
  .catch((err) => console.log("mongodb not connected", err));
