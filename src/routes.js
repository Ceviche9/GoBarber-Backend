import {Router} from 'express';

import User from './app/models/User';

import { UserController } from './app/controllers/UserController';
import { SessionController } from './app/controllers/SessionController';

const userController = new UserController();
const sessionController = new SessionController();

const routes = Router();

routes.post('/users', userController.store);
routes.post('/session', sessionController.store);


export { routes };
