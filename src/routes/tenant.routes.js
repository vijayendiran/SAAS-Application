import express from "express";
import { createTeneant } from "../controllers/tenant.controller.js";

const router = express.Router();

//POST / tenants

router.post("/",createTeneant)

export default router;