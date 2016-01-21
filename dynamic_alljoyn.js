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
  .state('waiting')
  .when('waiting', { allow: ['do']})
  .when('doing', { allow: [] })
  .map('do', this.do, [
    { name: 'message', type: 'text'}
  ]);
  
  
  // setup Zetta monitors based on AllJoyn Signals
  var paths = Object.keys(this._interfacesForPath);
  for (h = 0; h < paths.length; h++) {
    console.log('paths[h]: ' + paths[h]);
    var membersForInterface = this._interfacesForPath[paths[h]].membersForInterface;
    var interfaceNames = Object.keys(membersForInterface);
    for (i = 0; i < interfaceNames.length; i++) {
      var members = membersForInterface[interfaceNames[i]].members;
      for (j = 0; j < members.length; j++) {    
        var member = members[j];
        console.log('member.memberType: ' + member.memberType);
        switch (member.memberType) {
        case MESSAGE_INVALID:
          console.log('MESSAGE_INVALID');
          break;
        case MESSAGE_METHOD_CALL:
          console.log('MESSAGE_METHOD_CALL');
          // https://gist.github.com/landlessness/3b46c957cf4a6f57a5fd
          // use Wonkun's work here
          // this._transitions[member.name] = {
          //   handler: function() {}
          // }
          break;
        case MESSAGE_METHOD_RET:
          console.log('MESSAGE_METHOD_RET');
          break;
        case MESSAGE_ERROR:
          console.log('MESSAGE_ERROR');
          break;
        case MESSAGE_SIGNAL:
          console.log('MESSAGE_SIGNAL: ' + member.name);
          config.monitor(member.name);
          var signalHandler = function(msg, sender){
            console.log('signalHandler: ' + sender.memberName);
            self[sender.memberName] = msg;
          };
          var busObject = this._interfacesForPath[paths[h]].busObject;
          this._busAttachment.registerSignalHandler(busObject, signalHandler, membersForInterface[interfaceNames[i]].interfaceDescription, member.name)
          // TODO: remove this setInterval, it's just for testing
          // setInterval(function(m) {
          //   self[m.name] = Math.floor(Math.random() * 100);
          // }, 1000, member);
          break;
        default:
        }
      }
    }
  }  
};

DynamicAllJoyn.prototype.do = function(message, cb) {
  this.state = 'doing';
  this.log('do: ' + message);
  this.state = 'waiting';
  cb();
};
