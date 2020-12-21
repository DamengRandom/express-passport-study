if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const app = express();

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const users = []; // just play a role like a DB

const port = process.env.PORT || 7676;

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// routes
app.get('/', checkAuthenticated, function(req, res) {
  res.render('index.ejs', { name: req.user.name });
});

app.get('/login', checkNotAuthenticated, function(req, res) {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, function(req, res) {
  res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async function(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
  console.log(users);
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});


function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

// server up
app.listen(port, function(req, res) {
  console.log("App is running on " + port);
});
