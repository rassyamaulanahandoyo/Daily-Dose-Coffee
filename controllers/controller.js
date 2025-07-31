// controllers/controller.js

const { User, Category, Detail, Product, Order } = require('../models')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const formatCurrency = require('../helpers/helper')
const qrCode = require('qrcode')

class Controller {
  // ─── PUBLIC ────────────────────────────────────────────────────────────────

  static landing(req, res) {
    res.render('landing')
  }

  static getRegister(req, res) {
    res.render('register')
  }

  static async postRegister(req, res) {
    try {
      const { email, password, role } = req.body
      await User.create({ email, password, role })
      res.redirect('/login')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message)
        return res.render('register', { errors })
      }
      res.send(error)
    }
  }

  static getLogin(req, res) {
    const { error } = req.query
    res.render('login', { error })
  }

  static async postLogin(req, res) {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.redirect('/login?error=Invalid credentials')
      }
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return res.redirect('/login?error=Invalid credentials')
      }
      req.session.user = { id: user.id, email: user.email, role: user.role }
      res.redirect('/products')
    } catch (error) {
      res.send(error)
    }
  }

  // ─── PROTECTED ─────────────────────────────────────────────────────────────

  static logout(req, res) {
    req.session.destroy(err => {
      if (err) return res.send(err)
      res.redirect('/')
    })
  }

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  static async products(req, res) {
    try {
      const { search, type, productDelete, sort } = req.query
      const where = {}
      if (search) where.name = { [Op.iLike]: `%${search}%` }
      if (type)  where.CategoryId = type

      let order = [['name','ASC']]
      if (sort==='price_asc')  order = [['price','ASC']]
      if (sort==='price_desc') order = [['price','DESC']]

      const data = await Product.findAll({
        include: [
          { model: User, attributes: ['email'], as: 'Seller' },
          Category
        ],
        where,
        order
      })

      res.render('products', { data, productDelete, search, type, sort, formatCurrency })
    } catch (error) {
      res.send(error)
    }
  }

  static getAddProduct(req, res) {
    res.render('addProduct', { errors:null })
  }

  static async postAddProduct(req, res) {
    try {
      const { name, description, price, stock, imageURL, CategoryId } = req.body
      await Product.create({
        name,
        description,
        price,
        stock,
        imageURL,
        CategoryId,
        UserId: req.session.user.id    // ← match your migration
      })
      res.redirect('/products')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message)
        return res.render('addProduct', { errors })
      }
      res.send(error)
    }
  }

  static async getEditProduct(req, res) {
    try {
      const { id } = req.params
      const { errors } = req.query
      const product = await Product.findByPk(id)
      res.render('updateProduct', { product, errors: errors ? errors.split(',') : [] })
    } catch (error) {
      res.send(error)
    }
  }

  static async postEditProduct(req, res) {
    try {
      const { id } = req.params
      const { name, description, price, stock, imageURL } = req.body
      await Product.update(
        { name, description, price, stock, imageURL },
        { where: { id } }
      )
      res.redirect('/products')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message).join(',')
        return res.redirect(`/products/${id}/edit?errors=${errors}`)
      }
      res.send(error)
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params
      const product = await Product.findByPk(id)
      await Product.destroy({ where: { id } })
      res.redirect(`/products?productDelete=${product.name}`)
    } catch (error) {
      res.send(error)
    }
  }

  // ─── CART & CHECKOUT ───────────────────────────────────────────────────────

  static async getAddToCart(req, res) {
    try {
      const { id } = req.params
      const userId = req.session.user.id
      let order = await Order.findOne({
        where: { UserId: userId, ProductId: id, status: 'cart' }
      })
      if (order) {
        order.qty++
        await order.save()
      } else {
        await Order.create({
          UserId: userId,
          ProductId: id,
          qty: 1,
          status: 'cart'
        })
      }
      res.redirect('/cart')
    } catch (error) {
      res.send(error)
    }
  }

  static async getCart(req, res) {
    try {
      const userId = req.session.user.id
      const cartItems = await Order.findAll({
        where: { UserId: userId, status: 'cart' },
        include: [Product]
      })
      res.render('cart', { cartItems, formatCurrency })
    } catch (error) {
      res.send(error)
    }
  }

  static async getCheckout(req, res) {
    try {
      const userId = req.session.user.id
      const cartItems = await Order.findAll({
        where: { UserId: userId, status: 'cart' },
        include: [Product]
      })
      const total = cartItems.reduce(
        (sum, o) => sum + o.qty * o.Product.price,
        0
      )
      const qrUrl = await qrCode.toDataURL(`coffee-store://pay?amount=${total}`)
      await Promise.all(
        cartItems.map(o => {
          o.status = 'paid'
          return o.save()
        })
      )
      res.render('checkout', { cartItems, total, qrUrl, formatCurrency })
    } catch (error) {
      res.send(error)
    }
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

  static async categories(req, res) {
    try {
      const data = await Category.findAll({ order: [['name','ASC']] })
      res.render('categories', { data })
    } catch (error) {
      res.send(error)
    }
  }

  static async categoryDetail(req, res) {
    try {
      const { id } = req.params
      const current   = await Category.findByPk(id)
      const products  = await Product.findAll({
        where: { CategoryId: id },
        include: [Product.sequelize.models.User],
        order: [['name','ASC']]
      })
      res.render('categoryDetail', { current, products, formatCurrency })
    } catch (error) {
      res.send(error)
    }
  }

  // ─── PROFILE ───────────────────────────────────────────────────────────────

  static async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.session.user.id)
      res.render('profile', { user })
    } catch (error) {
      res.send(error)
    }
  }

  static async getEditProfile(req, res) {
    try {
      const user = await User.findByPk(req.session.user.id)
      const { errors } = req.query
      res.render('editProfile', {
        user,
        errors: errors ? errors.split(',') : []
      })
    } catch (error) {
      res.send(error)
    }
  }

  static async postEditProfile(req, res) {
    try {
      const { email, password, role } = req.body
      const id = req.session.user.id
      const updates = { email, role }
      if (password) updates.password = password
      await User.update(updates, { where: { id } })
      // refresh session
      req.session.user.email = email
      req.session.user.role  = role
      res.redirect('/profile')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message).join(',')
        return res.redirect(`/profile/edit?errors=${errors}`)
      }
      res.send(error)
    }
  }
}

module.exports = Controller
