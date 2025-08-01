'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A user can sell many products
      User.hasMany(models.Product, { foreignKey: 'UserId', as: 'Products' });
      // A user can have many orders (cart & past)
      User.hasMany(models.Order, { foreignKey: 'UserId' });
      // And through orders, many bought products
      User.belongsToMany(models.Product, {
        through: models.Order,
        foreignKey: 'UserId',
        as: 'CartItems'
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
        isEmail: { msg: 'Must be a valid email address' }
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
    modelName: 'User',
    hooks: {
      beforeCreate: async user => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async user => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};