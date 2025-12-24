const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Cart = require("../models/Cart");

/* =======================
   GET USER CART
======================= */
router.get("/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const cart = await Cart.findOne({ userId });
    res.json(cart ? cart.items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

/* =======================
   ADD ITEM TO CART
======================= */
router.post("/add", async (req, res) => {
  const { userId, item } = req.body;

  console.log("Add to cart request:", { userId, item });

  if (!userId || !item || !item.productId) {
    console.error("Missing required fields:", { userId, item });
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: `Invalid user ID format: ${userId}` });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Validate productId - now accepts string IDs like "m101"
    if (!item.productId || typeof item.productId !== 'string') {
      console.error("Invalid productId format:", item.productId);
      return res.status(400).json({ 
        message: `Invalid product ID: ${item.productId}. Product ID must be a string.` 
      });
    }
    const productId = String(item.productId);

    let cart = await Cart.findOne({ userId: userObjectId });

    if (!cart) {
      cart = new Cart({
        userId: userObjectId,
        items: []
      });
    }

    // Find existing item - compare as strings
    const existingItem = cart.items.find((i) => {
      if (!i.productId) return false;
      return String(i.productId) === productId;
    });

    if (existingItem) {
      existingItem.quantity += 1;
      console.log("Updated existing item quantity:", existingItem.quantity);
    } else {
      cart.items.push({
        productId: productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
      console.log("Added new item to cart");
    }

    await cart.save();
    console.log("Cart saved successfully");
    res.json(cart.items);
  } catch (err) {
    console.error("Add cart error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    if (err.name === 'CastError') {
      res.status(400).json({ message: `Invalid ID format: ${err.message}` });
    } else {
      res.status(500).json({ message: `Failed to add item to cart: ${err.message}` });
    }
  }
});

/* =======================
   UPDATE QUANTITY
======================= */
router.put("/update", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const cart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!cart) return res.json([]);

    const productIdStr = String(productId);

    const item = cart.items.find(i => {
      if (!i.productId) return false;
      return String(i.productId) === productIdStr;
    });

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(i => {
          if (!i.productId) return true;
          return String(i.productId) !== productIdStr;
        });
      }
    }

    await cart.save();
    res.json(cart.items);
  } catch (err) {
    console.error("Update cart error:", err);
    if (err.name === 'CastError') {
      res.status(400).json({ message: "Invalid ID format" });
    } else {
      res.status(500).json({ message: "Failed to update cart" });
    }
  }
});

/* =======================
   REMOVE ITEM
======================= */
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(req.params.userId)
    });

    if (!cart) return res.json([]);

    const productIdStr = String(req.params.productId);

    cart.items = cart.items.filter(i => {
      if (!i.productId) return true;
      return String(i.productId) !== productIdStr;
    });

    await cart.save();
    res.json(cart.items);
  } catch (err) {
    console.error("Delete cart item error:", err);
    if (err.name === 'CastError') {
      res.status(400).json({ message: "Invalid ID format" });
    } else {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  }
});

module.exports = router;
