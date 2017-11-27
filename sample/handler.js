'use strict';

const logger = require('../index');
const axios=require('axios');
const handleError = (err, callback, loggParams) => {
  const body = { errorMessage: err.message } || err.body;
  logger.error(logger.errTransformer(err, loggParams.CorrelationId));

  callback(null, {
    statusCode: err.statusCode,
    body: JSON.stringify(body),
  });
};

 

const handleSuccess = (result, callback, loggParams) => {
  logger.endPoint(result, loggParams);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(result),
  });
};

const setupLogger = (event, context) => {
  if ((event.headers) && (event.headers['level'])) {
    process.env.LOGLEVEL = event.headers['level'];
    logger.updateLevel(process.env.LOGLEVEL);
  }
  else process.env.LOGLEVEL = 'info';
  return logger.entryPoint(event, context);
}

module.exports.Validation = (event, context, callback) => {
  let loggParams = setupLogger(event, context);
  let query = (event.body || event);
  query.CorrelationId = loggParams.CorrelationId;
  //You can run the function either with failour or sucess message in order to mock your lambda function
  Promise.resolve("Successfull Message")
  // Promise.reject(Error("Body of error","Error message",500))
  .then(result => handleSuccess(result, callback, loggParams))
  .catch(err => handleError(err, callback, loggParams));
};
 
 