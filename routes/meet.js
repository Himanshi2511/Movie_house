const router = require("express").Router();
const User = require("../models/user");
const Meet = require("../models/meet");
const isAuth = require("../middleware/auth");

router.get('/meet/:meet/:title', isAuth, function(req, res) {
    let meetId = req.params.meet
    let title = req.params.title + " | "
    let user = req.session.user
    let video = true
    let audio = true
    //'Not' checking if the user is part of the group to allow other logged in users to the meet
    User.findOne({
      _id: user
    }, function(err, foundUser) {
      if (err) {
        req.session.destroy((err) => {
          res.render('login', {
            isAuth: req.session.isAuth,
            message: "You are not logged in!",
            title: "Log In |"
          });
        })
      } else {
        Meet.findOne({
          _id: meetId
        }).populate('chats').exec(function(err, meet) { //Fetches chats
          if (err) {
            res.redirect('/dashboard');
          } else {
            res.render('meet', {
              meet: meet,
              chats: meet.chats,
              meetId: meetId,
              title: title,
              userName: foundUser.username,
              video: video,
              audio: audio,
              isAuth: req.session.isAuth,
            })
          }
        })
      }
    })
  })

  module.exports = router;