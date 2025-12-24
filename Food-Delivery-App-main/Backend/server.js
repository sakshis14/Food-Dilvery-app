// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// require("./db");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Serve static files from uploads directory
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/restaurants", require("./routes/restaurantRoutes"));
// app.use("/api/menu", require("./routes/menuRoutes"));
// app.use("/api/cart", require("./routes/cartRoutes"));
// app.use("/api/orders", require("./routes/orderRoutes"));

// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// // app.listen(5000, () => {
// //   console.log("🚀 Server started on port 5000");
// // });
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// connect DB ONLY if env exists
connectDB();

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

