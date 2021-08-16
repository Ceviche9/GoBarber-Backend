import { Router } from "express";

import multer from "multer";
import multerConfig from "./config/multer";

import User from "./app/models/User";

import { UserController } from "./app/controllers/UserController";
import { SessionController } from "./app/controllers/SessionController";
import { FileController } from "./app/controllers/fileController";
import { ProviderController } from "./app/controllers/ProviderController";
import { AppointmentController } from "./app/controllers/AppointmentCotroller";

import { AuthMiddleware } from "./app/Middleware/auth";

// Controllers
const userController = new UserController();
const sessionController = new SessionController();
const fileController = new FileController();
const providerController = new ProviderController();
const appointmentController = new AppointmentController();

const routes = Router();
const upload = multer(multerConfig);

// Session
routes.post("/session", sessionController.store);

// Users
routes.post("/users", userController.store);
// Dessa linha para baixo usa O AUTHMIDDLEWARE
routes.put("/users", AuthMiddleware, userController.update);

// Providers
routes.get("/providers", AuthMiddleware, providerController.index);

// Appointments
routes.post("/appointments", AuthMiddleware, appointmentController.store);

//Files
routes.post(
  "/files",
  AuthMiddleware,
  upload.single("file"),
  fileController.store
);

export { routes };
