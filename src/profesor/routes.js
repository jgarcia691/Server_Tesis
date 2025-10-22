import { Router } from "express";
import { getallprofesorcontroller, getprofesorcontroller, postprofesorcontroller, deleteprofesorcontroller, updateprofesorcontroller } from "./controller.js";


const profesorRouter = Router();

profesorRouter.get("/", getallprofesorcontroller);
profesorRouter.get("/:ci", getprofesorcontroller);
profesorRouter.post("/", postprofesorcontroller);
profesorRouter.put("/:ci", updateprofesorcontroller);
profesorRouter.delete("/:ci", deleteprofesorcontroller);

export default profesorRouter;
