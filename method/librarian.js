var libraMethod = {};
var postgre = require('../database/postgre');
var StationerySQL = require("../database/stationery");
var schema = new StationerySQL("stationary_id" ,"name", "availability", "quality", "quantity", "purchase_date", "description", "type_type_id", "picture");


libraMethod.addStationary = function(id, name, quality, quantity, description, type_id, picture, res, req) {
  var sql = `INSERT INTO stationary (${schema.id}, ${schema.name}, ${schema.availability}, ${schema.quality}, ${schema.quantity}, ${schema.purchase_date}, ${schema.description}, ${schema.type_id}, ${schema.picture}) VALUES ($1, $2, TRUE, $3, $4, now(), $5, $6, $7)`
  postgre.query(sql, [id, name, quality, quantity, description, type_id, picture], function(err, newItem){
    if(err) {
      console.log(err);
      req.flash("error", `${err.message}, please contact UTS`);
    } else {
      req.flash("success", "New Stationary has been added to the database");
    }
    res.redirect('back');
  });
};

libraMethod.deleteStationery = function(id, req, res) {
  var sql = `DELETE FROM stationary WHERE ${schema.id} = $1`
  postgre.query(sql, [id], function(err, success){
    if(err) {
      req.flash("error", err.message);
    } else if(success.rowCount === 0){
      req.flash("error", "Can't find the ID in the data, please try again")
    } else {
      req.flash("success", "Item has been removed");
    }
    res.redirect('back');
  });
};

libraMethod.updateStaionery = function(id, name, quality, quantity, description, type_id, picture, res, req) {
  var sql = `UPDATE stationary SET ${schema.name} = $1, ${schema.quality} = $2, ${schema.quantity} = $3, ${schema.description} = $4, ${schema.type_id} = $5, ${schema.picture} = $6 WHERE ${schema.id} = $7`
  postgre.query(sql, [name, quality, quantity, description, type_id, picture, id], function(err, updated){
    if(err) {
      console.log(err);
      req.flash("error", err.message);
    } else if(updated.rowCount === 0){
      req.flash("error", "Can't find the ID in the data, please try again");
    } else {
      req.flash("success", "Item has been updated");
    }
    res.redirect('back');
  });
};

module.exports = libraMethod;
