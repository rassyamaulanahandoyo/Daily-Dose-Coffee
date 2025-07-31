const express = require('express');
const session = require('express-session');
const app = express();
const router = require('./routes');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'Daily Dose Coffee',
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use(router);

app.listen(3000, () => {
    console.log('App running at http://localhost:3000');
});
