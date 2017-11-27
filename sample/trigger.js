'use strict';

const handler = require('./handler');
const Mockevent={
    "resource": "/",
    "path": "/",
    "httpMethod": "POST",
    "body": {
        "Param1": "1",
        "Param2": "2",
    }
};

const Mockcontext={
    "awsRequestId": "Abc123",
     "functionName": "Validation-function",
};

 
handler.Validation(Mockevent,Mockcontext,(error, result) => { console.log('End Function')});