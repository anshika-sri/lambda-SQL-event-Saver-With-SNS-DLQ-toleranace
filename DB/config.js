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


//lambda function 'save event to SQL Table'
exports.handler = (event, context, callback) => {
    /**
     * allow the freezing of connections and 
     * will prevent Lambda from hanging on open connections
     */
    context.callbackWaitsForEmptyEventLoop = false;

    var sql = `INSERT INTO Event VALUES (uuid(), ${event.name}, ${event.env})`;

    con
    .query(sql, (err, res) => {
        /**
         * If the event from the streams does not corresponds to process.env.RDS_REGION,
         * then we will not save the Event.
         */
        if(event.env !== process.env.RDS_REGION) {
            err = true;
        }

        if (err) {
            /**
             * This will receive the error object.
             * Additional logging will help debugging.
             */
            console.log(`The insertion operation rollbacked. Err. ${err}`)
            return con.rollback(function(err) {
                throw err;
            });
        }

        con.commit(function(err) {
        if (err) {
          return con.rollback(function() {
            throw err;
          });
        }
        console.log('success!');

        callback(null, '1 records inserted.');
        })
    }
  };

  /**
   * Cleanup via graceful termination.
   */
  con.quit();
