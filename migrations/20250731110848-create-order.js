'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'UserId' });
      Order.belongsTo(models.Product, { foreignKey: 'ProductId' });
    }
  }

  Order.init({
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cart'
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Order'
  });

  return Order;
};