var libMethod = {};
var postgre = require('../database/postgre');
var StationerySQL = require("../database/stationery");
var schema = new StationerySQL("stationary_id", "name", "availability", "quality", "quantity", "purchase_date", "description", "type_id", "picture");
var { promisify } = require('util');
var bcrypt = require('bcrypt');
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
  var sql = "SELECT * FROM stationary, type WHERE availability = TRUE AND type_type_id = type_id"
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

libMethod.reservationOnline = function (req, res, next) {
  var sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id) VALUES ($1, $2, $3)"
  var user = req.user._id;
  var items = req.body.items.split('\r\n');
  var checking = compressArray(items);
  items.forEach(function (item) {
    if (item && item.length > 0) {
      postgre.query(sql, [`${req.body.date}`, `${user}`, item], function (err, result) {
        if (err) { console.log(err.message) }
        else {
          updateQuantity(item);
        }
      });
    }
  });
  next();

}





libMethod.returnBorrow = function (req, res, next) {
  var sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id) VALUES (now(), $1, $2)"
  var user = req.id;
  var items = req.body.items.split('\r\n');
  var checking = compressArray(items);
  items.forEach(function (item) {
    if (item && item.length > 0) {
      postgre.query(sql, [`${user}`, item], function (err, result) {
        if (err) { console.log(err.message) }
        else {
          updateQuantity(item);
        }
      });
    }
  });
  next();
};

function updateQuantity(item) {
  let sql = "UPDATE stationary SET quantity = quantity - 1 WHERE stationary_id = $1";
  postgre.query(sql, [item]);
}

///////////////////
//CHECKING CARD STAFF
libMethod.checkingCard = function (req, res, next) {
  pullStaffId(req.body.card, function (err, result) {
    if (err) {
      req.flash("error", "Card id is incorrect, please contact UTS");
      return res.redirect('back');
    } if (result) {
      console.log(result);
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
        bcrypt.compare(card, id.card_data, (err, res) => {
          if (err) { callback(err) }
          else if (res) {
            callback(null, id);
          } else {
            callback(null, null);
          }
        })
      })
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
  var sql = "SELECT stationary_stationary_id, COUNT(*) , reservation_day FROM reservation WHERE staff_account_id = $1 AND is_returned = FALSE GROUP BY stationary_stationary_id, reservation_day HAVING COUNT(*) > 1 ORDER BY reservation_day"
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

  var date = req.body.date;
  var itemID = req.body.itemID;
  var card = req.body.cardReturn;
  var idcheck = req.body.idcheck;
  if (idcheck === itemID) {
    pullStaffId(card, (err, result) => {
      if (err) {
        req.flash("error", "Can't find staff with given card");
        return res.redirect('/librarian/stationery/quick-return');

      } else if (result) {
        updateStationaryQuickReturn(date, itemID, result.id, function (err, result) {
          if (err) {
            console.log(err);
            req.flash("error", "Incorrect given information");
          }
          else {
            req.flash("success", "Success");
          }
        });
        return res.redirect('/librarian/stationery/quick-return');
      } else {
        req.flash("error", "Error occur, please try again");
        return res.redirect('/librarian/stationery/quick-return');
      }
    });
  } else {
    req.flash("error", "id not match");
    return res.redirect('/librarian/stationery/quick-return');

  }
}




function updateStationaryQuickReturn(date, id, staff_id, callback) {
  var sql = "UPDATE reservation SET is_returned = TRUE WHERE reservation_day = $1 AND stationary_stationary_id = $2 AND staff_account_id = $3"
  postgre.query(sql, [`${date}`, id, staff_id], (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(result);
    }
  })
}



//put return to the database
function returnDatabase(req, res, next, items, callback) {
  items.forEach(function (item) {
    var sql = "INSERT INTO returned (return_day, staff_account_id, )"
    postgre.query(sql, [`${req.user._id}`, item], function (err, result) {
      if (err)
        callback(err);
      else
        callback(null, result);
    });
  });
}

//function to checking quantity of staitonary
function checkingQuantity(checking, callback) {
  var errchecking = new Array();
  checking.forEach(function (check) {
    var sql = "SELECT quantity FROM stationary WHERE stationary_id = $1"
    postgre.query(sql, [check.value], function (err, result) {
      console.log(result);
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
