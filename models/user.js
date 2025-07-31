'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Product, { foreignKey: 'userId', as: 'Products' });
      User.belongsToMany(models.Product, {
        through: models.Order,
        as: 'CartItems',
        foreignKey: 'UserId'
      });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Email must be unique' },
      validate: {
        notNull: { msg: 'Email is required' },
        isEmail: { msg: 'Must be a valid email' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password is required' },
        len: { args: [8], msg: 'Password must be at least 8 characters' }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: { args: [['customer', 'admin']], msg: 'Role must be customer or admin' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',      // <â€” this must be exactly 'User'
  });

  // hash password on create / update
  User.addHook('beforeCreate', async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });
  User.addHook('beforeUpdate', async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  return User;
};