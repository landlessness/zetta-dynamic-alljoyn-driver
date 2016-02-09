var Scout = require('zetta-scout');
var util = require('util');
var DynamicAllJoyn = require('./dynamic_alljoyn');
var alljoyn = require('alljoyn');
var x2js = require('x2js');
var xml = new x2js();

var clientBusAttachment = null;

var DynamicAllJoynScout = module.exports = function() {
  Scout.call(this);
  this.serviceInterfaceNames = arguments[0];
  this.clientApplicationName = arguments[1];
};
util.inherits(DynamicAllJoynScout, Scout);

DynamicAllJoynScout.prototype.init = function(next) {

  clientBusAttachment = this.setupClientBusAttachment(this.clientApplicationName);
  // create a new About Listener
  var aboutListener = alljoyn.AboutListener(this.foundAllJoynDevice.bind(this));
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
DynamicAllJoynScout.prototype.foundAllJoynDevice = function(busName, version, port, objectDescription, aboutData){
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
  var interfacesForPath = {};
  var paths = Object.keys(objectDescription);
  for (i = 0; i < paths.length; i++) {
    var membersForInterface = {};
    var proxyBusObject = alljoyn.ProxyBusObject(clientBusAttachment, busName, paths[i], sessionId);
    var interfaceNames = proxyBusObject.getInterfaceNames();
    for (j = 0; j < interfaceNames.length; j++) {
      for (s = 0; s < this.serviceInterfaceNames.length; s++) {
          if (regExpFromString(this.serviceInterfaceNames[s]).test(interfaceNames[j])) {
            var serviceInterfaceDescription = alljoyn.InterfaceDescription();
            proxyBusObject.getInterface(interfaceNames[j], serviceInterfaceDescription);
            var members = xml.xml2js(serviceInterfaceDescription.introspect(), {object: true});
            membersForInterface[interfaceNames[j]] = {interfaceDescription: serviceInterfaceDescription, membersForInterface: members};
          }
        }
    }
    var busObject = alljoyn.BusObject(paths[i]);
    interfacesForPath[paths[i]] = {membersForInterface: membersForInterface, busObject: busObject, proxyBusObject: proxyBusObject};
  }

  var dynamicAllJoynDeviceQuery = this.server.where({ type: 'dynamicAllJoyn', AppIdHexString: aboutDataFromProxy.AppIdHexString });

  this.server.find(dynamicAllJoynDeviceQuery, function(err, results){
    if (err) {
      return;
    }
    if (results.length > 0) {
      self.provision(results[0], DynamicAllJoyn, aboutDataFromProxy, interfacesForPath, clientBusAttachment);
    } else {
      self.discover(DynamicAllJoyn, aboutDataFromProxy, interfacesForPath, clientBusAttachment);
    }
  });
};

var regExpFromString = function(s) {
  var regexpString = s.replace(/\./g, "\\.");
  regexpString = regexpString.replace(/\*$/, ".*");
  regexpString = "^" + regexpString + "$";
  return new RegExp(regexpString);
}