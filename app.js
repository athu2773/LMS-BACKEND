require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");

// Routes
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const progressRoutes = require("./routes/progress.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiter for all requests (optional)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
