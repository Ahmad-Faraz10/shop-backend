const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const usersr = require("./routers/userrouter");
const itemsr = require("./routers/itemrouter");
const orders = require("./routers/orderrouter");

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use("/productImage", express.static(path.join(__dirname, "productImage")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("./db/db");

dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());

app.use("/user", usersr);
app.use("/item", itemsr);
app.use("/order", orders);
app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
