import jwt from "jsonwebtoken";
import * as yup from "yup";
import User from "../models/User";

import AuthConfig from "../../config/auth";

// Este controller é responsável para gerar o token do usuário.
class SessionController {
  async store(req, res) {
    // Validando os dados.
    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    });

    //  Verificando se todos os dados são válidos.
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fail" });
    }

    try {
      // Pegando o email e senha do usuário.
      const { email, password } = req.body;

      // Procurando se existe algum usuário cadastrado com esse email.
      const user = await User.findOne({ where: { email } });

      // Caso o usuário não exista.
      if (!user) {
        res.status(401).json({ error: "User not found" });
      }

      // Verificando se a senha enviada está correta.
      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: "Password does not match" });
      }

      // Se chegou até aqui o usuário foi encontrado e a senha dele está correta.
      const { id, name } = user;

      // criando o token do usuário.
      return res.json({
        user: {
          id,
          name,
          email,
        },
        token: jwt.sign({ id }, AuthConfig.secret, {
          expiresIn: AuthConfig.expiresIn,
        }),
      });
    } catch (e) {
      return console.log(e);
    }
  }
}
export { SessionController };
