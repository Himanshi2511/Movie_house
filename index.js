const express = require('express');
const app = express();
const bcrypt = require('bcryptjs')
const session = require('express-session');
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
// -----------------------------GET ROUTES------------------------------
// ---------------------------------------------------------------------
app.get('/', function(req, res) {
  res.render('home', {
    title: ''
  });
});


app.get('/contactus', function(req, res) {
    res.render('contactus', {
      isAuth: req.session.isAuth,
      message: "",
      title: "Contact Us | "
    })
  })

const PORT = process.env.PORT || 3000

server.listen(PORT, function() {
  console.log(`Server started at port ${PORT}`);
})

