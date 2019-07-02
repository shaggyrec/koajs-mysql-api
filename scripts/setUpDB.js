const mysql = require('mysql2');
const { sqlConnection } = require('../settings');
const { exec } = require('child_process');


let con = mysql.createConnection({
    host: sqlConnection.host,
    user: sqlConnection.user,
    password: sqlConnection.password
});

con.connect(err =>  {
    if (err) throw err;
    console.log('Connected!');
    con.query('CREATE DATABASE IF NOT EXISTS ' + sqlConnection.database, function (err, result) {
        if (err) throw err;
        console.log('Database created');
        con.end();

        con = mysql.createConnection(sqlConnection);
        console.log('Create data');
        exec(
            `mysql -u ${sqlConnection.user} -p${sqlConnection.password} ${sqlConnection.database} < ` + __dirname + '/fixture.sql',
            (err) => {
                if(err) {
                    throw err;
                }
                console.log('Data created');
                con.end();
            }
        );
    });
});
