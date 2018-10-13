var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var Schema = new mongoose.Schema({
    username: String,
    password: String,
    role: {type: String, required: true}
});

Schema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Staff", Schema);
