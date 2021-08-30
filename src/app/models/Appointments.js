import { Model, Sequelize } from "sequelize";
import { isBefore, subHours } from 'date-fns';

class Appointments extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        // Para agendamentos que já passaram
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          }
        },
        // Para agendamentos que ainda podem ser cancelados.
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            // Agendamentos só podem ser cancelados com no mínimo duas horas de antecedência.
            return isBefore(new Date(), subHours(this.date, 2));
          }
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    this.belongsTo(models.User, { foreignKey: "provider_id", as: "provider" });
  }
}

export default Appointments;
