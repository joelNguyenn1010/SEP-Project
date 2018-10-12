var libMethod = {};
var postgre = require('../database/postgre');
var StationerySQL = require("../database/stationery");
var schema = new StationerySQL("stationary_id", "name", "availability", "quality", "quantity", "purchase_date", "description", "type_id", "picture");
var { promisify } = require('util');
//GET ALL DATA FROM INPUT
libMethod.getStationary = function (req, res, next) {
  var id = req.body.id;
  var name = req.body.name;
  var quality = req.body.quality;
  var quantity = req.body.quantity;
  var description = req.body.description;
  var picture = req.body.picture;
  var type = req.body.type;

  if (name && quality && quantity && description && id && picture && type) {
    req.newItem = {
      id,
      name,
      quality,
      quantity,
      description,
      picture,
      type
    }

    return next();
  } else {
    req.flash('error', 'Something wrong with the stationary, please check your inpur or call UTS');
    return res.redirect('back');
    // return res.redirect('/librarian/stationery/new');
  }
}
//LOADING ALL TYPE FROM STATIONARY
libMethod.loadType = function (req, res, next) {
  var sql = "SELECT * FROM type ORDER BY name";

  postgre.query(sql, function (err, type) {
    if (err) {
      console.log(err);
      return res.status(500);
    } else {
      req.types = type.rows;
      next();
    }
  });
}

libMethod.loadStationary = function (req, res, next) {
  var sql = "SELECT * FROM stationary, type WHERE quantity > 0 AND type_type_id = type_id"
  postgre.query(sql, function (err, type) {
    if (err) {
      console.log(err);
      return res.status(500).render('error/500.ejs');
    } else {
      req.items = type.rows;
      next()
    }
  });
};


//SEARCHING ITEM
libMethod.getSearch = function (req, res, next) {

  var name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1);
  var searchID = "OR CAST(stationary_id AS text) LIKE '" + name + "%'";
  var searchDate = " OR CAST(purchase_date AS text) LIKE '%" + name + "%'";
  var sql = "SELECT * FROM stationary WHERE name LIKE '" + name + "%'" + searchID + searchDate;
  postgre.query(sql, function (err, result) {
    if (err) { console.log(err); }
    else if (result.rows.length > 0) {
      return res.render('librarianViews/search_item.ejs', { items: result.rows });
    } else {
      return res.render('librarianViews/search_item.ejs', { items: [] });
    }
  });
}
//reservate online
libMethod.reservationOnline = function (req, res, next) {
  var sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id, quantity) VALUES ($1, $2, $3, $4)"
  var user = req.user._id;
  var items = req.body.items;
  var quantity = parseInt(req.body.quantity);
 postgre.query(sql, [`${req.body.date}`, `${user}`, items, quantity], function (err, result) {
      if (err) { console.log(err.message) }
      else {
   
      }
    });

  updateQuantity(items, quantity);
  next();
}


//count duplicate when user input in quick borrow
function count(array_elements, callback) {
  var temp = [];
  array_elements.sort();
  var current = null;
  var cnt = 0;
  for (var i = 0; i < array_elements.length; i++) {
    if (array_elements[i] != current) {
      if (cnt > 0) {
        temp.push({
          current,
          cnt
        })
      }
      current = array_elements[i];
      cnt = 1;
    } else {
      cnt++;
    }
  }
  if (cnt > 0) {
    temp.push({
      current,
      cnt
    })
  }
  callback(temp);
}


libMethod.returnBorrow = function (req, res, next) {
  var sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id, quantity) VALUES (now(), $1, $2, $3)"
  var user = req.id;
  var items = req.body.items.split('\r\n');
  var checking = compressArray(items);
  count(items, (items) => {
    items.forEach((item) => {
      if (item.current && item.current.length > 0) {
        postgre.query(sql, [`${user}`, item.current, item.cnt], function (err, result) {
          if (err) { console.log(err.message) }
          else {
            updateQuantity(item.current, item.cnt);
          }
        });
      }

    })
  });
  next();

};

function updateQuantity(item, quantity) {
  let sql = "UPDATE stationary SET quantity = quantity - $1 WHERE stationary_id = $2";
  postgre.query(sql, [quantity, item]);
}

///////////////////
//CHECKING CARD STAFF
libMethod.checkingCard = function (req, res, next) {
  pullStaffId(req.body.card, function (err, result) {
    if (err) {
      req.flash("error", "Card id is incorrect, please contact UTS");
      return res.redirect('back');
    } if (result) {

      req.id = result.id;
      return next();
    } else {
      req.flash("error", "Card id is incorrect, please contact UTS");
      return res.redirect('/librarian/stationery/quick-borrow');
    }
  });
}


function pullStaffId(card, callback) {
  let sql = "SELECT * FROM staff_account";
  postgre.query(sql, (err, ids) => {
    if (err)
      console.log(err);
    else
      ids.rows.forEach((id) => {
        // bcrypt.compare(card, id.card_data, (err, res) => {
        //   if (err) { callback(err) }
        //   else if (res) {
        //     callback(null, id);
        //   } else {
        //     callback(null, null);
        //   }
        // })

        if(card == id.card_data) {
          console.log('here');
          console.log(id);
          callback(null, id);
          
        } else {
          callback(new Error);
        }
      })
  });
}

//VIEW MY RESERVATION
libMethod.myReservation = (req, res, next) => {

  var sql = "SELECT * FROM reservation WHERE staff_account_id = $1"
  postgre.query(sql, [`${req.user._id}`], (err, result)=>{
    if(err) {
      console.log(err)
      return res.render('error/500.ejs');
    } else {
   
      req.r = result.rows
      next();
    }
  });
}
////////////////////////////
//                        //
//      QUICK RETURN      //
//                        //
////////////////////////////

//get all reservation
libMethod.getALLreservation = function (req, res, next) {
  pullStaffId(req.body.card, (err, id) => {
    if (err) {
      console.log(err);
      req.flash('error', "Error occur, please try again later");
      return res.redirect('/librarian/stationery/quick-return');
    }
    else if (id) {
      findStaffReservation(id.id, (err, result) => {
        if (err) {
          console.log(err);
          req.flash('error', "Error occur, please try again later");
          return res.redirect('/librarian/stationery/quick-return');
        }
        else {

          return res.render('librarianViews/quickReturn.ejs', { reservate: result.rows });
        }
      });
    } else {
      req.flash('error', "Error occur, Can't find staff with given card");
      return res.redirect('/librarian/stationery/quick-return');
    }
  });
  // var items = req.body.items.split('\r\n');
  // var deleteBorrow = promisify(returnDatabase);
  // deleteBorrow(req, res, next, items)
  //   .then((value) => {
  //     console.log("Success");
  //     next();
  //   })
  //   .catch((err) => console.log(err));
}

//finding all reservation from one staff
function findStaffReservation(id, callback) {
  var sql = "SELECT * from reservation WHERE staff_account_id = $1 AND is_returned = FALSE"
  // var sql = "SELECT staff_account_id, stationary_stationary_id, COUNT(*) , reservation_day FROM reservation WHERE staff_account_id = $1 AND is_returned = FALSE GROUP BY staff_account_id, stationary_stationary_id, reservation_day HAVING COUNT(*) > 1 ORDER BY reservation_day"
  postgre.query(sql, [id], (err, result) => {
    callback(err, result);
  })
}

//CHECKING QUANTITY
libMethod.checkQty = function (req, res, next) {
  var items = req.body.items.split('\r\n');
  var checking = compressArray(items);
  var checkQty = promisify(checkingQuantity);
  checkQty(checking)
    .then((value) => {
      if (value && value.length > 0) {
        return res.render('librarianViews/search_item.ejs', { items: {} });
      } else {
        return next();
      }
    })
    .catch((err) => {
      req.flash('error', "Can't found the id of stationary");
      return res.redirect('back');
    }
    );
}

//RETURN ALL STATIONERIES
libMethod.returnAllStaionary = (req, res, next) => {

  var reservateId = req.body.reservate_id;
  var itemID = req.body.itemID;
  var card = req.body.cardReturn;
  
  var idcheck = req.body.idcheck;
  var userid = req.body.userid;
  if (idcheck === itemID) {

    updateStationaryQuickReturn(reservateId, function (err, result) {
      if (err) {
        console.log(err);
        req.flash("error", "Incorrect given information");
        return res.redirect('back');
      } else if (result) {
        returnDatabase(req, res, next);
  
      }
      else {
        returnDatabase(req, res, next);
        req.flash("success", "Success");
        return res.redirect('back');
      }
    });


  } else {
    req.flash("error", "id not match");
    return res.redirect('/librarian/stationery/quick-return');

  }
}




function updateStationaryQuickReturn(id, callback) {
  var sql = "UPDATE reservation SET is_returned = TRUE WHERE reservation_id = $1"
  postgre.query(sql, [id], (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  })
}



//put return to the database
function returnDatabase(req, res, next) {

  var sql = "UPDATE stationary SET quantity = quantity + $1 WHERE stationary_id = $2"
  postgre.query(sql, [req.body.quantity, req.body.idcheck], function (err, result) {
    if (err) {
      console.log(err);
    }
      
    else {
      console.log(result);
      req.flash('success', 'Done');
    return res.redirect('back');
    }
  });

}

//function to checking quantity of staitonary
function checkingQuantity(checking, callback) {
  var errchecking = new Array();
  checking.forEach(function (check) {
    var sql = "SELECT quantity FROM stationary WHERE stationary_id = $1"
    postgre.query(sql, [check.value], function (err, result) {

      if (err) {
        callback(err);
      } else if (result && result.rows.length > 0) {
        if (check.count <= 0 || check.count > result.rows[0].quantity) {
          callback(null, check.value);
        } else {
          callback(null, null);
        }
      } else {
        callback(new Error);
      }
    });
  });
}

function compressArray(original) {
  var compressed = [];
  var copy = original.slice();
  for (var i = 0; i < original.length; i++) {
    var myCount = 0;
    for (var w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        myCount++;
        delete copy[w];
      }
    }
    if (myCount > 0) {
      var a = {};
      a.value = original[i];
      a.count = myCount;
      compressed.push(a);
    }
  }
  return compressed;
}


module.exports = libMethod;
