const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single restaurant by ID
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create new restaurant (for admin)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      cuisine,
      rating,
      deliveryTime,
      image,
      description,
      deliveryFee,
      minOrder,
      areas
    } = req.body;

    if (!name || !cuisine || !rating || !deliveryTime || !image || !description || !deliveryFee || !minOrder || !areas) {
      return res.status(400).json({ message: "All fields required" });
    }

    const restaurant = new Restaurant({
      name,
      cuisine,
      rating,
      deliveryTime,
      image,
      description,
      deliveryFee,
      minOrder,
      areas
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

