const router = require("express").Router();
const User = require("../models/user");

router.post('/', (req, res) => {
    const spawn = require("child_process").spawn;
    const pythonProcess = spawn('python3',["../script.py", req.body.text]);
      pythonProcess.stdout.on('data', (data) => {
      console.log(data.toString())
      });
      pythonProcess.stderr.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        console.log(String.fromCharCode.apply(null, data));
      });
  
      pythonProcess.on('exit', (code) => {
        console.log("Process quit with code : " + code);
      });
  
      let user = User.findOne({
        _id: req.session.user,
      }, function(err, user) {
        if (user) {
          let hist = req.body.text;
          if (err) throw err;
           
            User.updateOne(
              { _id: req.session.user },
              { $set: { "history": req.body.text} });
  
              User.findByIdAndUpdate(req.session.user, 
                {
                   $set : {
                        history: hist,
                    }
                },
                (err, user) => {
                     if (err) console.log(err)
                   }
                );
            // console.log(user)
            res.render('search', {
              isAuth: req.session.isAuth,
              title: req.body.text
            });
        }
        else{
          // console.log("user.history");
         
          res.render('search', {
            isAuth: req.session.isAuth,
            title: req.body.text
          });
        }
      })
    
      req.session.error = '';
      
  })


  module.exports = router;
  