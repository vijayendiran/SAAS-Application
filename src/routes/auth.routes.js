import express from "express";
import { login, callback, logout, me } from "../controllers/auth.controller.js";
import { authMiddleware, requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// OIDC Flow Routes
router.get("/login", login);        // Initiates redirect to Logto
router.get("/callback", callback);  // Handles Logto redirect + token exchange
router.get("/logout", logout);      // Clears session/cookies

// Protected Routes
router.get("/me", authMiddleware, requireAuth, me); // Returns current user info from token

export default router;
