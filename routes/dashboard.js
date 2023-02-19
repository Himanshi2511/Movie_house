const router = require('express').Router();
const User = require('../models/user');
const Group = require('../models/group');
const isAuth = require('../middleware/auth')


// router.get('/',isAuth,async function(req,res){
//   console.log(req.session.user);
//   let user = await User.findOne({_id:req.session.user},function(err,user){
//     if (err) {
//               res.render('login', {
//                 isAuth: req.session.isAuth,
//                 message: "You are not logged in!",
//                 title: "Log In | "
//               })
//     }
// }).populae("groups");
// console.log(user);
// const spawn = require("child_process").spawn;
//         const pythonProcess = spawn('python3',["./script.py", user.history]);
//           pythonProcess.stdout.on('data', (data) => {
//           console.log(data.toString())
//           });
//           // Handle error output
//           pythonProcess.stderr.on('data', (data) => {
//             // As said before, convert the Uint8Array to a readable string.
//             console.log(String.fromCharCode.apply(null, data));
//           });
      
//           pythonProcess.on('exit', (code) => {
//             console.log("Process quit with code : " + code);
//           });


//           let message = req.session.error;
//         req.session.error = ""
//         res.render('dashboard', {
//           groups: user.groups,
//           thisgroup: '',
//           meets: [],
//           members: [],
//           user: user,
//           message: message,
//           history: history,
//           isAuth: req.session.isAuth,
//           title: 'Dashboard | '
//         })
   
// });

router.get('/', isAuth, function(req, res) {
   let userx = User.findOne({ // Fetches all groups this user is a part of
      _id: req.session.user
    }).populate('groups').exec(function(err, user) {
      console.log(user);
      if (err) {
        res.render('login', {
          isAuth: req.session.isAuth,
          message: "You are not logged in!",
          title: "Log In | "
        })
      } else {
        // console.log(user)
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python3',["./script.py", user.history]);
          pythonProcess.stdout.on('data', (data) => {
          console.log(data.toString())
          });
          // Handle error output
          pythonProcess.stderr.on('data', (data) => {
            // As said before, convert the Uint8Array to a readable string.
            console.log(String.fromCharCode.apply(null, data));
          });
      
          pythonProcess.on('exit', (code) => {
            console.log("Process quit with code : " + code);
          });
  
        let message = req.session.error;
        req.session.error = ""
        res.render('dashboard', {
          groups: user.groups,
          thisgroup: '',
          meets: [],
          members: [],
          user: user,
          message: message,
          // history: history,
          isAuth: req.session.isAuth,
          title: 'Dashboard | '
        })
      }
    })
  
  })




  router.get('/:group', isAuth, async function(req, res) { //Group's Dashboard
    let groups = [];
    console.log(req.params.group);
    let members = await User.find({ //fetches members of this group
      groups: req.params.group
    }, function(err, members) {
      if (!members) {
        req.session.error = "Group doesn't exists!"
        return res.redirect('/dashboard');
      }
    });
  
  
    User.findOne({ // Fetches all groups this user is a part of
      _id: req.session.user,
      groups: req.params.group
    }).populate('groups').exec(function(err, user) { //Fetches groups of this user
      if (!user) { //If user is accessing this group wrongfully
        req.session.error = 'Your are not part of this group!'
        return res.redirect('/dashboard');
      } else {
        groups = user.groups;
        Group.findOne({ //Fetches all the meets of this particular group
          _id: req.params.group
        }).populate('meets').exec(function(err, group) {
          if (err || !group) {
            res.redirect('/dashboard');
          } else {
            let message = req.session.error;
            req.session.error = "";
            res.render('dashboard', {
              groups: groups,
              thisgroup: group,
              user: req.session.user,
              meets: group.meets,
              message: message,
              members: members,
              isAuth: req.session.isAuth,
              title: group.groupname + " | "
            })
          }
        })
      }
    });
  })

  module.exports = router;
