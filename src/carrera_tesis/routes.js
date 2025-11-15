import express from "express";
import {
  getCarreraTesisController,
  postCarreraTesisController,
  deleteCarreraTesisController,
} from "./controllers.js";

const router = express.Router();


router.get("/", getCarreraTesisController);
router.post("/", postCarreraTesisController);
router.delete("/:id", deleteCarreraTesisController);

export default router;
