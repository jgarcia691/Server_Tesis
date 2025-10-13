import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { postlogincontroller, registerController } from "./controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/login", postlogincontroller);
router.post("/register", registerController);

export default router;
