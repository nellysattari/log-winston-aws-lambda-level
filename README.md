##  Supports CorrelationId, Dynamic log level at runtime, json formatted result 

Not only you have access to all Winston library methods, but also you have some extra methods specific for AWS lambda function.
 
### How to install
 npm i log-winston-aws-level 

### How to use
in the AWS lambda handler import the logger as below:
```
const logger = require('log-winston-aws-level');
```
now you have access to all `winston` methods as well as a few more which are handy for `aws lambda`.

### log handy details in the lambda function entry point
By calling `entryPoint` method, we can catch some initial details like:
```
   CorrelationId,  Http,  FunctionName ,Path, Request,  Headers 
```
 What it returns is the `CorrelationId` as well as `start time`. We will use this value to calculate `Duration Time` when the function successfully finished.
```
   let loggParams = logger.entryPoint(event, context);
   const CorrelationId= loggParams.CorrelationId;
```
You need to pass this CorrelationId somehow to all the methods you need to relate it with your lambda function. 

### What should be logged when the function successfully finished
At this point we need to log `CorrelationId`, `Duration time` and the `Response`. We can call it as per below:
```
 logger.endPoint(result, logParams);
```
This will log more details like Body and Status code. 

### Format the log message 
In this library, we only set up `console` as `transport` and format the logged message with the following format:
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
All the log methods by default will pass through this `Format` method. Even direct methods of Winston like `logger.info(params)` and so on. 

### How to format Error callback object
Basically when an error happens, the error object might have error message, stack error, status or CorrelationId.
Having said that, it is good to have a transformer to format the error object as a json object.

```
try{
    method()
}
catch(err){
    let error = logger.errTransformer(err,CorrelationId);
}
```
This method also supports complex objects and resolves the issue of `typeerror converting circular structure to json`.

and then the object would be transformed to a json.

### How to set the log level at runtime:
In fact the default log level is what we have in Winston library so Error, info,... are priority. 
Debug is basically one of the least priority which means when you use `logger.debug` it won’t log unless you change the priority. 
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
let’s say we want to log in debug level inside methods. So whenever you import the logger and really want to log in `debug` level you need to update the level. 
As an example is inside lambda Method we want to invoke another method called `validate` which is inthe `identity` class, so we need to pass `CorrelationId` then we can keep track of all invocation for a specific request in the cloud watch. 
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
Following this pattern, you can potentially log lots of details which are only useful when you want to debug your code but you don’t actually log these unnecessary detail in the normal situation.

## Sample
Inside `sample` folder, you can see 2 files which are kind of aws lambda functions mock. 
You have a handler method which is really the first entry point of your function. You also have a `trigger` file (mocking API gateway) including mocked `event` and `context` and `callback` methods and makes a call to handler. 