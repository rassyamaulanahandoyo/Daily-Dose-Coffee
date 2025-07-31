'use strict'
const { Model, Op } = require('sequelize');
const { toRupiah } = require('../helpers/format')

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId' })
      Product.belongsTo(models.User, { foreignKey: 'userId' })
      Product.belongsToMany(models.User, {
        through: models.Order,
        foreignKey: 'productId',
        otherKey: 'userId'
      })
    }

    static searchAndSort({ search, sort }) {
      const where = {}
      if (search) {
        where.name = { [Op.iLike]: `%${search}%` }
      }
      const order = [];
      if (sort === 'price_asc') order.push(['price', 'ASC'])
      if (sort === 'price_desc') order.push(['price', 'DESC'])
      if (sort === 'stock_desc') order.push(['stock', 'DESC'])

      return this.findAll({ where, order, include: ['Category', 'User'] })
    }

    get priceRupiah() {
      return toRupiah(this.price)
    }
  }

  Product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name required' },
        notNull: { msg: 'Name required' }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Description required' },
        notNull: { msg: 'Description required' }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Price required' },
        notNull: { msg: 'Price required' },
        min: { args: [1000], msg: 'Min price 1000' }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    imgUrl: {
      type: DataTypes.STRING,
      validate: { isUrl: { msg: 'imgUrl must be a URL' } }
    },
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  })

  return Product;
};
