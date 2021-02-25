var mysql = require('mysql');

var con = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  region   : process.env.RDS_REGION 
  //configuration setting without the need to change the lambda function
});


exports.handler = async () => {
  con.query('CREATE DATABASE Person', function (err, result) {
    if (err) throw err;
    console.log('Database created');
  });
  return 'Database Created'
};

exports.handler = async () => {
    var sql = `CREATE TABLE Parent (
                    parentId    INTEGER, 
                    name  TEXT
                    PRIMARY KEY (parentId),
                );`
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log('Table created');
    });
    return 'Table Created'
  };

exports.handler = async (event) => {
    var sql = `CREATE TABLE Event (
                    id    INTEGER, 
                    name  TEXT,
                    parentId INTEGER,
                    PRIMARY KEY (parentId),
                    FOREIGN KEY (id) REFERENCES Parent(parentId)
                );`
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log('Table created');
    });
    return 'Table Created'
};
