'use strict'

const aws = require('aws-sdk')
const sns = new aws.SNS({ region: process.env.SNS_REGION })

function generateResponse (code, payload) {
  console.log(payload)
  return {
    statusCode: code,
    body: JSON.stringify(payload)
  }
}

function generateError (code, err) {
  console.error(err)
  return generateResponse(code, {
    message: err.message
  })
}

async function publishSnsTopic (data) {
  const params = {
    Message: JSON.stringify(data),
    TopicArn: `arn:aws:sns:${process.env.region}:${process.env.accountId}:calculate-topic`
  }
  return sns.publish(params).promise()
}

//lambda function to 'calculate topic'
module.exports.handler = async (event) => {
  const data = JSON.parse(event.body)
  if (typeof event !== 'object') {
    return generateError(400, new Error('Invalid event received.'))
  }

  if (!event.id || !event.parentId || !event.name) {
    return generateError(400, new Error('Missing event data.'))
  }

  try {
      /**
       * 
       * ability to publish an SNS topic and trigger a function from the topic
       * 
       * dead letter queue SNS topic gets published,
       * in turn triggering the error handler function.
       */
    const metadata = await publishSnsTopic(data)
    return generateResponse(200, {
      message: 'Successfully processed the event.',
      data: metadata
    })
  } catch (err) {
    return generateError(500, new Error('Couldn\'t processed the event due an internal error. Please try again later.'))
  }
}
