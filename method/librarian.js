var libraMethod = {};
var postgre = require('../database/postgre');

libraMethod.addStationary = function(id, name, quality, quantity, description, type_id, picture, res, req) {
  var sql = 'INSERT INTO stationary (stationary_id, name, availability, quality, quantity, purchase_date, desciption, type_id, picture) VALUES ($1, $2, TRUE, $3, $4, now(), $5, $6, $7)'
  postgre.query(sql, [id, name, quality, quantity, description, type_id, picture], function(err, newItem){
    if(err) {
      console.log(err);
      req.flash("error", "Error occur, please check you input");
      return res.redirect('/librarian/stationery/new');
    } else {
      req.flash("success", "New Stationary has been added to the database");
      res.redirect('/librarian/stationery/new');
    }
  });
}

libraMethod.deleteStationery = function(id, req, res) {
  var sql = "DELETE FROM stationary WHERE stationary_id = $1"
  postgre.query(sql, [id], function(err, success){
    if(err) {
      req.flash("error", err.message);
    } else if(success.rowCount === 0){
      req.flash("error", "Can't find the ID in the data, please try again")
    } else {
      req.flash("success", "Item has been removed");
    }
    res.redirect('/librarian/stationery/destroy');
  });
}

module.exports = libraMethod;
