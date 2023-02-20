const router = require("express").Router();
const nodemailer = require("nodemailer");


router.get('/', function(req, res) {
  res.render('contactus', {
    isAuth: req.session.isAuth,
    message: "",
    title: "Contact Us | "
  })
})

router.post('/', function(req, res) {
    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use TLS
      auth: {
        user: 'orangecube@gmail.com',
        pass: process.env.PASSWORD
      }
    });
  
    let mailDetails = {
      to: 'orangecube@gmail.com',
      subject: req.body.subject,
      html: req.body.feedback
    };
  
    mailTransporter.sendMail(mailDetails, function(err, data) {
      if (err) {
        console.log(err);
      }
    });
    req.session.error = "";
    res.render('contactus', {
      isAuth: req.session.isAuth,
      message: "Your Email has been Received! Thank You for your Feedback!",
      title: "Contact Us | "
    })
  })

  module.exports =router;