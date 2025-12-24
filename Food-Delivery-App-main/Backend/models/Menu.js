const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
    ref: "Restaurant",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true, collection: 'menuItems' }); // Explicitly set collection name

module.exports = mongoose.model("Menu", menuItemSchema);

