//import mysql2/promise so that under the hood, all queries will yield a 
const mysql = require('mysql2/promise');

//create pool takes js object:
//
const pool = mysql.createPool({
    host: 'localhost',
database: 'blog',
user: 'root',
password: '87111Sajh$'
});

module.exports = pool;