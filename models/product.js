'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'CategoryId' });
      Product.belongsTo(models.User,     { foreignKey: 'UserId', as: 'Seller' }); // <— UserId
      Product.belongsToMany(models.User, {
        through: models.Order,
        as: 'Buyers',
        foreignKey: 'ProductId'
      });
    }
  }
  Product.init({
    name:        { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg:'Name required' } }},
    description: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg:'Description required' } }},
    price:       { type: DataTypes.INTEGER, allowNull: false, validate: { min: { args:[1], msg:'Min price 1' } }},
    stock:       { type: DataTypes.INTEGER, allowNull: false, validate: { min: { args:[0], msg:'Cannot be negative' } }},
    imageURL:    { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg:'Image URL required' } }},
    CategoryId:  DataTypes.INTEGER,
    UserId:      DataTypes.INTEGER, // <— add here so Sequelize knows about it
  }, {
    sequelize,
    modelName: 'Product',
    hooks: {
      beforeCreate: prod => { if (!prod.price) prod.price = 1 }
    }
  });
  return Product;
};