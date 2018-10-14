const libMethod = {};
const postgre = require('../database/postgre');
const { promisify } = require('util');
//ADD NEW STATIONARY TO DATABASE (NEW)
libMethod.addStationary = function (req, res, next) {
  const sql = `INSERT INTO stationary (stationary_id, name, availability, purchase_date, picture) VALUES ($1, $2, TRUE, now(), $3)`
  postgre.query(sql, [req.body.id, req.body.name, req.body.picture], function (err, newItem) {
    if (err) {
      console.log(err);
      req.flash("error", `${err.message}, please contact UTS`);
    } else {
      req.flash("success", "New Stationary has been added to the database");
    }
    res.redirect('back');
  });
}

//EDIT AND UPDATE STATIONARY (EDIT)
libMethod.updateStaionery = function (req, res, next) {
  const sql = `UPDATE stationary SET name = $1, picture = $2 WHERE stationary_id = $3`
  postgre.query(sql, [req.body.name, req.body.picture, req.body.id], function (err, updated) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
    } else if (updated.rowCount === 0) {
      req.flash("error", "Can't find the ID in the data, please try again");
    } else {
      req.flash("success", "Item has been updated");
    }
    res.redirect('back');
  });
};

//DELETE STATIONARY
libMethod.deleteDependancy = (req, res, next) => {
  const sql = `DELETE FROM reservation WHERE stationary_stationary_id = $1`
  postgre.query(sql, [req.body.id], (err, result) => {
    if (err) {
      res.end()
      req.flash('error', "Error occur when delete, please try to contact UTS support")
      return res.redirect('back');
    } else {
      next();
    }
  })
}

libMethod.deleteStationery = (req, res, next) => {
  const sql = `DELETE FROM stationary WHERE stationary_id = $1`
  postgre.query(sql, [req.body.id], function (err, success) {
    if (err) {
      req.flash("error", err.message);
    } else if (success.rowCount === 0) {
      req.flash("error", "Can't find the ID in the data, please try again")
    } else {
      req.flash("success", "Item has been removed");
    }
    return res.redirect('/librarian/stationery/destroy');
  });
}

//LOADING ALL TYPE FROM STATIONARY (INDEX)
libMethod.loadType = function (req, res, next) {
  const sql = "SELECT * FROM type ORDER BY name";

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

//LOADING ALL STATIONARY FROM DATABASE TO VIEW IN INDEX
libMethod.loadStationary = function (req, res, next) {
  const sql = "SELECT * FROM stationary WHERE availability = TRUE"
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

function grapType(name, callback) {
  const sql = `SELECT type_id FROM type WHERE lower(name) LIKE '%${name}%'`
  postgre.query(sql, (err, result) => {
    if (result) {
      callback(result.rows[0]);
    } else {
      callback(name);
    }
  })
}

//SEARCHING ITEM
libMethod.performSearch =  function (req, res, next) {

  const name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1);//REQUEST USER INPUT
  const searchID = "OR CAST(stationary_id AS text) LIKE '" + name + "%'"; //PERFORM QUERY WITH STATIONARY ID

  const sql = "SELECT * FROM stationary WHERE name LIKE '%" + name + "%'" + searchID; //PERFORM QUERY SEARCH WITH TYPE
   postgre.query(sql, function (err, result) {
    if (err) { console.log(err); }
    else if (result.rows.length > 0) {
      return res.render('librarianViews/search_item.ejs', { items: result.rows });
    } else {
      return res.render('librarianViews/search_item.ejs', { items: [] });
    }
  });
}

//RESERVATE ONLINE
libMethod.reservationOnline = function (req, res, next) {
  const sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id, is_returned) VALUES (now(), $1, $2, false)"
  const items = req.body.items;
  const user = req.user._id;
  console.log(items);
  postgre.query(sql, [`${user}`, items], function (err, result) {
    if (err) {
      console.log(err)
      req.flash('error', "ID is incorrect, please try again");
      return res.redirect('back');
    }
    else if (result) {
      req.flash('success', "Item has been reserved");
      updateQuantity(items);
      return res.redirect('back');
    } else {
      req.flash('error', "Error occur, please try again");
      return res.redirect('back');
    }
  });

}


libMethod.checkingItemID = (req, res, next) => {
  const sql = "SELECT * FROM stationary WHERE stationary_id = $1"
  postgre.query(sql, [req.body.items], (err, result) => {
    if (err) {
      res.end();
      req.flash('error', "There is error occur, please contact UTS");
      return res.redirect('/librarian/stationary');
    } else if (result.rows.length > 0) {
      return next();
    } else {
      res.end();
      req.flash('error', "The ID is not match, please try again");
      return res.redirect('/librarian/stationary');
    }
  });
}

//count duplicate when user input in quick borrow
function count(array_elements, callback) {
  let temp = [];
  array_elements.sort();
  let current = null;
  let cnt = 0;
  for (let i = 0; i < array_elements.length; i++) {
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

libMethod.quickBorrow = function (req, res, next) {
  const sql = "INSERT INTO reservation (reservation_day, staff_account_id, stationary_stationary_id, quantity) VALUES (now(), $1, $2, $3)"
  const user = req.id;
  var items = req.body.items.split('\r\n');
  var checking = compressArray(items);
  count(items, (items) => {
    items.forEach((item) => {
      if (item.current && item.current.length > 0) {
        postgre.query(sql, [`${user}`, item.current, item.cnt], function (err, result) {
          if (err) { console.log(err.message) }
          else {
            updateQuantity(item.current);
          }
        });
      }

    })
  });
  req.flash('success', "Success");
  return res.redirect('/librarian/stationery/quick-borrow');

};

function updateQuantity(item) {
  const sql = "UPDATE stationary SET availability = FALSE WHERE stationary_id = $1";
  postgre.query(sql, [item]);
}

///////////////////
//CHECKING CARD STAFF
libMethod.checkingCard = function (req, res, next) {
  pullStaffId(req.body.card, function (err, result) {
    if (err) {
      req.flash("error", "Card id is incorrect, please contact UTS");
      res.end();
      return res.redirect('/librarian/stationery/quick-borrow');
    } if (result) {

      req.id = result.id;
      return next();
    }
    else {
      // console.log("here");
      req.flash("error", "Card id is incorrect, please contact UTS");
      res.end();
      return res.redirect('/librarian/stationery/quick-borrow');
    }
  });
}


function pullStaffId(card, callback) {
  const sql = "SELECT * FROM staff_account WHERE card_data = $1"
  postgre.query(sql, [card], (err, ids) => {
    if (err) {
      callback(err);
    } else if (ids && ids.rows.length > 0) {

      callback(null, ids.rows[0]);
    } else {
      callback(new Error);
    }
  })
}

//VIEW MY RESERVATION
libMethod.myReservation = (req, res, next) => {
  const sql = "SELECT * FROM reservation, stationary WHERE stationary.stationary_id = reservation.stationary_stationary_id AND staff_account_id = $1"
  postgre.query(sql, [`${req.user._id}`], (err, result) => {
    if (err) {
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
    console.log(err);
    if (err) {
      req.flash('error', "Error occur, Card is not valid");
      res.end();
      res.redirect('/librarian/stationery/quick-return');
    } else if (id) {
      findStaffReservation(id.id, (err, result) => {
        if (err) {
          // console.log(err);
          req.flash('error', "Error occur, please try again later!");
          return res.render('error/500.ejs');
        }
        else {

          return res.render('librarianViews/quickReturn.ejs', { reservate: result.rows });
        }
      });
    } else {
      req.flash('error', "Error occur, Can't find staff with given card");
      return res.render('error/500.ejs');
    }
  });
}

//finding all reservation from one staff
 function findStaffReservation(id, callback) {
  const sql = "SELECT * from reservation WHERE staff_account_id = $1 AND is_returned = FALSE"
  postgre.query(sql, [id], (err, result) => {
    callback(err, result);
  })
}

//CHECKING QUANTITY
//need to double check
libMethod.checkAvailability =  function (req, res, next) {
  const items = req.body.items.split('\r\n');
  const checking = compressArray(items);
  const temp = [];
  console.log(checking);
  req.temp = [];
  const sql = "SELECT * FROM stationary WHERE availability = FALSE"
  checking.forEach((i) => {
    postgre.query(sql, [i.value], (err, result) => {
      if (err) { console.log(err) }
      else if (result.rowCount > 0) {

        temp.push("false");
      }
    })
  });
   determindeRedirect(temp, res, next);
}

function determindeRedirect(temp, id, res ,next) {
  console.log(temp);
  if(temp.includes("false")) {
    return next();
  } else {
    req.flash('error', "e");
    return res.redirect("/librarian/stationery/quick-borrow");

  }
}

//RETURN ALL STATIONERIES
libMethod.returnAllStaionary = (req, res, next) => {

  const reservateId = req.body.reservate_id;
  const itemID = req.body.itemID;
  const card = req.body.cardReturn;

  const idcheck = req.body.idcheck;
  const userid = req.body.userid;
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
    req.flash("error", "ID is not match");
    return res.redirect('/librarian/stationery/quick-return');

  }
}




function updateStationaryQuickReturn(id, callback) {
  const sql = "UPDATE reservation SET is_returned = TRUE WHERE reservation_id = $1"
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
  const sql = "UPDATE stationary SET availability = TRUE WHERE stationary_id = $1"
  postgre.query(sql, [req.body.idcheck], function (err, result) {
    if (err) {
      console.log(err);
    }
    else {
      req.flash('success', 'Done');
      return res.redirect('back');
    }
  });
}

function compressArray(original) {
  let compressed = [];
  let copy = original.slice();
  for (let i = 0; i < original.length; i++) {
    let myCount = 0;
    for (let w = 0; w < copy.length; w++) {
      if (original[i] == copy[w]) {
        myCount++;
        delete copy[w];
      }
    }
    if (myCount > 0) {
      let a = {};
      a.value = original[i];
      a.count = myCount;
      compressed.push(a);
    }
  }
  return compressed;
}


module.exports = libMethod;
