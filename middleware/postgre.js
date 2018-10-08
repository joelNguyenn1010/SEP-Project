var globalMethod = {};
var postgre = require('../database/postgre');
var StationerySQL = require("../database/stationery");
var schema = new StationerySQL("stationary_id" ,"name", "availability", "quality", "quantity", "purchase_date", "description", "type_id", "picture");
var { promisify } = require('util');


globalMethod.checkingAvailability = function(req, res, next) {
    var performChecking = promisify(performCheckingAvailable);
    performChecking()
    .then((result) => {
        updateAvailability(result);
    })
    .catch((err) => console.log(err));
}

function performCheckingAvailable(callback) {
    var sql = "SELECT * FROM stationary WHERE quantity = 0"
    postgre.query(sql, function(err, result){
        if(err) {
            callback(err);
        } else {
            callback(null, result.rows);
        }
    });
}

function updateAvailability(items) {
    var sql = "UPDATE stationary SET availability = false WHERE stationary_id = $1"
    items.forEach(function(item){

        postgre.query(sql, [item.stationary_id] ,function(err, result){
            if(err) {
                console.log(err);
            } else {
                
            }
        });

    });

}

module.exports = globalMethod;