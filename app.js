const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const publicDir = require('path').join(__dirname,'/assets');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
//
const staffRouter = require('./routes/librarian');
const Staff = require('./models/staff');
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
   res.locals.session = req.session;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");


   next();
});

app.use(function(req, res, next){
//     globalMethod.checkingAvailability(req, res, next);

//     var today = new Date();
//     var dd =("0" + today.getDate()).slice(-2)
//     var mm =("0" + (today.getMonth() + 1)).slice(-2)
//     var yyyy = today.getFullYear();
// res.locals.currentDay = yyyy+"-"+mm+"-"+dd;

    next();
});
app.get('/', function(req, res){
    res.render('landing');
});
app.use(staffRouter);

module.exports = app;
// app.listen(3607, function(){
//     console.log('Connect to SEP');
// });
