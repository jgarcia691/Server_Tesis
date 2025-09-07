import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { postlogincontroller } from "./controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/", postlogincontroller);

export default router;
