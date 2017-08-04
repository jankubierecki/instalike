var mysql = require('mysql');

module.exports = mysql.createPool({
    connectionLimit : 30,
    host : 'localhost',
    user : 'root',
    database : 'instalike'
});

