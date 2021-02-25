const con = require('./DB/init');

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
