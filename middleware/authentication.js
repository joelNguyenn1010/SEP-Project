var passport = require("passport");
var auth = {};
auth.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in as librarian");
    res.redirect("/librarian/login");
}

auth.authenticate = function(req, res, next) {
      passport.authenticate('local', function(err, user, info) {
      if(err){
          req.flash('error', err.message);
          return res.redirect('/librarian/login');
      } if(!user) {
          req.flash("error", "Username or password is incorrect");
          return res.redirect("/librarian/login");
      }
      req.logIn(user, function(err) {
          if(err){
              req.flash('error', err.message);
                return res.redirect('/librarian/login');
          }
          next();
      });
  })(req,res,next);
};

module.exports = auth;
