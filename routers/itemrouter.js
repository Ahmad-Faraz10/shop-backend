const express = require("express");
const Item = require("../models/item");
const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "productImage/");
  },
  filename: function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/insert", upload.single("productImage"), async (req, res) => {
  try {
    const { productId, name, description, price } = req.body;
    const productImage = req.file ? `${req.file.filename}` : null;
    const newItem = new Item({
      productId,
      productImage,
      name,
      description,
      price,
    });
    await newItem.save();
    res.status(201).json({ message: "Item created successfully" + newItem });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/getall", async (req, res) => {
  try {
    const neworder = await Item.find();
    res.json(neworder);
  } catch (error) {
    res.json(error);
  }
});
router.post("/getone", async (req, res) => {
  try {
    const { ID } = req.body;
    const newItem = await Item.findById(ID);
    await newItem.save();
    res.status(201).json({ data: newItem });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/search/api", async (req, res) => {
  try {
    const query = req.query.q;
    const regex = new RegExp(query, "i");
    const results = await Item.find({
      $or: [{ name: regex }, { description: regex }],
    });
    const searchResults = res.json(results);
    console.log(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/getpage", async (req, res) => {
  const page = parseInt(req.body.page) || 1; 
  const limit = 2; 
  try {
    const items = await Item.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const totalItems = await Item.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    res.json({
      page,
      totalPages,
      totalItems,
      items, 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

module.exports = router;
