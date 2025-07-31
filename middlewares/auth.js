function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        req.flash('error', 'You must log in first!');
        return res.redirect('/login');
    }
    next();
}

function isAdmin(req, res, next) {
    if (req.session.role !== 'admin') {
        req.flash('error', 'Only admin can access this page!');
        return res.redirect('/');
    }
    next();
}

module.exports = {
    isLoggedIn,
    isAdmin
};
