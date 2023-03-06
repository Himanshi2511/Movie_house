const nodePickle = require('node-pickle');
const express = require('express');
const app = express();
const session = require('express-session');
const mongoDbSession = require('connect-mongodb-session')(session)
const server = require('http').Server(app); //Because we want to reuse the HTTP server for socket.io
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');



const isAuth = require("./middleware/auth");
const mail = require("./middleware/mail");
const Chat = require("./models/chat");
const Meet = require("./models/meet");
const Group = require("./models/group");
const User = require("./models/user");
const hostmeet_router = require("./routes/hostmeet");
const joinmeet_router = require("./routes/joinmeet");
const router_login = require("./routes/login.js");
const router_signup = require("./routes/signup.js");
const router_dashboard = require("./routes/dashboard");
const router_contact = require("./routes/contact");
const router_meet = require("./routes/meet");
const router_chat = require("./routes/chat");
const router_reminder = require("./routes/reminder");
const router_search= require("./routes/search");
const router_joingroup = require("./routes/joingroup");
const router_group = require("./routes/group");
const router_time = require("./middleware/corn_time");

//connecting to mongodb
const uri = 'mongodb+srv://shash:stark123@cluster0.td1gn.mongodb.net/?retryWrites=true&w=majority';

// const uri = process.env.MONGODB_URI;
mongoose.connect(uri || "mongodb://localhost:27017/touchDB", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('DB connected successfully...')
  router_time;
})
.catch((err) => console.log('DB could not connect!\nError: ',err));



const store = new mongoDbSession({
  uri: uri,
  collection: "sessions"
})

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


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('static'));
app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');
app.use(cors());
app.use(session({
  secret: "hsfsdlhfdslkfhsdlfhskhlk",
  resave: false,
  saveUninitialized: false,
  store: store
}))



app.get('/', function(req, res) {
  req.session.error = '';
  res.render('home', {
    isAuth: req.session.isAuth,
    title: ''
  });
});



app.use("/hostmeet/",hostmeet_router);
app.use("/joinmeet/",joinmeet_router);
app.use("/login",router_login);
app.use("/signup",router_signup);
app.use("/dashboard",router_dashboard);
app.use("/contactus",router_contact);
app.use("/meet",router_meet);
app.use("/chat",router_chat);
app.use("/reminder",router_reminder);
app.use("/search",router_search);
app.use("/joingroup",router_joingroup);
app.use("/group",router_group);


// Screen sharing routes one for the person sharing and other for the audience
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

app.get('/hangup', function(req, res) {
  if (req.session.user) { //If logged in redirects to dashboard
    res.redirect('/dashboard')
  } else { //Else to the join page
    res.redirect('/joinmeet')
  }
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


app.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    if (err) throw err;
    res.render('logout', {
      isAuth: false,
      title: 'Log Out | '
    })
  })
})


// ---------------------------------------------------------------------
// -----------------------------POST ROUTES------------------------------
// ---------------------------------------------------------------------


app.post('/createmeet/:group', isAuth, async function(req, res) {
  let groupid = req.params.group;
  let name = req.body.name;
  let details = req.body.details;
  let start = req.body.start;
  let end = req.body.end;

  if (name == "" || details == "") { //Checks if nothing is blank
    return res.redirect('/createmeet/' + groupid);
  }
  let members = await User.find({ //Checks if there are any members
    groups: req.params.group
  }, function(err, members) {
    if (!members) {
      req.session.error = "Group does not exist!";
      return res.redirect("/dashboard")
    }

  })

  let group = await Group.findOne({ //Checks if the group exists
    _id: groupid
  }, function(err, group) {
    if (!group) {
      req.session.error = "Group does not exist!";
      return res.redirect("/dashboard")
    }
  })

  User.findOne({ //If the user is part of this group
    _id: req.session.user,
    groups: groupid
  }).populate('groups').exec(function(err, user) {
    if (!user) {
      return res.redirect('/dashboard' + groupid)
    } else if (err) {
      return res.redirect("/dashboard");
    }
    const meet = new Meet({
      meetname: name,
      meethost: user.username,
      meetdetails: details,
      startdate: start.slice(0, 10),
      starttime: start.slice(11, 16),
      enddate: end.slice(0, 10),
      endtime: end.slice(11, 16),
      status: 0,
      reminder: 0,

    })
    meet.save()
    group.meets.push(meet._id);
    group.save();

    members.forEach(function(member) { //Sends an invite mail to each user
      mail(user, member, meet, "invite")
    })
    req.session.error = "New Meet Created!"
    res.redirect('/dashboard/' + group._id)
  })

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
server.listen(PORT, function() {
  console.log(`Server started at port ${PORT}`);
})

