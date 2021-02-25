/**
  Set to false to send the response right away when the callback runs,
  instead of waiting for the Node.js event loop to be empty. 
  If this is false, any outstanding events continue to run during the next invocation.
**/

exports.handler = async function(event, context) {
  console.log('Remaining time: ', context.getRemainingTimeInMillis())
  console.log('Function name: ', context.functionName)
  return context.logStreamName;
}
