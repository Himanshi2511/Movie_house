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


  module.exports = isAuth;