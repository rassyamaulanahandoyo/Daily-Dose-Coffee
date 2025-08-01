'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Detail extends Model {
    static associate(models) {
      // no associations
    }
  }

  Detail.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Detail name is required' } }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Description is required' } }
    }
  }, {
    sequelize,
    modelName: 'Detail'
  });

  return Detail;
};