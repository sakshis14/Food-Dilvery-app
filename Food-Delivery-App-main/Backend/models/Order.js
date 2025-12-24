const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 2.99 },
    total: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["UPI", "Card", "COD"],
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Received", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Received" 
    },
    deliveryAddress: {
      area: String,
      address: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
