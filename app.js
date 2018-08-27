var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require('method-override');
var publicDir = require('path').join(__dirname,'/assets');
var session = require("express-session");
var passport = require('passport');
var LocalStrategy = require('passport-local');

var flash = require('connect-flash');
//
var staffRouter = require('./routes/librarian');
var Staff = require('./models/staff');
//

app.set("view engine", "ejs");

mongoose.connect('mongodb://sepadmin:Hoilamcho1010@ds123562.mlab.com:23562/sep-database');

//set up routes
app.use(express.static(publicDir));
//SET UP NODE CONFIG
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());
//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "fawefawefawecwecwfasdfasafafssdfc!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Staff.authenticate()));
passport.serializeUser(Staff.serializeUser());
passport.deserializeUser(Staff.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});



app.get('/', function(req, res){
    res.render('landing');
});


app.use(staffRouter);

app.listen(3005, function(){
    console.log('Connect to SEP');
});
