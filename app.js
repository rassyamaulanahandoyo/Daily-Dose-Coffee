const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const app = express();
const router = require('./routes');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

