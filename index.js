const express = require('express');
const app = express();
const mongoose = require('mongoose');
const mongoDbSession = require('connect-mongodb-session')(session)


const uri = 'mongodb+srv://shash:stark123@cluster0.td1gn.mongodb.net/?retryWrites=true&w=majority';


app.use(express.static('static'));
app.set('view engine', 'ejs');




// ---------------------------------------------------------------------
// -----------------------------GET ROUTES------------------------------
// ---------------------------------------------------------------------



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

