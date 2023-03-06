const cron = require('node-cron');
const Meet = require("../models/meet");
const Group = require("../models/group");
const User = require("../models/user");
const mail = require("./mail");


const corn_time = cron.schedule('*/1 * * * *', function() {
    let today = new Date()
    let todayOffset = today.getTimezoneOffset();
    let ISTOffset = 330;
    let ISTTime = new Date(today.getTime() + (ISTOffset + todayOffset) * 60000);
    today = ISTTime.getFullYear() + "-" + String(ISTTime.getMonth() + 1).padStart(2, '0') + "-" + String(ISTTime.getDate()).padStart(2, '0');
    let time = String(ISTTime.getHours()).padStart(2, '0') + ":" + String(ISTTime.getMinutes()).padStart(2, '0');
    console.log(today + " " + time);
    let meets = Meet.find({ //This finds every meet which are yet to begin and are not cancelled
      reminder: 0,
      status: 0
    }, function(err, meets) {
      if (err)
        return;
      meets.forEach(function(meet) {
        // For each meet we check if it's scheduled now, if yes we update
        // the reminder to 1 that means the meeting has begun and we remind all
        // members of that group about the meeting.
        if (today == meet.startdate && time == meet.starttime) {
          console.log('A');
          Meet.updateOne({
            _id: meet._id
          }, {
            $set: {
              reminder: 1
            }
          }, function(err, m) {
            Group.findOne({
              meets: meet._id
            }, function(err, group) {
              User.find({
                groups: group._id
              }, function(err, users) {
                users.forEach(function(user) {
                  mail('', user, meet, "reminder")
                })
              })
            })
          })
        }
      })
    });
  })
  

  module.exports = corn_time;