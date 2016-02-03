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

  // TODO: create fully qualified signal and method names?
  // that are nested beneath paths, interface names?

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
        config.monitor(signal._name);
        
        var signalCallbackParams = {};
        if ('arg' in signal) {
          signalCallbackParams = {
            args: ('length' in signal.arg) ? signal.arg : [signal.arg]
          };
        }
        
        var signalHandler = function(msg, sender){
          var formattedMsg = {};
          for (a = 0; a < this.args.length; a++) {
            var arg = this.args[a];
            formattedMsg[arg._name] = msg[a];
          }
          self[sender.member_name] = formattedMsg;
        }.bind(signalCallbackParams);
        this._busAttachment.registerSignalHandler(busObject, signalHandler, membersForInterface[interfaceName].interfaceDescription, signal._name)
      }
      
      // initialize methods
      var methods = members.interface.method;
      for (m = 0; m < methods.length; m++) {
        var method = methods[m];
        allowableMethods.push(method._name);

        inArgs = [];
        outArgs = [];
        zettaArgs = [];
        var args = ('length' in method.arg) ? method.arg : [method.arg];
        // for (a = 0; a < method.arg.length; a++) {
        for (a = 0; a < method.arg.length; a++) {
          var arg = method.arg[a];
          if (/^in$/.test(arg._direction)) {
            inArgs.push({signature: arg._type});
            zettaArgs.push({name: arg._name, type: this.zettaTypeFromAllJoynType(arg._type)});
          } else if (/^out$/.test(arg._direction)) {
            outArgs.push({signature: arg._type, name: arg._name});
          }
        }
        var methodCallbackParams = {
          inArgs: inArgs,
          methodName: method._name,
          outArgs: outArgs,
          interfaceName: interfaceName,
          busAttachment: this._busAttachment,
          driver: this
        }
        config.map(method._name, function() {
          for (a = 0; a < this.inArgs.length; a++) {
            this.inArgs[a]['value'] = arguments[a];
          }
          var methodResponse = proxyBusObject.methodCall(this.busAttachment, this.interfaceName, this.methodName, this.inArgs, this.outArgs);
          this.driver[this.methodName + 'Response'] = methodResponse;
          var cb = arguments[arguments.length-1];
          cb();
        }.bind(methodCallbackParams), zettaArgs);
      }
    }
  }
  
  config.when('ready', { allow: allowableMethods});
};

DynamicAllJoyn.prototype.zettaTypeFromAllJoynType = function(allJoynType) {
  return 'text';
}
