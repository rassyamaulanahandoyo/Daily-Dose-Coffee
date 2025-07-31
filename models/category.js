'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, { foreignKey: 'categoryId' });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Category name required' },
          notNull: { msg: 'Category name required' }
        }
      }
    },
    {
      sequelize,
      modelName: 'Category'
    }
  );

  return Category;
};
