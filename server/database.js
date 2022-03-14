var mysql = require('mysql');


var conn = mysql.createConnection({  
  host: '104.155.135.157',  // Replace with your host name
  user: 'root',             // Replace with your database username
  password: 'geyuhao',      // Replace with your database password
  database: 'test'          // Replace with your database Name
}); 
 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;
