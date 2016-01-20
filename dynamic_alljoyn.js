var Device = require('zetta-device');
var util = require('util');

var DynamicAllJoyn = module.exports = function(aboutData, membersForInterface) {
  Device.call(this);

  // Set Zetta properties based on AllJoyn AboutData
  properties = Object.keys(aboutData);
  for (i = 0; i < properties.length; i++) {
    this[properties[i]] = aboutData[properties[i]];
  }
  
  // setup Zetta monitors based on AllJoyn Signals
  
  
};
util.inherits(DynamicAllJoyn, Device);

DynamicAllJoyn.prototype.init = function(config) {
  config
  .name('DynamicAllJoyn')
  .type('dynamicAlljoyn')
  .state('waiting')
  .when('waiting', { allow: ['do']})
  .when('doing', { allow: [] })
  .map('do', this.do, [
    { name: 'message', type: 'text'}
  ]);
};

DynamicAllJoyn.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log('do: ' + message);
  this.state = 'waiting';
  cb();
};
