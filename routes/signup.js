const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require('bcryptjs');

router.get('/', function(req, res) {
    if (req.session.isAuth) { 
      req.session.error = '';
      res.redirect('/dashboard')
    } else {
      res.render('signup', {
        isAuth: req.session.isAuth,
        message: req.session.error,
        title: "Sign Up | "
      })
    }
  })


  router.post('/',async(req,res)=>{
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;
    if (email == "" || username == "" || password == "") { //Input cannot be blank
        return res.render('signup', {
          isAuth: req.session.isAuth,
          message: "Please Input Every Data!",
          title: 'Sign Up | '
        })
      }
      if (password != repassword) { //Equate the two passwords
        return res.render('signup', {
          isAuth: req.session.isAuth,
          message: "Passwords do not match.",
          title: 'Sign Up | '
        })
      }
      let foundUser = await User.findOne({ //Shouldn't be an existing user
        email: email
      });
      if (foundUser) {
        req.session.error = ""
        return res.render('signup', {
          isAuth: req.session.isAuth,
          message: "User Already Exists!",
          title: 'Sign Up | '
        });
      }
      const hashedPsw = await bcrypt.hash(password, 5); //hashing
    
      const user = new User({
        email: email,
        username: username,
        password: hashedPsw
      });
      await user.save();
      req.session.isAuth = true;
      req.session.user = user._id;
      req.session.error = "Welcome " + username + " !"
      res.redirect('/dashboard');
  })

  module.exports = router;
  