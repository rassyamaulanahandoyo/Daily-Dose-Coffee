'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Detail extends Model {
    static associate(models) {
      Detail.belongsTo(models.Product, { foreignKey: 'ProductId', as: 'Product' });
    }
  }

  Detail.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Detail name is required' } }
    },
    description: {
      type: DataTypes.TEXT, // allow long paragraphs
      allowNull: false,
      validate: { notEmpty: { msg: 'Description is required' } }
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Detail'
  });

  return Detail;
};