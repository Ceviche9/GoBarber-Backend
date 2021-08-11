import User from '../models/User';

class UserController {
  async store(req, res) {
    try {

      const userExist = await User.findOne({where: {email: req.body.email}});

      if(userExist) {
        return res.status(400).json({error: 'User already exists'});
      }

      const {id, name, email, provider} = await User.create(req.body);

      return res.json({id, name, email, provider});
    } catch (e) {
      res.json({error: 'Unexpected Error'});
      return console.log('Erro');
    }
  }
}

export {UserController}
