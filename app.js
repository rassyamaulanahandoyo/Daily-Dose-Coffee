const express = require('express')
const session = require('express-session')
const path = require('path')
const Controller = require('./controllers/controller')
const { isAuth, isAdmin } = require('./middleware/auth')

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false
}))

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null
    next()
})

// Public
app.get('/', Controller.landing)
app.get('/register', Controller.registerForm)      // â† was getRegister
app.post('/register', Controller.postRegister)
app.get('/login', Controller.loginForm)         // â† was getLogin
app.post('/login', Controller.postLogin)

// Protected
app.get('/logout', isAuth, Controller.getLogout)   // â† was logout

app.get('/products', isAuth, Controller.products)
app.get('/products/add', isAuth, isAdmin, Controller.getAddProduct)
app.post('/products/add', isAuth, isAdmin, Controller.postAddProduct)
app.get('/products/:id/edit', isAuth, isAdmin, Controller.getEditProduct)
app.post('/products/:id/edit', isAuth, isAdmin, Controller.postEditProduct)
app.get('/products/:id/delete', isAuth, isAdmin, Controller.deleteProduct)
app.get('/products/add-to-cart/:id', isAuth, Controller.getAddToCart)

app.get('/cart', isAuth, Controller.getCart)
app.get('/checkout', isAuth, Controller.getCheckout)

app.get('/categories', isAuth, Controller.categories)
app.get('/categories/:id', isAuth, Controller.categoryDetail)

app.get('/profile', isAuth, Controller.getProfile)
app.get('/profile/edit', isAuth, Controller.getEditProfile)
app.post('/profile/edit', isAuth, Controller.postEditProfile)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})