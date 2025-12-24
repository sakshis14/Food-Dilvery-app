// // const mongoose = require("mongoose");

// // mongoose.connect("mongodb://127.0.0.1:27017/food_delivery_app")
// //   .then(() => console.log("✅ MongoDB connected"))
// //   .catch(err => console.log("❌ MongoDB error", err));

// const mongoose = require("mongoose");

// if (process.env.NODE_ENV !== "test") {
//   mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("✅ MongoDB connected"))
//     .catch(err => console.error("❌ DB error", err));
// }

const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("⚠️ MONGO_URI not set, skipping DB connection");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB error", err);
    process.exit(1);
  }
};

module.exports = connectDB;
