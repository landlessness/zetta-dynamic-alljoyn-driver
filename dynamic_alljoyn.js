var Device = require('zetta-device');
var util = require('util');

var DynamicAllJoyn = module.exports = function(options, aboutData) {
  Device.call(this);
  this._default = options['default'];
  this.alljoynId = options.appIdHexString;
};
util.inherits(DynamicAllJoyn, Device);

DynamicAllJoyn.prototype.init = function(config) {
  config
  .name('DynamicAllJoyn')
  .type('alljoyn')
  .state('waiting')
  .when('waiting', { allow: ['do']})
  .when('doing', { allow: [] })
  .map('do', this.do, [
    { name: 'message', type: 'text'}
  ]);
};

DynamicAllJoyn.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};
