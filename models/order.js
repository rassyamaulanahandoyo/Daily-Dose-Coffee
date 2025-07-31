'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId' })
      Order.belongsTo(models.Product, { foreignKey: 'productId' })
    }
    get totalPrice() {
      if (this.Product) return this.quantity * this.Product.price
      return this.quantity * (this.priceSnapshot || 0)
    }
  }

  Order.init({
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Quantity min 1' } }
    },
    priceSnapshot: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'paid'
    }
  }, {
    sequelize,
    modelName: 'Order',
    hooks: {
      async beforeCreate(order) {
        const { Product } = sequelize.models
        const product = await Product.findByPk(order.productId)
        if (!product) throw new Error('Product not found')
        if (product.stock < order.quantity) throw new Error('Not enough stock')

        order.priceSnapshot = product.price
        product.stock = product.stock - order.quantity
        await product.save()
      }
    }
  });

  return Order;
};
