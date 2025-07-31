'use strict';
const { Model } = require('sequelize');
const bcrypt = require('brcyptjs')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, { foreignKey: 'userId', onDelete: 'CASCADE' })
      User.hasMany(models.Product, { foreignKey: 'userId' })
      User.belongsToMany(models.Product, {
        through: models.Order,
        foreignKey: 'userId',
        otherKey: 'totalProduct'
      })
    }
    checkPassword(plain) {
      return bcrypt.compareSync(plain, this.password)
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Email is required' },
        notNull: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email format' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        notNull: { msg: 'Password is required' },
        len: { args: [8, 100], msg: 'Password min 8 chars' }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: { args: [['buyer', 'seller']], msg: 'Role must be buyer or seller' }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate(user) {
        const salt = bcrypt.genSaltSync(10)
        user.password = bcrypt.hashSync(user.password, salt)
      }
    }
  });
  return User;
};