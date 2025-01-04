"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Path extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Path.belongsToMany(models.Role, {
        through: "Role_Path", // map tới group_role
        foreignKey: "roleID", // khoá ngoại
      });
    }
  }
  Path.init(
    {
      url: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Path",
    }
  );
  return Path;
};
