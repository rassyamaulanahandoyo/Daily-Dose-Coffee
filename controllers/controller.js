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

  static registerForm(req, res) {
    res.render('registerForm')
  }

  static async postRegister(req, res) {
    try {
      const { email, password, role } = req.body
      await User.create({ email, password, role })
      res.redirect('/login')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message)
        return res.render('registerForm', { errors })
      }
      res.send(error)
    }
  }

  static loginForm(req, res) {
    const { error } = req.query
    res.render('loginForm', { error })
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
      res.redirect('/')
    } catch (error) {
      res.send(error)
    }
  }

  // ─── PROTECTED ─────────────────────────────────────────────────────────────

  static getLogout(req, res) {
    req.session.destroy(err => {
      if (err) return res.send(err)
      res.redirect('/login')
    })
  }

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  static async getProduct(req, res) {
    try {
      const { search, type, productDelete } = req.query

      let data = await Product.findAll({
        include: { model: User, attributes: ['email'] },
        order: [['name', 'ASC']]
      })

      if (search) {
        data = await Product.findAll({
          include: { model: User, attributes: ['email'] },
          where: {
            name: { [Op.iLike]: `%${search}%` }
          },
          order: [['name', 'ASC']]
        })
      }

      if (type) {
        // assume `type` is a CategoryId
        data = await Product.findAll({
          include: { model: User, attributes: ['email'] },
          where: { CategoryId: type },
          order: [['name', 'ASC']]
        })
      }

      res.render('products', { data, productDelete })
    } catch (error) {
      res.send(error)
    }
  }

  static renderAddProduct(req, res) {
    const { errors } = req.query
    res.render('addProduct', { errors })
  }

  static async addProductHandler(req, res) {
    try {
      const { name, description, price, stock, imageURL, CategoryId } = req.body
      await Product.create({
        name,
        description,
        price,
        stock,
        imageURL,
        CategoryId,
        userId: req.session.user.id
      })
      res.redirect('/products')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message)
        return res.redirect(`/products/add?errors=${errors}`)
      }
      res.send(error)
    }
  }

  static async getEditProduct(req, res) {
    try {
      const { id } = req.params
      const { errors } = req.query
      const product = await Product.findByPk(id)
      res.render('updateProduct', { product, errors })
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
        const errors = error.errors.map(e => e.message)
        return res.redirect(`/products/${req.params.id}/edit?errors=${errors}`)
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

  static async buyProduct(req, res) {
    // render a quick single-product purchase page if desired
    res.render('buyProduct')
  }

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
      res.render('editProfile', { user, errors })
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
      req.session.user.email = email
      req.session.user.role  = role
      res.redirect('/profile')
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(e => e.message)
        return res.redirect(`/profile/edit?errors=${errors}`)
      }
      res.send(error)
    }
  }
}

module.exports = Controller
