const express = require('express')
const router = express.Router()
const Controller = require('../controllers/controller')
const { isLoggedIn, isAdmin } = require('../middlewares/auth')

router.get('/', Controller.landing)
router.get('/register', Controller.showRegisterForm)
router.post('/register', Controller.register)
router.get('/login', Controller.showLoginForm)
router.post('/login', Controller.login)
router.get('/logout', Controller.logout)

router.get('/products', isLoggedIn, Controller.showProductList)
router.get('/products/:id/buy', isLoggedIn, Controller.buyProduct)

router.get('/products/add', isLoggedIn, isAdmin, Controller.showAddProductForm)
router.post('/products/add', isLoggedIn, isAdmin, Controller.addProduct)
router.get('/products/:id/edit', isLoggedIn, isAdmin, Controller.showEditProductForm)
router.post('/products/:id/edit', isLoggedIn, isAdmin, Controller.editProduct)
router.get('/products/:id/delete', isLoggedIn, isAdmin, Controller.deleteProduct)

module.exports = router;
