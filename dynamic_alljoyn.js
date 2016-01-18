var Device = require('zetta-device');
var util = require('util');

var DynamicAllJoyn = module.exports = function(options, aboutData) {
  Device.call(this);
  this._default = options['default'];
  // TODO: have this use the Node AllJoyn helper function
  // for HexString Id once it's ready  
  this.appId = options.appIdHexString;
  this.deviceName = aboutData.DeviceName;
  this.deviceId = aboutData.DeviceId;
  this.appName = aboutData.AppName;
  this.manufacturer = aboutData.Manufacturer;
  this.modelNumber = aboutData.ModelNumber;
  this.description = aboutData.Description;
  this.dateOfManufacture = aboutData.DateOfManufacture;
  this.softwareVersion = aboutData.SoftwareVersion;
  this.hardwareVersion = aboutData.HardwareVersion;
  this.supportUrl = aboutData.SupportUrl;
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
  this.log(this._default + ': ' + message);
  this.state = 'waiting';
  cb();
};
