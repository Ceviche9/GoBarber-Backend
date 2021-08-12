import jwt from "jsonwebtoken";
import User from "../models/User";

import AuthConfig from "../../config/auth";

class SessionController {
  async store(req, res) {
    const schema = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    });

    //  Verificando se todos os dados são válidos.
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fail" });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        res.status(401).json({ error: "User not found" });
      }

      if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: "Password does not match" });
      }

      // Se chou até aqui o usuário foi encontrado e a senha dele está correta.

      const { id, name } = user;

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
