## Log in aws lambda with level,correlationId, execution time formatted as json

Not only you have access to all winstin library methods, but also you have some extra methods specific for AWS lambda function.
 
### How to install
 npm i log-winston-aws-level 

### How to use
in the AWS lambda handler import the logger as below:
```
const logger = require('log-winston-aws-level');
```
now you have access to all `winston` methods as well as a few more which are handy for `aws lambda`.

### How to format Error callback object
Basically when an error happens, the error object might have error message or stack error or status.
Having said that, it is good to have a transformer to format the error object as a json object.

```
try{
    method()
}
catch(err){
    let error = logger.errTransformer(err);
}
```
what would you get back is:
const error = {
        Body: (err.body) ? err.body.message : err.message,
        StackError: (err.stack) ? err.stack : '',
        Status: (err.statusCode) ? err.statusCode : '',
    }
and then the object would be transformed to a json.

### How to set the log level at runtime:
In fact the default log level is what we have in winstonn library so Error, info,... are priority. 
Debug is basically one of the least priority which means when you use `logger.debug` it wont log unless you change the priority. 
```
  logger.updateLevel('debug');
  logger.debug('the message just for debugging');
```
Now it works and `debug` level will log the messages. 
### How to pass the log level at runtime dynamically:
There are some ways to pass the `log level` such as pass it in path parameter, body or header.
```
module.exports.lambdaMethod = (event, context, callback) => {
 if ((event.headers) && (event.headers['level'])) {
    process.env.LOGLEVEL = event.headers['level'];
    logger.updateLevel(process.env.LOGLEVEL);
  }
  else process.env.LOGLEVEL = 'info';
```
lets say we want to log in debug level inside methods. So whenever you import the looger and really want to log in `debug` level you need to update the level. 
As an example is inside lambdaMethod we want to invoke another method called `validate` inside class called `identity` so we need to pass `CorrelationId` then we can keep track of all invokation for a specific request in the cloud watch. 
```
module.exports = class identity {
  constructor(Token, CorrelationId) {
    this.Token = Token;
    this.CorrelationId = CorrelationId
  }

  validate() {
    logger.updateLevel(process.env.LOGLEVEL);
    logger.debug(this.Token, this.CorrelationId);
```
so if you passed the `log level` at run time, in the entry point you would keep it in the process.env.LOGLEVEL. 
Consequently the next line which is logger.debug will be executed. 
Following this pattern, you can potentially log lots of details which are only usefull when you want to debug your code but you dont actually log these unnecessary detail in the normal situation.

### log handy detail in the lambda function entry point
By calling `entryPoint` method, we can catch some initial details like:
```
   CorrelationId,  Http,  FunctionName ,Path, Request,  Headers 
```
 What it returns is the `CorrelationId` as well as `start time`. We will use this value to calculate `Execution Time` when the function successfully finished.
```
   let loggParams = logger.entryPoint(event, context);
   const CorrelationId= loggParams.CorrelationId ;
   const Starthr= loggParams.Starthr;
   const Start=loggParams.Start;
```
### What should be logged when the function successfully finished
At this point we need to log `CorrelationIs`, `Executio time` and the `Response`. We can call it as per below:
```
 logger.endPoint(result, loggParams);
```
This will log more details like Body and Statud code. 

### Format the log message
In this library we only set up `console` as `transport` and format the logged message with the following format:
```
const formatter = options => {
    const timestamp = options.timestamp();
    let level = options.level.toUpperCase();

    const message = options.message || '';
    const metaPresent = options.meta && Object.keys(options.meta).length;
    const meta = metaPresent ? `\n\t${JSON.stringify(options.meta)}` : '';
    return `${timestamp} ${level} ${message} ${meta} `;
};
``` 
All the messages by default will pass through this `Format` method. 
