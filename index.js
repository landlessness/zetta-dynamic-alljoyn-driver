var Scout = require('zetta-scout');
var util = require('util');
var DynamicAllJoyn = require('./dynamic_alljoyn');
var alljoyn = require('alljoyn');

var clientBusAttachment = null;

var DynamicAllJoynScout = module.exports = function() {
  Scout.call(this);
  this.serviceInterfaceNames = arguments[0];
  this.clientApplicationName = arguments[1];
};
util.inherits(DynamicAllJoynScout, Scout);

DynamicAllJoynScout.prototype.init = function(next) {
  clientBusAttachment = this.setupClientBusAttachment(this.clientApplicationName);

  // TODO: have this call a prototype function instead of object function
  // to conform with the Zetta way this.foundAllJoynDevice.bind(this)
  // create a new About Listener
  var aboutListener = alljoyn.AboutListener(foundAllJoynDevice.bind(this));
  // register the About Listener
  clientBusAttachment.registerAboutListener(aboutListener);
  // ask who implements what on the given interface
  clientBusAttachment.whoImplements(this.serviceInterfaceNames);
  next();
};

DynamicAllJoynScout.prototype.setupClientBusAttachment = function(clientApplicationName) {
  var clientBusAttachment = alljoyn.BusAttachment(clientApplicationName, true);
  // start the bus attachment
  clientBusAttachment.start();

  // connect to bus
  clientBusAttachment.connect();
  return clientBusAttachment;
}

// TODO: turn this into a prototype function
var foundAllJoynDevice = function(busName, version, port, objectDescription, aboutData){
  var self = this;

  // join the session and get the complete About Data from the AboutProxy
  var sessionId = 0;
  sessionId = clientBusAttachment.joinSession(busName, port, sessionId);
  var aboutDataFromProxy = alljoyn.AboutProxy(clientBusAttachment, busName, sessionId).getAboutData('en');
  // TODO: Use Zetta's UUID handling?
  aboutDataFromProxy.AppIdHexString = '';
  for (i = 0; i < aboutDataFromProxy.AppId.length; i++) { 
    aboutDataFromProxy.AppIdHexString += aboutDataFromProxy.AppId[i].toString(16);
  }

  // Grab all the members for each Interface Description
  // FYI: AllJoyn Events and Actions API Guide
  // https://allseenalliance.org/framework/documentation/develop/api-guide/events-and-actions
  var membersForInterface = {};
  var paths = Object.keys(objectDescription);
  aboutDataFromProxy.interfaceNames = [];
  for (i = 0; i < paths.length; i++) {
    var proxyBusObject = alljoyn.ProxyBusObject(clientBusAttachment, busName, paths[i], sessionId);
    var interfaceNames = proxyBusObject.getInterfaceNames();
    for (j = 0; j < interfaceNames.length; j++) {
      if (this.serviceInterfaceNames.indexOf(interfaceNames[j]) > -1) {
        var serviceInterfaceDescription = alljoyn.InterfaceDescription();
        proxyBusObject.getInterface(interfaceNames[j], serviceInterfaceDescription);
        membersForInterface[interfaceNames[j]] = serviceInterfaceDescription.getMembers();
        aboutDataFromProxy.interfaceNames.push(interfaceNames[j]);
      }
    }
  }

  var dynamicAllJoynDeviceQuery = this.server.where({ type: 'dynamicAllJoyn', AppIdHexString: aboutDataFromProxy.AppIdHexString });

  this.server.find(dynamicAllJoynDeviceQuery, function(err, results){
    if (err) {
      return;
    }
    if (results.length > 0) {
      self.getFromRegistry(results[0], DynamicAllJoyn, aboutDataFromProxy, membersForInterface);
    } else {
      self.addToRegistry(DynamicAllJoyn, aboutDataFromProxy, membersForInterface);
    }
  });

};
