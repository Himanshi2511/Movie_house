const router = require("express").Router();
const isAuth = require("../middleware/auth");
const Group = require("../models/group");
const User =  require('../models/user');




router.get('/', isAuth, function(req, res) { //Group joining route
    res.render('joingroup', {
      isAuth: req.session.isAuth,
      message: '',
      title: 'Join Group | '
    })
  })

router.post('/', isAuth, async function(req, res) {
    let name = req.body.name;
    let key = req.body.key;
    let group = await Group.findOne({ //Checks if the entered data matches
      groupname: name,
      groupkey: key
    }, function(err, group) {
      if (!group) {
        req.session.error = "";
        return res.render('joingroup', {
          isAuth: req.session.isAuth,
          message: "Recheck name and key!",
          title: "Join Group | "
        })
      }   
      
      User.findOne({ //If user is already part of the group
        _id: req.session.user,
        groups: group._id
      }, function(err, ispart) {
        if (ispart) {
          req.session.error = "You are already in the group!";
          return res.redirect('/dashboard/' + group._id)
        }
      })

      User.findOne({ //Else adds it to his/her groups list
        _id: req.session.user,
      }, function(err, foundUser) {
        if (err) {
          return res.redirect('/joingroup');
        }
        foundUser.groups.push(group._id);
        foundUser.save();
        req.session.error = "";
        res.redirect('/dashboard/' + group._id)
      })
      
    });
  
  })

  module.exports = router;