const router = require("express").Router();
const User = require("../models/user");
const Group = require("../models/group");
const isAuth = require("../middleware/auth");

router.get('/', isAuth, function(req, res) { //Group creating route
    res.render('creategroup', {
      isAuth: req.session.isAuth,
      message: '',
      title: "Create Group | "
    })
  })

router.post('/', isAuth, async function(req, res) {
    let name = req.body.name;
    let key = req.body.key;
  
    await Group.findOne({ //Checks if the groupname is already taken or not
      groupname: name
    }, function(err, foundGroup) {
      if (foundGroup) {
        req.session.error = ""
        return res.render('creategroup', {
          isAuth: req.session.isAuth,
          message: "Sorry! Group Name already taken!",
          title: "Create Group | "
        });
      } else {
        if (name == "" || key == "") {
          req.session.error = ""
          return res.render('creategroup', {
            isAuth: req.session.isAuth,
            message: "Please Input all Data",
            title: "Create Group | "
          });
        } else {
          User.findOne({
            _id: req.session.user
          }, function(err, foundUser) {
            if (err) {
              req.session.error = "User logged out!"
              res.redirect('/login');
            } else {
              const group = new Group({
                groupname: name,
                groupkey: key
              });
              group.save();
              foundUser.groups.push(group._id);
              foundUser.save();
              res.redirect('/dashboard/' + group._id)
            }
          })
        }
      }
    });
  })

  module.exports = router;