import 'dotenv/config';
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/userRoutes.js";

import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

console.log("Environment loaded. JWT_SECRET prefix:", process.env.JWT_SECRET?.substring(0, 4));

const app = express();
app.use(express.json());

// API Versioning & Rate Limiting
app.use("/api/v1/auth", apiLimiter, authRoutes);
app.use("/api/v1/users", userRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);
