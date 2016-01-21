// for this suite to work, the Mock Device Discovery sample must be running
// how to run it? after running npm install in the project root:
// > <project_root>/node_modules/alljoyn/build/Release/sample-mock-device-discovery

// TODO: start, inspect and stop OS process from within the test
// http://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
// Or just start the service side from the test too

var util = require('util');
var assert = require('assert');
var DynamicAllJoyn = require('../index');

describe('A Dynamic AllJoyn Device', function() {
  
  before(function(done){
    Object.create(DynamicAllJoyn.prototype);
    done();
  });

  it('should be true', function() {
    assert.equal(true, true);
  });
});
