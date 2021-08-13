import { Router } from "express";

import multer from "multer";
import multerConfig from "./config/multer";

import User from "./app/models/User";

import { UserController } from "./app/controllers/UserController";
import { SessionController } from "./app/controllers/SessionController";
import { FileController } from "./app/controllers/fileController";

import { AuthMiddleware } from "./app/Middleware/auth";

const userController = new UserController();
const sessionController = new SessionController();
const fileController = new FileController();

const routes = Router();
const upload = multer(multerConfig);

// Users
routes.post("/users", userController.store);
routes.put("/users", AuthMiddleware, userController.update);

// Session
routes.post("/session", sessionController.store);

//Files
routes.post("/files", upload.single("file"), fileController.store);

export { routes };
