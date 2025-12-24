const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  minOrder: {
    type: Number,
    required: true
  },
  areas: {
    type: [String],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", restaurantSchema);

