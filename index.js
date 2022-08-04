const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const mongoDbSession = require('connect-mongodb-session')(session)


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


app.get('/contactus', function(req, res) {
    res.render('contactus', {
      isAuth: req.session.isAuth,
      message: "",
      title: "Contact Us | "
    })
  })

const PORT = process.env.PORT || 3000

app.listen(PORT, function() {
  console.log(`Server started at port ${PORT}`);
})

