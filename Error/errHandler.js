'use strict'


//lambda function to 'logg error'(eg. cloudwatch errored events)
module.exports.handler = async (event) => {
  console.error(event)
}
