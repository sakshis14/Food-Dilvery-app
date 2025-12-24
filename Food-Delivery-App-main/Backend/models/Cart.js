const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // Using String to support custom IDs like "m101"
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
