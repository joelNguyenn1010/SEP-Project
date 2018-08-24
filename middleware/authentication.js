var passport = require("passport");
var auth = {};
auth.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    // req.flash("error", "You need to be logged in to do that");
    res.redirect("/student/login");
}

auth.authenticate = function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
      if(err){
          req.flash('error', err.message);
          return res.redirect('/student/login');
      } if(!user) {
          req.flash("error", "Username or password is incorrect");
          return res.redirect("/student/login");
      }
      req.logIn(user, function(err) {
          if(err){
              req.flash('error', err.message);
                return res.redirect('/student/login');
          }
          next();
      });
  })(req,res,next);
};

module.exports = auth;
