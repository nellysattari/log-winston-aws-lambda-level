'use strict';

const handler = require('./handler');
const Mockevent = {
    "resource": "/",
    "path": "/",
    "httpMethod": "POST",
    "body": {
        "Param1": "1",
        "Param2": "2",
    }
};

const Mockcontext = {
    "awsRequestId": "Abc123",
    "functionName": "Validation-function",
};

//You can run the function either with failour or sucess message in order to mock your lambda function
// handler.ValidationSucees(Mockevent,Mockcontext,(error, result) => { console.log('End Function')});
handler.ValidationFail(Mockevent,Mockcontext,(error, result) => { console.log('End Function')});
  