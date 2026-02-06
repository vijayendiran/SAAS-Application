import { Router } from "express";
import {
    createContact,
    getContacts,
} from "../controllers/contact.controller.js"

const router = Router();

router.post("/",createContact);
router.get("/",getContacts);

export default router;