var express = require('express');
var router = express.Router();
const userModel = require('./data');
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require('connect-flash');
const mongoose = require('mongoose');
let multer = require('multer');

passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('start');
});

router.get('/signin', function(req, res, next) {
  res.render('signin', { error: req.flash('error') });
});

router.get('/home', isLoggedIn, function(req, res, next) {
  res.render('home');
});

router.get('/about', isLoggedIn, function(req, res, next) {
  res.render('about');
});

router.post('/register', function(req, res, next) {
  var userdata = new userModel({
    username: req.body.username,
    email: req.body.email
  });

  userModel.register(userdata, req.body.password)
    .then(function(registeruser) {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/home');
      });
    })
    .catch(function(err) {
      res.render('signin', { error: err.message });
    });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/',
  failureFlash: true
}), function(req, res) {
  req.flash('name', req.body.username);
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
