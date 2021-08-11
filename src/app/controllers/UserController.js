import User from '../models/User';

class UserController {
  async store(req, res) {
    try {
      const userExist = await User.findOne({ where: { email: req.body.email } });

      if (userExist) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const {
        id, name, email, provider,
      } = await User.create(req.body);

      return res.json({
        id, name, email, provider,
      });
    } catch (e) {
      res.json({ error: 'Unexpected Error' });
      return console.log('Erro');
    }
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    try {
      const user = await User.findByPk(req.userId);

      // Para verificar se o novo email já existe na base de dados.
      if (email !== user.email) {

        const userExist = await User.findOne({ where: { email } });

        if (userExist) {
          return res.status(400).json({ error: 'User already exists' });
        }
      }

      // Só altera a senha do usuário caso ele informe a senha antiga dele.
      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Password does not match' });
      }

      const {id, name, provider} = user.update(req.body);

      return res.json({message: 'Update succeeded'});

    } catch (e) {
      console.log(e);
      return res.json({ error: 'unexpected error'});
    }
  }
}

export { UserController };
