import express from "express";
import { inviteUser } from "../controllers/userController.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { tenantMatch } from "../middlewares/tenantMatch.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post(
    "/invite",
    tenantMiddleware,     // sets req.tenantId
    authMiddleware,       // sets req.user & req.userTenantId
    tenantMatch,          // compares tenantId vs userTenantId
    adminMiddleware,      // role === admin
    inviteUser            // DB logic
);

export default router;