# Welcome to lambda-SQL-event-Saver-With-SNS-DLQ-toleranace!

- We are getting a continuous stream of events and an AWS lambda function runs each item an event comes. The data of the event is in JSON format. We need to save this data in the MySQL database. 
- The rate of the events is variable and it is possible that we
may get a lot of events at one moment in time and no event at another. 
- Also, we have different environments and events of all the environments will come here, so you need to save it in the respective database.

#  Environment wise Events tracing:
- Each environment will run serverlessly the lambda functions which will save the events after basic validations to the specific regioned SQL table.

# Environment variables:

process.env.RDS_HOSTNAME,

process.env.RDS_USERNAME,

process.env.RDS_PASSWORD,

process.env.RDS_PORT,

process.env.RDS_REGION,

process.env.SNS_REGION

Good practise: The RDS_region and SNS_region are same.

# Basic Validations:

- Take care that the event data(payload) should be a valid JSON.
- Take care that you save valid event data(payload) to the specific regioned SQL Table. 

Good practise: If you receive events to be saved from some other environment or invalid event data, make it tracable via logs. Better debugging.

 # Table Schema:
 
Parent table columns:
 {
	  id, name 
}
Event table columns:
{ 
	id, name, parentId
}
Event JSON:
{
	name: String,
	parentId: Int,
	env: String
}

# SQL foreign key

- If the parent is not in the database, the event should not be added to the
database. The primary key of the parent Table  is parentId which is the foreign key of the another event table (of the Human Database).

# Concurrency

-   Concurrent Execution refers to the execution of number of function at a given time. By default the limit is 1000 across all function within a given region
-   AWS Lambda keeps 100 for the unreserved function
-   So, if there are 1000 then you can select from 900 and reserve concurrency for selected function and rest 100 is used for the unreserved function


#  DLQ -   

1. Failed Lambda is invoked twice by default and the event is discarded
-   DLQ instruct lamnda to send unprocessed events to AWS SQS or AWS SNS
-   DLQ helps you troubleshoot and examine the unprocessed request

Sample project for showing the ability to publish an SNS topic and trigger a function from the topic. Code is structured to create a crash/error when an invalid event comes, so the dead letter queue SNS topic gets published, in turn triggering the error handler function.This will logg the errored event, same as cloudwatch events traces helping you debug better.

2. Lambda Function here  to publish SNS topic is mapped  region wise.


## Publishing DLQ when invalid event

### Explanation

-   The  `init`  (hooked up to API Gateway),  takes a single  `event`  which it validates, upon success it publishes an SNS topic.
-   The SNS topic will trigger a second function called  `eventHandler`. This function will proceed saving the event and log out the result to the console. 
-   If either of the two functions fail the dead letter queue SNS topic will receive a message and trigger the  `error`  function which can be traced while debugging.

Every function will try to retry its execution upon failure a total of 3 times. Using the dead letter queue as a pool for our error logs is a smart use-case.


# Use AWS Lambda context object in Node.js for Better Debugging:
### callbackWaitsForEmptyEventLoop

The default value is  `true`. This property is useful only to modify the default behavior of the callback. By default, the callback will wait until the Node.js runtime event loop is empty before freezing the process and returning the results to the caller. You can set this property to false to request AWS Lambda to freeze the process soon after the callback is called, even if there are events in the event loop. AWS Lambda will freeze the process, any state data and the events in the Node.js event loop (any remaining events in the event loop processed when the Lambda function is called next and if AWS Lambda chooses to use the frozen process).

