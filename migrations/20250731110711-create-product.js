'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    // optional virtual
    get summary() {
      return `${this.name}: ${this.description.substring(0, 30)}â€¦`;
    }

    static associate(models) {
      // seller relation via uppercase UserId
      Product.belongsTo(models.User, { foreignKey: 'UserId', as: 'Seller' });
      Product.belongsTo(models.Category, { foreignKey: 'CategoryId' });
      // orders (buyers) through Order
      Product.hasMany(models.Order, { foreignKey: 'ProductId' });
      Product.belongsToMany(models.User, {
        through: models.Order,
        foreignKey: 'ProductId',
        as: 'Buyers'
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
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Product'
  });

  return Product;
};