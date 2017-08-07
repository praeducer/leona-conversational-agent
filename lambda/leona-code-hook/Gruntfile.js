// https://github.com/Tim-B/grunt-aws-lambda
//    lambda_invoke - Wrapper to run and test lambda functions locally and view output.
//    lambda_package - Packages function along with any npm dependencies in a zip format suitable for lambda.
//    lambda_deploy - Uploads the zip package to lambda.

var grunt = require('grunt');
grunt.loadNpmTasks('grunt-aws-lambda');

grunt.initConfig({
   lambda_invoke: {
      default: {
         options: {
             //Name of the handler function to invoke.
             //handler: 'LeonaCodeHook.handler',
             //Name of your script file which contains your handler function.
            file_name: 'LeonaCodeHook.js'
         }
      }
   },
   lambda_deploy: {
      default: {
          // TODO: The ARN of your target Lambda function.
         arn: 'arn:aws:lambda:us-east-1:780834403986:function:LeonaCodeHook',
         options: {
             // Sets the handler for your lambda function. If left null, the current setting will remain unchanged.
             //handler: 'LeonaCodeHook.handler'
             // If you wish to use a specific AWS credentials profile you can specify it here, otherwise it will use the environment default. You can also specify it with the environment variable AWS_PROFILE
             profile: 'praeducer'
             //If you wish to use hardcoded AWS credentials saved in a JSON file, put the path to the JSON here. The JSON must conform to the AWS format.
         }
      }
   },
   lambda_package: {
      default: {
   }
   }
});

grunt.registerTask('deploy', ['lambda_package', 'lambda_deploy'])