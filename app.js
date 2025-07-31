const express = require('express')
const app = express()
const port = 3000
const session = require('express-session')
const Controller = require('./controllers/controller')

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: true }
}))

// Roles
const isLogin = (req, res, next) => {
  if (!req.session.userId) {
    const error = 'Please login first!'
    return res.redirect(`/login?error=${error}`)
  }
  next()
}
const isAdmin = (req, res, next) => {
  if (req.session.role !== 'admin') {
    const error = 'You have no access!'
    return res.redirect(`/?error=${error}`)
  }
  next()
}

// Home
app.get('/', (req, res) => {
  const { error } = req.query
  res.render('home', { error, userId: req.session.userId })
})

// Auth
app.get('/register', Controller.registerForm)
app.post('/register', Controller.postRegister)
app.get('/login', Controller.loginForm)
app.post('/login', Controller.postLogin)
app.get('/logout', isLogin, Controller.getLogout)

// Product
app.get('/products', Controller.getProduct)
app.get('/products/detail/:id', Controller.productDetail)

// Admin product
app.get('/products/sell', isLogin, isAdmin, Controller.renderAddProduct)
app.post('/products/sell', isLogin, isAdmin, Controller.addProductHandler)
app.get('/products/update/:id', isLogin, isAdmin, Controller.updateProductPage)
app.post('/products/update/:id', isLogin, isAdmin, Controller.updateProductHandler)
app.get('/products/delete/:id', isLogin, isAdmin, Controller.deleteProduct)

// Cart
app.get('/cart', isLogin, Controller.viewCart)
app.post('/cart/add/:id', isLogin, Controller.addToCart)
app.post('/checkout', isLogin, Controller.checkout)

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
