const express = require("express");
const Order = require("../models/order");
const Item = require("../models/item");
const User = require("../models/user");
const { mongoose } = require("mongoose");
const router = express.Router();

router.post("/addtocart", async (req, res) => {
  try {
    const { customerId, itemId, quantity, action } = req.body;
    if (!customerId || !itemId || !quantity || !action) {
      return res.status(400).json({
        error: "customerId, itemId, and quantity,action are required",
      });
    }
    const user = await User.findById(customerId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    let order = await Order.findOne({
      customer: customerId,
      status: "pending",
    });
    if (!order) {
      order = new Order({
        customer: customerId,
        items: [],
        totalAmount: 0,
        status: "pending",
      });
    }
    const existingItem = order.items.find((item) => item.item.equals(itemId));
    if (action == "add") {
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        order.items.push({ item: itemId, quantity });
      }
    } else if (action == "ded") {
      if (existingItem) {
        existingItem.quantity -= quantity;
        if (existingItem.quantity <= 0) {
          order.items = order.items.filter((item) => !item.item.equals(itemId));
        }
      }
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
    const itemPromises = order.items.map(async (orderItem) => {
      const itemData = await Item.findById(orderItem.item);
      return itemData.price * orderItem.quantity;
    });
    const itemPrices = await Promise.all(itemPromises);
    order.totalAmount = itemPrices.reduce((total, price) => total + price, 0);

    await order.save();
    res.status(201).json({ message: order });
    console.log("addtocart:------", order);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/placedorder", async (req, res) => {
  try {
    const { customerId, address } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }
    let order = await Order.findOne({
      customer: customerId,
      status: "pending",
    });
    if (!order) {
      return res
        .status(404)
        .json({ error: "Pending order not found for this customer" });
    }
    order.status = "placed";
    order.address = address;

    await order.save();

    res.status(200).json({ message: "Order status changed to placed", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/shipeddorder", async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }
    let order = await Order.findOne({
      customer: customerId,
      status: "placed",
    });
    if (!order) {
      return res
        .status(404)
        .json({ error: "Pending order not found for this customer" });
    }
    order.status = "shipped";

    await order.save();

    res.status(200).json({ message: "Order status changed to shipped", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/deliverdorder", async (req, res) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }
    let order = await Order.findOne({
      customer: customerId,
      status: "shipped",
    });
    if (!order) {
      return res
        .status(404)
        .json({ error: "Placed order not found for this customer" });
    }
    order.status = "delivered";

    await order.save();

    res
      .status(200)
      .json({ message: "Order status changed to delivered", order });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/allorder", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "items.item",
        model: "Item",
      })
      .populate({
        path: "customer",
        match: { username: "ahmadfaraz", status: "pending" },
      });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/historyofcustomer", async (req, res) => {
  try {
    const { ID } = req.body;
    const orderdata = await Order.find({ customer: ID })
      .populate({
        path: "items.item",
        model: "Item",
        select: " productImage name description price",
      })
      .populate({
        path: "customer",
        select: "username",
      });

    res.status(201).json({ data: orderdata });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/getone", async (req, res) => {
  try {
    const { ID } = req.body;
    const orderdata = await Order.find({ customer: ID, status: "pending" })
      .populate({
        path: "items.item",
        model: "Item",
        select: " productImage name description price",
      })
      .populate({
        path: "customer",
        select: "username",
      });

    res.status(201).json({ data: orderdata });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
  // try {
  //   const { ID } = req.body;
  //   const orderdata = await Order.findById(ID)
  //     .populate({
  //       path: "items.item",
  //       model: "Item",
  //       select: " productImage name price",
  //     })
  //     .populate({
  //       path: "customer",
  //       select: "username",
  //     });
  //   await orderdata.save();
  //   res.status(201).json({ data: orderdata });
  // } catch (error) {
  //   res.status(500).json({ error: "Internal server error" });
  // }
});
router.get("/get", async (req, res) => {
  try {
   const data = await Order.aggregate([
     {
       $group: {
         _id: "$customer",
         totalSpend: { $sum: "$totalAmount" },
       },
     },
     {
       $sort: { totalSpend: -1 },
     },
     {
       $lookup: {
         from: "users", 
         localField: "_id",
         foreignField: "_id",
         as: "customerDetails",
       },
     },
     {
       $unwind: "$customerDetails",
     },
     {
       $project: {
         _id: 0,
         name: "$customerDetails.username", 
         totalSpend: 1,
       },
     },
     {
       $limit: 5,
     },
   ]);

   console.log(data);

    res.json(data);
  } catch (error) {
    res.json(error);
  }
});
module.exports = router;
