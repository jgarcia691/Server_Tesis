import express from "express";
import { postlogincontroller } from "./controllers.js";

const router = express.Router();

router.post("/", postlogincontroller);

export default router;
