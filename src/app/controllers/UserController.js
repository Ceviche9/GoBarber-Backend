import * as yup from "yup";
import User from "../models/User";

class UserController {
  async store(req, res) {
    // Validação dos dados.
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required().min(6),
    });

    //  Verificando se todos os dados são válidos.
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fail" });
    }

    try {
      const userExist = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExist) {
        return res.status(400).json({ error: "User already exists" });
      }

      const { id, name, email, provider } = await User.create(req.body);

      return res.json({
        id,
        name,
        email,
        provider,
      });
    } catch (e) {
      res.json({ error: "Unexpected Error" });
      return console.log("Erro");
    }
  }

  async update(req, res) {
    // No update nenhuma informação é obrigatória, com exceção do oldPassword
    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email(),
      oldPassword: yup.string().min(6),
      password: yup
        .string()
        .min(6)
        .when("oldPassword", (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: yup.string().when("password", (password, field) => {
        // *Não funciona*
        password ? field.required().oneOf([yup.ref("password")]) : field;
      }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validation fail" });
    }

    const { email, oldPassword } = req.body;

    try {
      const user = await User.findByPk(req.userId);

      // Para verificar se o novo email já existe na base de dados.
      if (email !== user.email) {
        const userExist = await User.findOne({ where: { email } });

        if (userExist) {
          return res.status(400).json({ error: "User already exists" });
        }
      }

      // Só altera a senha do usuário caso ele informe a senha antiga dele.
      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: "Password does not match" });
      }

      const { id, name, provider } = user.update(req.body);

      return res.json({ message: "Update succeeded" });
    } catch (e) {
      console.log(e);
      return res.json({ error: "unexpected error" });
    }
  }
}

export { UserController };
