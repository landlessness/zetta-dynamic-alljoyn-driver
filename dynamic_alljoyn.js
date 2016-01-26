var Device = require('zetta-device');
var util = require('util');

var DynamicAllJoyn = module.exports = function(aboutData, interfacesForPath, busAttachment) {
  Device.call(this);

  this._interfacesForPath = interfacesForPath;
  this._busAttachment = busAttachment;

  // Set Zetta properties based on AllJoyn AboutData
  var properties = Object.keys(aboutData);
  for (i = 0; i < properties.length; i++) {
    this[properties[i]] = aboutData[properties[i]];
  }
};
util.inherits(DynamicAllJoyn, Device);

DynamicAllJoyn.prototype.init = function(config) {
  config
  .name('DynamicAllJoyn')
  .type('dynamicAllJoyn')
  .state('ready')
  .when('ready', { allow: [] });
  
  setup Zetta monitors based on AllJoyn Signals
  var paths = Object.keys(this._interfacesForPath);
  for (p = 0; p < paths.length; p++) {
    var membersForInterface = this._interfacesForPath[paths[p]].membersForInterface;
    var interfaceNames = Object.keys(membersForInterface);
    for (i = 0; i < interfaceNames.length; i++) {
      var members = membersForInterface[interfaceNames[i]].membersForInterface;
      if (typeof(members) == 'undefined' || members.length < 1) {
        continue;
      }
      this.initSignals(members.interface.signal, config, paths, membersForInterface, interfaceNames);
      this.initMethods(members.interface.method, config, paths, membersForInterface, interfaceNames);
    }
  }
};

DynamicAllJoyn.prototype.initSignals = function(signals, config, paths, membersForInterface, interfaceNames) {
  var self = this;

  for (s = 0; s < signals.length; s++) {
    var signal = signals[s];

    // create Zetta monitor on the AllJoyn Signal
    config.monitor(signal.name);

    // update values from AllJoyn Signal
    var signalHandler = function(msg, sender){
      self[sender.memberName] = msg;
    };

    // register Zetta callback for reacting to AllJoyn signals
    var busObject = this._interfacesForPath[paths[p]].busObject;
    this._busAttachment.registerSignalHandler(busObject, signalHandler, membersForInterface[interfaceNames[i]].interfaceDescription, signal.name)
  }
}

DynamicAllJoyn.prototype.initMethods = function(methods, config, paths, membersForInterface, interfaceNames) {
  var self = this;

  for (m = 0; m < methods.length; m++) {
    var method = methods[m];
    config.map(method.name, function(message, cb){console.log('method.name: ' + method.name + ' message: ' + message); cb();}, [{ name: 'message', type: 'text'}]);
    console.log('method.name: ' + method.name);
  }
}
