import { Model, Sequelize } from "sequelize";
import bcrypt from "bcryptjs";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        // O campo virtual não é armazenado no BD.
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    // Para fazer o hash da senha antes de ser salva no BD.
    this.addHook("beforeSave", async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  // Adicionando o avatar_id.
  static associate(models) {
    this.belongsTo(models.Files, { foreignKey: "avatar_id" });
  }

  // Método para verificar se a senha que o usuário está enviando pelo req é a mesma do hash que tem no bd
  checkPassword(password) {
    // retorna um boolean.
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
