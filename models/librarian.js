var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var librarianSchema = new mongoose.Schema({
    username: String,
    password: String
});

librarianSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Librarian", librarianSchema);
