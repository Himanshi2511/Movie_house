const router = require("express").Router();
const mail = require("../middleware/mail");
const isAuth = require('../middleware/auth')

router.get('/:group/:meet', isAuth, async function(req, res) { //reminder route
    let meet = await Meet.findOne({ //Checks if the meetid is proper
      _id: req.params.meet
    }, function(err, meet) {
      if (!meet) {
        req.session.error = "Meet does not exist!"
        return res.redirect("/dashboard/" + req.params.group);
      }
    })
  
    let user = await User.findOne({ //Checks if the user is the part of this meet
      _id: req.session.user,
      groups: req.params.group
    }, function(err, meet) {
      if (!meet) {
        req.session.error = "You are not part of this group!"
        return res.redirect('/dashboard');
      }
    })
    User.find({ //Finds all users of this group
      groups: req.params.group
    }, function(err, members) {
  
      members.forEach(function(member) { //Mails each one of them
        mail(user, member, meet, "reminder")
      })
  
      res.redirect('/dashboard/' + req.params.group)
    })
  
  })
  

  module.exports = router;