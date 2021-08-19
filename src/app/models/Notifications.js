import { Model, Sequelize } from "sequelize";

class Notifications extends Model {
  static init(sequelize) {
    super.init(
      {
        notification_owner: Sequelize.INTEGER,
        content: Sequelize.STRING,
        read: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Notifications;
