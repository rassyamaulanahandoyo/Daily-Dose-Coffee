'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'userId' })
    }
    get fullName() {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim()
    }
  }
  Profile.init({
    firstName: {
      type: DataTypes.STRING,
      validate: {
        len: { args: [0, 100], msg: 'firstName terlalu panjang' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        len: { args: [0, 100], msg: 'lastName terlalu panjang' }
      }
    },
    phone: DataTypes.STRING,
    address: DataTypes.TEXT,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};