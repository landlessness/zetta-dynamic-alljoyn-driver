var Device = require('zetta-device');
var util = require('util');

// TODO: get these constants from AllJoyn C++ enum directly
// https://allseenalliance.org/docs/api/cpp/namespaceajn.html#typedef-members
var MESSAGE_INVALID     = 0; ///< an invalid message type
var MESSAGE_METHOD_CALL = 1; ///< a method call message type
var MESSAGE_METHOD_RET  = 2; ///< a method return message type
var MESSAGE_ERROR       = 3; ///< an error message type
var MESSAGE_SIGNAL      = 4; ///< a signal message type

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
  .state('waiting');  
  
  // setup Zetta monitors based on AllJoyn Signals
  var paths = Object.keys(this._interfacesForPath);
  for (p = 0; p < paths.length; p++) {
    console.log('paths[h]: ' + paths[p]);
    var membersForInterface = this._interfacesForPath[paths[p]].membersForInterface;
    var interfaceNames = Object.keys(membersForInterface);
    for (i = 0; i < interfaceNames.length; i++) {
      var members = membersForInterface[interfaceNames[i]].members;
      console.log('members: ' + util.inspect(members));
      for (s = 0; s < members.interface.signal.length; s++) {
        debugger;
        var signal = members.interface.signal[s];
        // create Zetta monitor on the AllJoyn Signal
        console.log('signal name: ' + signal.name);
        config.monitor(signal.name);

        var busObject = this._interfacesForPath[paths[p]].busObject;

        // this Zetta callback responds to AllJoyn signals (registered below)
        // it updates a Zetta-monitored property with an AllJoyn msg
        // the following code:
        // self[sender.memberName] = msg; 
        // is equivalent to:
        // this.Hearbeat = 'bump';
        // where this / self is the device driver object
        var signalHandler = function(msg, sender){
          self[sender.memberName] = msg;
        };

        // register Zetta callback for reacting to AllJoyn signals
        this._busAttachment.registerSignalHandler(busObject, signalHandler, membersForInterface[interfaceNames[i]].interfaceDescription, signal.name)
      }
    }
  }  
};
