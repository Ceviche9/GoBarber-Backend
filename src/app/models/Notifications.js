import { Model, Sequelize } from "sequelize";

class Notifications extends Model {
  static init(sequelize) {
    super.init(
      {
        notification_owner: Sequelize.INTEGER,
        content: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Notifications;
