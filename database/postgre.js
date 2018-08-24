var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:10102001@localhost:5436/sep-database';
var client = new pg.Client(connectionString);

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
		console.log("conect sep-postgresql");
  });


module.exports = client;
