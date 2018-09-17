var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://adminSEP:Hoilamcho1010@sep-database.czb5slzfm4vs.ap-southeast-2.rds.amazonaws.com:5432/adminSEP';


var client = new pg.Client(connectionString);

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
		console.log("conect sep-postgresql");
  });


module.exports = client;
