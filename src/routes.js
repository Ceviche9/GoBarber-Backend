/* eslint-disable comma-dangle */
/* eslint-disable quotes */
import { Router } from "express";

import multer from "multer";
import multerConfig from "./config/multer";

import { UserController } from "./app/controllers/UserController";
import { SessionController } from "./app/controllers/SessionController";
import { FileController } from "./app/controllers/fileController";
import { ProviderController } from "./app/controllers/ProviderController";
import { AppointmentController } from "./app/controllers/AppointmentController";
import { ScheduleController } from "./app/controllers/ScheduleController";
import { NotificationController } from "./app/controllers/NotificationController";

import { AuthMiddleware } from "./app/Middleware/auth";

// Controllers
const userController = new UserController();
const sessionController = new SessionController();
const fileController = new FileController();
const providerController = new ProviderController();
const appointmentController = new AppointmentController();
const scheduleController = new ScheduleController();
const notificationController = new NotificationController();

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
routes.get("/appointments", AuthMiddleware, appointmentController.index);
routes.post("/appointments", AuthMiddleware, appointmentController.store);

// Schedule -> As rotas do prestador de serviços.
routes.get("/schedule", AuthMiddleware, scheduleController.index);

// Notificações
routes.get("/notifications", AuthMiddleware, notificationController.index);
routes.put("/notifications/:id", AuthMiddleware, notificationController.update);

// Files
routes.post(
  "/files",
  AuthMiddleware,
  upload.single("file"),
  fileController.store
);

export { routes };
