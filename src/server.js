import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import axios from 'axios';


import tenantRoutes from "./routes/tenant.routes.js";
import contactRoutes from "./routes/contact.routes.js";

import userRoutes from "./routes/userRoutes.js";

import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { tenantMiddleware } from "./middlewares/tenant.middleware.js";
import { tenantMatch } from "./middlewares/tenantMatch.middleware.js";
import { authMiddleware, requireAuth } from "./middlewares/auth.middleware.js";



const app = express();
app.use(express.json());
app.use(cookieParser());


// Basic Home Route for health check
app.get('/', (req, res) => {
  res.send('API is running...');
});





// Auth Routes (Login, Register, Me)
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

// Global Routes
app.use("/api/v1/tenants", tenantRoutes);
app.get("/health", (req, res) => res.send("ok"));

// Secured & Tenant Scoped Routes
// Request -> Subdomain(Tenant) -> Auth(User) -> Match(User==Tenant) -> Logic
app.use(
  "/api/v1/contacts",
  tenantMiddleware,
  authMiddleware,
  requireAuth,    // Adapter & Claims
  tenantMatch,    // Security Check
  contactRoutes
);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (e) => {
  console.error('Server execution error:', e);
});

server.on('close', () => {
  console.log('Server closed unexpectedly');
});

console.log("Auth System Configured");
