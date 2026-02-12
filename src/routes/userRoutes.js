import express from "express";
import { inviteUser } from "../controllers/userController.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { authMiddleware, requireAuth } from "../middlewares/auth.middleware.js";
import { tenantMatch } from "../middlewares/tenantMatch.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post(
    "/invite",
    tenantMiddleware,     // sets req.tenantId
    authMiddleware,
    requireAuth,          // Checks auth & Maps claims to req.userId, req.userTenantId
    tenantMatch,          // compares tenantId vs userTenantId
    adminMiddleware,      // role === admin
    inviteUser            // DB logic
);

export default router;