const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

/* =======================
   CREATE ORDER
======================= */
router.post("/", async (req, res) => {
  const { userId, paymentMethod, deliveryAddress } = req.body;

  if (!userId || !paymentMethod) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's cart
    const cart = await Cart.findOne({ userId: userObjectId });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const deliveryFee = 2.99;
    const total = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      userId: userObjectId,
      items: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      paymentMethod: paymentMethod,
      status: "Received",
      deliveryAddress: deliveryAddress || {}
    });

    await order.save();

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    // Return order with populated data
    const orderData = order.toObject();
    orderData._id = orderData._id.toString();

    res.status(201).json(orderData);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

/* =======================
   GET SINGLE ORDER (must come before /:userId to avoid route conflicts)
======================= */
router.get("/order/:orderId", async (req, res) => {
  try {
    const orderId = new mongoose.Types.ObjectId(req.params.orderId);
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Convert _id to string
    order._id = order._id.toString();
    order.id = order._id;

    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

/* =======================
   GET USER ORDERS
======================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    
    // Remove duplicates (in case there are any)
    const uniqueOrdersMap = new Map();
    orders.forEach(order => {
      const orderId = order._id.toString();
      if (!uniqueOrdersMap.has(orderId)) {
        uniqueOrdersMap.set(orderId, {
          ...order,
          _id: orderId,
          id: orderId
        });
      }
    });

    const ordersData = Array.from(uniqueOrdersMap.values());
    res.json(ordersData);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* =======================
   UPDATE ORDER STATUS (for admin)
======================= */
router.put("/:orderId/status", async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const orderId = new mongoose.Types.ObjectId(req.params.orderId);
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    const orderData = order.toObject();
    orderData._id = orderData._id.toString();
    orderData.id = orderData._id;

    res.json(orderData);
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

module.exports = router;
