const express = require('express');
const router = express.Router();
const auth = require("../middleware/authentication");
const middleware = require("../middleware/librarian");
//LOGIN
router.post("/librarian/login", auth.authenticate, function (req, res) {
  res.redirect("/librarian/stationary");
});

router.get('/librarian/login', function (req, res) {
  return res.render('librarian/login');
});


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
//STAIONARY - ADD
router.get("/librarian/stationery/new", auth.isLoggedIn, function (req, res) {
  // res.render('librarian/Add_Item.ejs', {types : req.types});
  res.render('librarianViews/add_item');

});

router.post('/librarian/stationery', auth.isLoggedIn, middleware.addStationary, function (req, res) {

});

//STATIONERY - EDIT
router.get('/librarian/stationery/edit', auth.isLoggedIn, function (req, res) {
  res.render('librarianViews/edit_item');
});

router.put('/librarian/stationery/update', auth.isLoggedIn, middleware.updateStaionery, function (req, res) {

});


//STATIONERY - DESTROY
router.get('/librarian/stationery/destroy', auth.isLoggedIn, function (req, res) {
  res.render('librarianViews/remove_item');
});

router.delete('/librarian/stationery/delete', auth.isLoggedIn, middleware.deleteDependancy ,middleware.deleteStationery ,function (req, res) {
});


//STATIONERY - EDIT KNOW PARAMS
router.put('/librarian/stationary/:id', function (req, res) {
  res.send('connect');
});


//STATIONARY INDEX (VIEW ALL STATIONERIES)

router.get('/librarian/stationary',
 auth.isLoggedIn, //CHECK IF THIS USER IS LOGIN TO THE SYSTEM
middleware.loadStationary, //RUN MIDDLEWARE TO LOADING ALL STATIONARY AND ASSIGN VALUE TO REQ.ITEMS
(req, res) => {
  res.render('librarianViews/view_catalogue', { items: req.items}); //RENDER VIEWS WITH ASSIGN VALUE
});
//-----END------//


//RENDER SEARCH VIEW
router.get('/librarian/stationery/search', function (req, res) {
  res.render('librarianViews/search_item', { items: [] });
});

//PERFORM SEARCHING VIA STATIONERY NAME AND RESPONE BACK THE RESULT
router.post('/search', middleware.performSearch, function (req, res) {

});

//QUICK BORROW
router.get('/librarian/stationery/quick-borrow', function (req, res) {
  res.render('librarianViews/quickBorrow.ejs');
});

router.post('/librarian/quick-borrow', middleware.checkingCard, middleware.quickBorrow ,function (req, res) {
  req.flash('success', "Success");
  res.end();
  res.redirect('/librarian/stationery/quick-borrow');
});


//RESERVATE ONLINE
router.post('/librarian/online-reservate',  auth.isLoggedIn, middleware.reservationOnline ,function (req, res) {

});

//Quick Return
router.get('/librarian/stationery/quick-return', function (req, res) {
  req.flash('success','Success');
  res.render('librarianViews/quickReturn.ejs', { reservate: [] });
});

router.post('/librarian/stationery/quick-return/', middleware.getALLreservation, function (req, res) {

});

router.put('/librarian/stationery/quick-return', middleware.returnAllStaionary ,(req, res) =>{

});


//MY ACCOUNT
router.get('/account', auth.isLoggedIn,middleware.myReservation ,(req, res)=>{
  console.log(req.r);
  res.render('librarianViews/my_reservation', {reservate: req.r});
});

// register Librarian OUT OF SCOPE
// router.get('/librarian/register', function(req, res){
// //
//   var newLib = new Librarian({username: "10000000", role:"general"});
// Librarian.register(newLib, "password", function(err, student){
//     console.log(student);
// });
// //
// });


module.exports = router;
