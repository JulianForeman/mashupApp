const mysql = require('mysql');

const connection = mysql.createConnection(
        {
        // database connection details
        host: '127.0.0.1',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'Mashup'
        });

connection.connect();

module.exports = connection;
