"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role_Path extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Role_Path.init(
    {
      roleID: DataTypes.INTEGER,
      pathID: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Role_Path",
    }
  );
  return Role_Path;
};
