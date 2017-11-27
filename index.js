
'use strict';

const winston = require('winston');
const moment = require('moment');
let logLevel = 'info';

const entryPoint = (event, context) => {

  let params = {
    CorrelationId: (context) ? context.awsRequestId : "111",
    Http: (event.method) ? event.method.toUpperCase() : "",
    FunctionName: (context) ? context.functionName : "",
    Path: (event.path) ? event.path : "",
    Request: (event.body) ? event.body : "",
    Headers: (event.headers) ? event.headers : "",
  };
  const briefedParams = { CorrelationId: params.CorrelationId, Starthr: process.hrtime() };
  winstonLogger.info(params);
  return briefedParams;
}



const endPoint = (response, loggParams) => {
  var executionTimehr = process.hrtime(loggParams.Starthr);
  const nanoseconds = (executionTimehr[0] * 1e9) + executionTimehr[1];
  const milliseconds = nanoseconds / 1e6;
  const seconds = nanoseconds / 1e9;

  let params = {
    CorrelationId: loggParams.CorrelationId,
    Duration: `${seconds} sec `,
  };
  if (response.Errors) {
    params.StatusCode = 500;
    params.Body = response.Errors;
  }
  else {
    params.StatusCode = 200;
    params.Body = response;
  }
  winstonLogger.info(params);
  return params;
}



const updateLevel = (level) => {
    winstonLogger.transports.console.level = level.toLowerCase();
}


const currentLevel = function(){
   return winstonLogger.transports.console.level;
}

const formatter = options => {
    const timestamp = options.timestamp();
    let level = options.level.toUpperCase();

    const message = options.message || '';
    const metaPresent = options.meta && Object.keys(options.meta).length;
    const meta = metaPresent ? `\n\t${JSON.stringify(options.meta)}` : '';
    return `${timestamp} ${level} ${message} ${meta} `;

};

const transportConsole = new (winston.transports.Console)({
    level: logLevel,
    timestamp: () => `[${moment().toISOString()}]`,
    name: 'console',
    formatter,
});

const winstonLogger = new (winston.Logger)({
    transports: [transportConsole],
});

winstonLogger.currentLevel=()=>{
    return currentLevel();
}

winstonLogger.entryPoint = (event, loggParams) => {
    return entryPoint(event, loggParams);
};

winstonLogger.endPoint = (response, loggParams) => {
    return endPoint(response, loggParams);
};


winstonLogger.updateLevel = (level) => {
    if (level)
        return updateLevel(level);
}

winstonLogger.errTransformer = (err, CorrelationId) => {
  if (err) {
    const error = {
      Body: (err.body) ? err.body.message : err.message,
      StackError: (err.stack) ? err.stack : '',
      Status: (err.statusCode) ? err.statusCode : '',
      CorrelationId: (CorrelationId) ? CorrelationId : '',
    }
    return JSON.stringify(error);
  }
  else {
    return err;
  }
};


module.exports = winstonLogger;
