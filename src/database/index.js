import Sequelize from "sequelize";

import databaseConfig from "../config/database";

import User from "../app/models/User";
import Files from "../app/models/Files";
import Appointments from "../app/models/Appointments";

const models = [User, Files, Appointments];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
