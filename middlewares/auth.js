const isAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.send('Access denied: Admins only');
    }
    next();
};

module.exports = { isAuth, isAdmin };