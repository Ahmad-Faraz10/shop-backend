const mongoose = require("mongoose");
const ItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productImage: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);
const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
