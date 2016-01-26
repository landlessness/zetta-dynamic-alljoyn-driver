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
  var self = this;

  config
  .name('DynamicAllJoyn')
  .type('dynamicAllJoyn')
  .state('ready');
  
  var allowableMethods = [];

  // TODO: craete fully qualified signal and method names
  // that are nested beneath paths, interface names

  // setup Zetta monitors based on AllJoyn Signals
  var paths = Object.keys(this._interfacesForPath);
  for (p = 0; p < paths.length; p++) {
    var busObject = this._interfacesForPath[paths[p]].busObject;
    var proxyBusObject = this._interfacesForPath[paths[p]].proxyBusObject;
    var membersForInterface = this._interfacesForPath[paths[p]].membersForInterface;
    var interfaceNames = Object.keys(membersForInterface);
    for (i = 0; i < interfaceNames.length; i++) {
      var interfaceName = interfaceNames[i];
      var members = membersForInterface[interfaceName].membersForInterface;
      if (typeof(members) == 'undefined' || members.length < 1) {
        continue;
      }
      
      // initialize signals
      var signals = members.interface.signal;
      for (s = 0; s < signals.length; s++) {
        var signal = signals[s];
        config.monitor(signal.name);
        var signalHandler = function(msg, sender){
          self[sender.memberName] = msg;
        };
        this._busAttachment.registerSignalHandler(busObject, signalHandler, membersForInterface[interfaceName].interfaceDescription, signal.name)
      }
      
      // initialize methods
      var methods = members.interface.method;
      for (m = 0; m < methods.length; m++) {
        var method = methods[m];
        allowableMethods.push(method.name);

        inArgs = [];
        outArgs = [];
        zettaArgs = [];
        var args = ('length' in method.arg) ? method.arg : [method.arg];
        for (a = 0; a < method.arg.length; a++) {
          var arg = method.arg[a];
          if (/^in$/.test(arg.direction)) {
            inArgs.push({signature: arg.type});
            zettaArgs.push({name: arg.name, type: this.zettaTypeFromAllJoynType(arg.type)});
          } else if (/^out$/.test(arg.direction)) {
            outArgs.push({signature: arg.type, name: arg.name});
          }
        }
        config.map(method.name, function() {
          for (a = 0; a < inArgs.length; a++) {
            inArgs[a]['value'] = arguments[a];
          }
          var methodResponse = proxyBusObject.methodCall(self._busAttachment, interfaceName, method.name, inArgs, outArgs);
          var returnedProperties = Object.keys(methodResponse);
          for (r = 0; r < returnedProperties.length; r++) {
            self[returnedProperties[r]] = methodResponse[returnedProperties[r]];
          }
          var cb = arguments[arguments.length-1];
          cb();
        }, zettaArgs);
      }
    }
  }
  
  config.when('ready', { allow: allowableMethods});
};

DynamicAllJoyn.prototype.zettaTypeFromAllJoynType = function(allJoynType) {
  return 'text';
}
