var assert = require("assert");
var logger = require('./index');

describe('Logger', function(){
    describe('default log level()', function(){
        it('should return info', function(){
            assert.equal(logger.currentLevel(), 'info')
        });

        it('should set log level to debug', function(){
            logger.updateLevel('debug');
            assert.equal(logger.currentLevel(), 'debug');
        });

        it('should set log level to warn', function(){
            logger.updateLevel('warn');
           assert.equal(logger.currentLevel(), 'warn')
         });

        it('should not log below debug level', function(){
             logger.updateLevel('info');
             assert.equal(undefined, logger.log('debug', 'debug log'));
        });

       

        it('should log entryPoint and return CorrelationId', function(){
            let Mockevent={ 
                 body : { param1:'xxx'} ,
            }

            let Mockcontext={
                awsRequestId : "10000",
                functionName : "func test",     
            }
             var params= logger.entryPoint(Mockevent, Mockcontext);
             assert.equal(params.CorrelationId, Mockcontext.awsRequestId);
        });

          it('should log entryPoint and return CorrelationId', function(){
            let Mockevent={ 
                 body : { param1:'xxx'} ,
            }

            let Mockcontext={
                awsRequestId : "10000",
                functionName : "func test",     
            }
             var params= logger.entryPoint(Mockevent, Mockcontext);
             assert.equal(params.CorrelationId, Mockcontext.awsRequestId);

        });
         it('should log entryPoint and return starthr', function(){
            let Mockevent={ 
                 body : { param1:'xxx'} ,
            }

            let Mockcontext={
                awsRequestId : "10000",
                functionName : "func test",     
            }
             var params= logger.entryPoint(Mockevent, Mockcontext);
             assert.ok(params.Starthr,"include start time");

        });

 it.skip('should log endPoint and return executionTime', function(){
            let Mockresult={ 
                 body : "Response" ,
            }

            let MockloggParams={
               CorrelationId:"1111",
               Starthr: process.hrtime(),
               Start: new Date().getTime() 
            }

              logger.endPoint(Mockresult, MockloggParams);

        });

 it('should format error object return json with Body property', function(){
           var errorObject= Error("Body of error","Error message",500);
           var err=logger.errTransformer(errorObject);
           assert.ok(err.length >0 && (errorObject),"error object ransformed properly");
           assert.ok(JSON.parse(err).Body,"error fomated properly");
        });

        
        

        

    })
});