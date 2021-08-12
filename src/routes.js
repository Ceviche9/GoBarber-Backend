import { Router } from "express";

import User from "./app/models/User";

import { UserController } from "./app/controllers/UserController";
import { SessionController } from "./app/controllers/SessionController";

import { AuthMiddleware } from "./app/Middleware/auth";

const userController = new UserController();
const sessionController = new SessionController();

const routes = Router();

// Users
routes.post("/users", userController.store);
routes.put("/users", AuthMiddleware, userController.update);
routes.delete("/users", AuthMiddleware, userController.delete);

// Session
routes.post("/session", sessionController.store);

export { routes };
