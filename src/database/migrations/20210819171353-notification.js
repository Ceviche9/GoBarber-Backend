"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      notification_owner: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("notifications");
  },
};
