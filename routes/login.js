const router = require('express').Router();
const User = require("../models/user");
const bcrypt = require('bcryptjs');




router.get('/', function(req, res) {
    if (req.session.isAuth) { 
      req.session.error = '';
      res.redirect('/dashboard')
    } else {
      res.render('login', {
        isAuth: req.session.isAuth,
        message: req.session.error,
        title: "Log In |"
      });
    }
  })

router.post('/', async function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let user = await User.findOne({
      email: email
    }, function(err, user) {
      if (!user) {
        req.session.error = "";
        return res.render("signup", {
          isAuth: req.session.isAuth,
          message: "User Does Not Exist",
          title: "Sign Up | "
        });
      }
    })
    const isMatch = await bcrypt.compare(password, user.password)
    if (isMatch) {
      req.session.isAuth = true;
      req.session.user = user._id;
      req.session.error = "Welcome " + user.username + " !"
      res.redirect('/dashboard');
    } else {
      req.session.error = "";
      res.render("login", {
        isAuth: req.session.isAuth,
        message: 'Incorrect Password',
        title: 'Log In |'
      });
    }
  })



  module.exports = router;