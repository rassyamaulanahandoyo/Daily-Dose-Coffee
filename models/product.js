'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    get summary() {
      return `${this.name} – ${this.description.slice(0,30)}…`;
    }
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'CategoryId' });
      Product.belongsTo(models.User,     { foreignKey: 'userId', as: 'Seller' });
      Product.belongsToMany(models.User, {
        through: models.Order,
        as: 'Buyers',
        foreignKey: 'ProductId'
      });
    }
  }

  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required' } }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Description is required' } }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Minimum price is 1' } }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [0], msg: 'Stock cannot be negative' } }
    },
    imageURL: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Image URL is required' } }
    }
  }, {
    sequelize,
    modelName: 'Product',
    hooks: {
      beforeCreate: product => {
        if (!product.price) product.price = 1;
      }
    }
  });

  return Product;
};
