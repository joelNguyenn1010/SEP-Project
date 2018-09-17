var libMethod = {};
var postgre = require('../database/postgre');
var StationerySQL = require("../database/stationery");
var schema = new StationerySQL("stationary_id" ,"name", "availability", "quality", "quantity", "purchase_date", "description", "type_id", "picture");

libMethod.getStationary = function(req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var quality = req.body.quality;
    var quantity = req.body.quantity;
    var description = req.body.description;
    var picture = req.body.picture;
    var type = req.body.type;


    if(name && quality && quantity && description && id && picture && type) {
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

libMethod.loadType = function(req, res, next) {
  var sql = "SELECT * FROM type ORDER BY name";

  postgre.query(sql, function(err, type){
    if(err) {
      console.log(err);
      return res.status(500);
    } else {
      req.types = type.rows;
      next();
    }
  });
}

libMethod.loadStationary = function(req, res, next) {
  var sql = "SELECT * FROM stationary, type WHERE availability = TRUE AND type_type_id = type_id"
  postgre.query(sql, function(err, type){
    if(err) {
      console.log(err);
      return res.status(500).send('Something wrong with loading stationary, please contact 0423795821');
    } else {
        req.items = type.rows;
        next()
    }
  });
};

module.exports = libMethod;
