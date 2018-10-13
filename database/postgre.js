const pg = require('pg');
// var connectionString = process.env.DATABASE_URL || 'postgres://hqjocokp:o2vcQUi4rddw8J1Ac1ixjZC2SapXRwyj@horton.elephantsql.com:5432/hqjocokp';

const connectionString = require('../config.json').postgreSQL;
const client = new pg.Client(connectionString);

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
		console.log("conect sep-postgresql");
  });


module.exports = client;
