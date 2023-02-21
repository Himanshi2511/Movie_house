const nodemailer = require("nodemailer")

const mail = function mail(from, to, meet, type) {
    let mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use TLS
      auth: {
        user: 'orangecube@gmail.com',
        pass: process.env.PASSWORD
      }
    });
    let message = ""
    if (type == "reminder") {
      message += `Dear ` + to.username + `<br>This mail is to remind you about the meet ` + meet.meetname + ` .<br>` + meet.meetdetails + `<br>Timings: ` + meet.startdate + ` ` + meet.starttime + `<br> <a href="https://localhost:3000/meet/` + meet._id + `/` + meet.meetname + `">MeetLink</a><br>Regards <br>` + meet.meethost
    } else if (type == "invite") {
      message += `Dear ` + to.username + `<br>This mail is to invite you about the meet ` + meet.meetname + ` .<br>` + meet.meetdetails + `<br>Timings: ` + meet.startdate + ` ` + meet.starttime + `<br> <a href="https://localhost:3000/meet/` + meet._id + `/` + meet.meetname + `">MeetLink</a><br> Regards <br>` + meet.meethost
    } else if (type == "cancel") {
      message += `Dear ` + to.username + `<br>This is to inform you with regret that the meet ` + meet.meetname + ` is cancelled.<br> Regards <br>` + from.username
    } else if (type == "undocancel") {
      message += `Dear ` + to.username + `<br>This is to inform you that the event ` + meet.meetname + ` is not cancelled. <br>` + meet.meetdetails + `<br>Timings: ` + meet.startdate + ` ` + meet.starttime + `<br> <a href="https://localhost:3000/meet/` + meet._id + `/` + meet.meetname + `">MeetLink</a><br> Regards <br>` + from.username
    }
    let mailDetails = {
      to: to.email,
      subject: meet.meetname,
      html: message
    };
  
    mailTransporter.sendMail(mailDetails, function(err, data) {
      if (err) {
        console.log(err);
      }
    });
  }

  module.exports = mail;