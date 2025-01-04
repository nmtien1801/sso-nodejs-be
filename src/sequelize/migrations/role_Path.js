"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Role_Path", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pathID: {
        type: Sequelize.INTEGER,
      },
      roleID: {
        type: Sequelize.INTEGER,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("GroupRole");
  },
};


// search : sequelize run specific migration
// npx sequelize-cli db:migrate --to 20231105121046-create-user.js
// npx sequelize-cli db:migrate --to migrate_addColumnUser.js