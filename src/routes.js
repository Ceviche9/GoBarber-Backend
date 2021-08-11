import {Router} from 'express';

import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {

  const user = await User.create({
    name: 'Tundê Cavalcante',
    email: 'ayo@hotmail.com',
    password_hash: '1232342342'
  });

  return res.json(user);
})

export default routes;
