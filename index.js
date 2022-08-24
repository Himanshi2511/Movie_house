const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const cors = require('cors');
const server = require('http').Server(app); //Because we want to reuse the HTTP server for socket.io
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const mongoDbSession = require('connect-mongodb-session')(session)

const {
  v4: uuidV4
  
} = require('uuid');
const {
  validate: uuidValidate
} = require('uuid');
const {
  ExpressPeerServer
} = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});


const uri = 'mongodb+srv://shash:stark123@cluster0.td1gn.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri || "mongodb://localhost:27017/touchDB", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});
const store = new mongoDbSession({
  uri: uri,
  collection: "sessions"
})
const Schema = mongoose.connection;
Schema.once('open', function() {
  console.log('Database Connected!')
});





app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/peerjs', peerServer);
app.use(express.static('static'));
app.set('view engine', 'ejs');
app.use(cors());


app.use(session({
  secret: "hsfsdlhfdslkfhsdlfhskhlk",
  resave: false,
  saveUninitialized: false,
  store: store
}))

// ---------------------------------------------------------------------
// -------------------------------SCHEMAS-------------------------------
// ---------------------------------------------------------------------
let ChatSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
const Chat = mongoose.model("Chat", ChatSchema);

let MeetSchema = new mongoose.Schema({
  meetname: {
    type: String,
    required: true
  },
  meethost: {
    type: String,
    required: true
  },
  meetdetails: {
    type: String,
    required: true
  },
  startdate: {
    type: String,
    required: true
  },
  starttime: {
    type: String,
    required: true
  },
  enddate: {
    type: String,
    required: true
  },
  endtime: {
    type: String,
    required: true
  },
  status: Number, //Check for the meet is cancelled or not
  reminder: Number, //When the server reminds the users of this meet at the 'starttime' it changes this to 1
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }]

})

const Meet = mongoose.model("Meet", MeetSchema);

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  history: {
    type: String,
    required: false,
    default: 'Avatar'
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }]
})
const User = mongoose.model("User", UserSchema);

let GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true
  },
  groupkey: {
    type: String,
    required: true
  },
  meets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meet'
  }],

})
const Group = mongoose.model("Group", GroupSchema);



// ---------------------------------------------------------------------
// -----------------------------USER AUTH-------------------------------
// ---------------------------------------------------------------------
// Function to check if user is logged in or not
const isAuth = function(req, res, next) {
  if (req.session.isAuth) {
    next()
  } else {
    req.session.error = '';
    res.render('login', {
      isAuth: req.session.isAuth,
      message: "You are not logged in!",
      title: "Log In | "
    })
  }
}




// ---------------------------------------------------------------------
// -----------------------------GET ROUTES------------------------------
// ---------------------------------------------------------------------
app.get('/', function(req, res) {
  req.session.error = '';
  res.render('home', {
    isAuth: req.session.isAuth,
    title: ''
  });
});



// ${uuidV4} generates an uuid.
app.get('/hostmeet', function(req, res) {
  req.session.error = '';
  res.redirect(`/hostmeet/${uuidV4()}`);
});
app.get('/hostmeet/:meet', function(req, res) {
  if (uuidValidate(req.params.meet)) { //validates if used a proper uuidV4
    req.session.error = '';
    res.render('hostmeet', {
      meetId: req.params.meet,
      isAuth: req.session.isAuth,
      title: 'Host | '
    });
  } else {
    req.session.error = '';
    res.redirect(`/hostmeet/${uuidV4()}`)
  }
})

app.get('/joinmeet', function(req, res) {
  req.session.error = '';
  res.render('joinmeet', {
    isAuth: req.session.isAuth,
    message: "",
    title: "Join | "
  });
})

app.get('/share/:meet', function(req, res) {
  res.render('sharescreen', {
    title: "Screen | ",
    meetId: req.params.meet,
    isAuth: req.session.isAuth,
  });
})

app.get('/display/:meet', function(req, res) {
  res.render('displayscreen', {
    meetId: req.params.meet,
    isAuth: req.session.isAuth,
    title: "Screen | "
  });
})

app.get('/login', function(req, res) {
  if (req.session.isAuth) { //if user is already logged in redirects to the dashboard
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

app.get('/signup', function(req, res) {
  if (req.session.isAuth) { //if user is already logged in redirects to the dashboard
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





app.get('/hangup', function(req, res) {
  if (req.session.user) { //If logged in redirects to dashboard
    res.redirect('/dashboard')
  } else { //Else to the join page
    res.redirect('/joinmeet')
  }
})


app.get('/contactus', function(req, res) {
    res.render('contactus', {
      isAuth: req.session.isAuth,
      message: "",
      title: "Contact Us | "
    })
  })

  app.get('/logout', function(req, res) {
    req.session.destroy((err) => {
      if (err) throw err;
      res.render('logout', {
        isAuth: false,
        title: 'Log Out | '
      })
    })
  })

  app.get('/dashboard/:group', isAuth, async function(req, res) { //Group's Dashboard
    let groups = [];
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

  app.get('/chat/:group/:meet', isAuth, function(req, res) { //Chat page of a meet
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



  app.get('/group', isAuth, function(req, res) { //Group creating route
    res.render('creategroup', {
      isAuth: req.session.isAuth,
      message: '',
      title: "Create Group | "
    })
  })
  app.get('/joingroup', isAuth, function(req, res) { //Group joining route
    res.render('joingroup', {
      isAuth: req.session.isAuth,
      message: '',
      title: 'Join Group | '
    })
  })
  
  app.get("/leave/:group", isAuth, function(req, res) { //Group leaving route
    const group = req.params.group;
    const user = req.session.user;
    User.findOneAndUpdate({
        _id: user
      }, {
        $pull: {
          groups: group
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/dashboard");
        } else {
          req.session.destroy((err) => {
            res.render('login', {
              isAuth: req.session.isAuth,
              message: "You are not logged in!",
              title: "Log In |"
            });
          })
        }
      });
  });
  
  app.get('/createmeet/:group', isAuth, async function(req, res) { //Meet creating route
    let user = await User.findOne({ //Checks if the user is part of this group
      _id: req.session.user,
      groups: req.params.group
    }, function(err, user) {
      if (!user) {
        req.session.error = "You are not part of this group!"
        return res.redirect('/dashboard');
      }
    })
    let message = req.session.error;
    req.session.error = ""
    res.render('createmeet', {
      isAuth: req.session.isAuth,
      groupid: req.params.group,
      message: message,
      title: "Create Meet | "
    });
  
  })
  app.get('/cancelmeet/:group/:meet', isAuth, async function(req, res) { //Cancels meet
    let meet = await Meet.findOne({ //Checks if the meet exists
      _id: req.params.meet
    }, function(err, meet) {
      if (!meet) {
        req.session.error = "Meet does not exist!"
        return res.redirect("/dashboard/" + req.params.group);
      }
    })
  
    let user = await User.findOne({ //Checks if the user is part of this group
      _id: req.session.user,
      groups: req.params.group
    }, function(err, user) {
      if (!user) {
        req.session.error = "You are not part of this group!"
        return res.redirect('/dashboard');
      }
    })
  
    Meet.updateOne({ //Sets status to one
      _id: req.params.meet
    }, {
      $set: {
        status: 1
      }
    }, function(err, foundMeet) {
      if (!err) {
        User.find({
          groups: req.params.group
        }, function(err, users) {
          users.forEach(function(subuser) {
            mail(user, subuser, meet, "cancel")
          })
          req.session.error = "";
          res.redirect('/dashboard/' + req.params.group)
        })
      }
    })
  })
  app.get('/undomeet/:group/:meet', isAuth, async function(req, res) { //Undo cancel meet
    let meet = await Meet.findOne({ //Checks if the meet exist
      _id: req.params.meet
    }, function(err, meet) {
      if (!meet) {
        req.session.error = "Meet does not exist!"
        return res.redirect("/dashboard/" + req.params.group);
      }
    })
  
    let user = await User.findOne({ //Checks if the user is part of this meet
      _id: req.session.user,
      groups: req.params.group
    }, function(err, user) {
      if (!user) {
        req.session.error = "You are not part of this group!"
        return res.redirect('/dashboard');
      }
    })
  
    Meet.updateOne({ //Set status to 0
      _id: req.params.meet
    }, {
      $set: {
        status: 0
      }
    }, function(err, foundMeet) {
      if (!err) {
        User.find({
          groups: req.params.group
        }, function(err, users) {
          users.forEach(function(subuser) {
            mail(user, subuser, meet, "undocancel")
          })
          req.session.error = "";
          res.redirect('/dashboard/' + req.params.group)
        })
      }
    })
  })


// ---------------------------------------------------------------------
// -----------------------------POST ROUTES------------------------------
// ---------------------------------------------------------------------

app.post('/joinmeet', function(req, res) {
  let meetId = req.body.meetid;
  if (uuidValidate(meetId)) { //validates if used a proper uuidV4
    let userName = req.body.name;
    let video = req.body.video;
    let audio = req.body.audio;
    if (video == 'on') {
      video = true;
    } else {
      video = false;
    }
    if (audio == 'on') {
      audio = true;
    } else {
      audio = false;
    }
    if (!userName) {
      userName = 'Imposter'
    }
    res.render('meet', {
      meetId: meetId,
      title: '',
      userName: userName,
      video: video,
      chats: [],
      audio: audio,
      isAuth: req.session.isAuth,
      title: 'Create Meet | '
    })
  } else {
    res.render('joinmeet', {
      isAuth: req.session.isAuth,
      message: "Invalid meetId!!",
      title: "Join | "
    });
  }
  // res.redirect('/meet/' + meetId);
})
app.post('/hostmeet/:meet', function(req, res) {
  let meetId = req.params.meet;
  if (uuidValidate(meetId)) { //validates if used a proper uuidV4
    let userName = req.body.name;
    let video = req.body.video;
    let audio = req.body.audio;
    if (video == 'on') {
      video = true;
    } else {
      video = false;
    }
    if (audio == 'on') {
      audio = true;
    } else {
      audio = false;
    }
    if (!userName) {
      userName = 'Host'
    }
    res.render('meet', {
      meetId: meetId,
      title: '',
      chats: [],
      userName: userName,
      video: video,
      audio: audio,
      isAuth: req.session.isAuth,
      title: "Meet | "
    })
  } else {
    res.redirect('/hostmeet')
  }
})


app.post('/signup', async function(req, res) {
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let repassword = req.body.repassword;
  console.log(email,username,password)
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
app.post('/login', async function(req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let user = await User.findOne({ //Checks if the user exists
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
    // req.session.error = "Welcome " + user.username + " !"
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


// ---------------------------------------------------------------------
// -----------------------------SOCKET----------------------------------
// ---------------------------------------------------------------------
// All connections for the meet
io.on('connection', socket => {
  socket.on('entermeet', function(meetId, userId, userName) {
    socket.join(meetId); //join this meet
    socket.to(meetId).emit('entermeet', userId, userName);
    socket.on('displayscreen', function(userId, display) {
      socket.to(meetId).emit('displayscreen', userId, display);
    })
    //To implement the chat feature
    socket.on('message', (message, userId, userName) => {
      const chat = new Chat({
        user: userName,
        text: message
      })
      chat.save()
      Meet.findOne({
        _id: meetId,
      }, function(err, meet) {
        if (!err) {
          meet.chats.push(chat._id)
          meet.save()
        }
      })
      io.to(meetId).emit('message', message, userId, userName)
    });
    //To stop a user's video from being shared
    socket.on('stopvideo', function(userId, userName) {
      io.to(meetId).emit('stopvideo', userId, userName);
    })
    //To share a user's video
    socket.on('startvideo', function(userId, userName) {
      io.to(meetId).emit('startvideo', userId, userName);
    })
    //To mute all users except the one called for this
    socket.on('muteOthers', function(userId, userName) {
      io.to(meetId).emit('muteOthers', userId, userName);
    })

    socket.on('screenshare', function(userId, userName) {
      io.to(meetId).emit('screenshare', userId, userName);
    })
    //To notify that a user is sharing screen
    socket.on('startdisplay', function(userId, userName) {
      io.to(meetId).emit('startdisplay', userId, userName);
    })
    //To share name and get name of all users
    socket.on('ourname', function(userId, userName) {
      io.to(meetId).emit('ourname', userId, userName);
    })
    //Shares that a user has disconnected
    socket.on('disconnect', function() {
      socket.to(meetId).emit('leavemeet', userId, userName)
    })
  });
})
// All connectios for the drawing meet
io.on('connection', socket => {
  socket.on('enter', function(meetId) {
    socket.join(meetId)
    socket.to(meetId).emit('enter');
    socket.on('drawing', function(data) {
      io.to(meetId).emit('drawing', data);
    })
    socket.on('refresh', function() {
      io.to(meetId).emit('refresh');
    })
  })
});
// All Connections for the screensharing meet
io.on('connection', socket => {
  socket.on('display', function(meetId, userId, userName) { //Second
    socket.join(meetId); //join this meet
    socket.to(meetId).emit('display', userId, userName);
  });
});







const PORT = process.env.PORT || 3000

app.listen(PORT, function() {
  console.log(`Server started at port ${PORT}`);
})

