const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const cors = require('cors');
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
  }

})

const Meet = mongoose.model("Meet", MeetSchema);



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


const PORT = process.env.PORT || 3000

app.listen(PORT, function() {
  console.log(`Server started at port ${PORT}`);
})

