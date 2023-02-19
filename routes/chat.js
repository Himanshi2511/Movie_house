const router = require("express").Router();
const User = require("../models/user");
const Meet = require("../models/meet");
const isAuth = require("../middleware/auth");


router.get('/chat/:group/:meet', isAuth, function(req, res) { //Chat page of a meet
    User.findOne({
      _id: req.session.user,
      groups: req.params.group
    }).populate('groups').exec(function(err, user) {
      if (!user) { //If the user is accessing a group wrongfully
        req.session.error = "You are not part of this group!"
        return res.redirect('/dashboard');
      } else {
        groups = user.groups;
        userName = user.username;
        Meet.findOne({ //Checks if the meet exists
          _id: req.params.meet
        }).populate('chats').exec(function(err, meet) {
          if (err) {
            req.session.error = "Meet does not exist!"
            res.redirect('/dashboard');
          } else {
            res.render('chat', {
              groups: groups,
              thisgroup: '',
              userName: userName,
              meet: meet,
              message: "",
              chats: meet.chats,
              isAuth: req.session.isAuth,
              title: meet.meetname + " | "
            })
          }
        })
      }
    })
  })

  module.exports = router;