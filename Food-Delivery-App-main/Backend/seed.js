const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Restaurant = require("./models/Restaurant");
const Menu = require("./models/Menu");

// Connect to database
mongoose.connect("mongodb://127.0.0.1:27017/food_delivery_app")
  .then(() => {
    console.log("✅ MongoDB connected for seeding");
    seedDatabase();
  })
  .catch(err => {
    console.log("❌ MongoDB error", err);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    // Clear existing data
    await Restaurant.deleteMany({});
    await Menu.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Read restaurants JSON
    const restaurantsPath = path.join(__dirname, "../data/restaurants.json");
    const restaurantsData = JSON.parse(fs.readFileSync(restaurantsPath, "utf8"));

    // Read menu JSON
    const menuPath = path.join(__dirname, "../data/menu.json");
    const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"));

    // Create a map to store restaurant ID mappings (old ID -> new MongoDB _id)
    const restaurantIdMap = {};

    // Seed restaurants
    console.log("🌱 Seeding restaurants...");
    for (const restaurant of restaurantsData) {
      const newRestaurant = new Restaurant({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        deliveryTime: restaurant.deliveryTime,
        image: restaurant.image,
        description: restaurant.description,
        deliveryFee: restaurant.deliveryFee,
        minOrder: restaurant.minOrder,
        areas: restaurant.areas
      });
      const savedRestaurant = await newRestaurant.save();
      restaurantIdMap[restaurant.id] = savedRestaurant._id.toString();
      console.log(`  ✓ Created: ${restaurant.name}`);
    }

    // Seed menu items
    console.log("🌱 Seeding menu items...");
    for (const [restaurantIdStr, menuItems] of Object.entries(menuData)) {
      const restaurantId = restaurantIdStr;
      const mongoRestaurantId = restaurantIdMap[restaurantId];

      if (!mongoRestaurantId) {
        console.log(`  ⚠️  Skipping menu for restaurant ID ${restaurantId} (not found)`);
        continue;
      }

      for (const menuItem of menuItems) {
        const newMenuItem = new Menu({
          restaurantId: mongoRestaurantId,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          image: menuItem.image
        });
        await newMenuItem.save();
      }
      console.log(`  ✓ Created ${menuItems.length} menu items for restaurant ID ${restaurantId}`);
    }

    console.log("\n✅ Database seeded successfully!");
    console.log(`   - ${restaurantsData.length} restaurants`);
    console.log(`   - ${Object.values(menuData).flat().length} menu items`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

