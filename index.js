var Scout = require('zetta-scout');
var util = require('util');
var DynamicAllJoyn = require('./dynamic_alljoyn');
var alljoyn = require('alljoyn');

var DynamicAllJoynScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(DynamicAllJoynScout, Scout);

var clientBusAttachment = null;

// DynamicAllJoyn.prototype.foundAllJoynDevice = function(busName, version, port, objectDescription, aboutData){
var foundAllJoynDevice = function(busName, version, port, objectDescription, aboutData){
  console.log('*** DynamicAllJoyn.prototype.foundAllJoynDevice');
  
  var self = this;
  // once the Announced callback has fired let's go ahead and 
  // join the session and get more About info
  var sessionId = 0;

  sessionId = clientBusAttachment.joinSession(busName, port, sessionId);
  // if the returned sessionId a string then it's an error message
  // number is good
  // assert.equal(typeof(sessionId),'number');

  // let's get the About proxy
  var aboutProxy = alljoyn.AboutProxy(clientBusAttachment, busName, sessionId);
  // assert.equal(typeof(aboutProxy), 'object');

  var options = {};
  var appId = aboutData['AppId'];
  
  // TODO: make this a helper function in the AllJoyn node package
  options.appIdHexString = '';
  for (i = 0; i < appId.length; i++) { 
    options.appIdHexString += appId[i].toString(16);
  }
  console.log("*** options.appIdHexString: " + options.appIdHexString)
  var dynamicAllJoynDeviceQuery = this.server.where({ type: 'alljoyn', alljoynId: options.appIdHexString });
  this.server.find(dynamicAllJoynDeviceQuery, function(err, results){
    if (err) {
      return;
    }
    if (results.length > 0) {
      self.provision(results[0], DynamicAllJoyn, options);
    } else {
      self.discover(DynamicAllJoyn, options);
    }
  });

};

DynamicAllJoynScout.prototype.init = function(next) {

  var clientApplicationName = 'AboutPlusServiceTest';
  var SERVICE_INTERFACE_NAME = 'com.se.bus.discovery';

  clientBusAttachment = this.setupClientBusAttachment(clientApplicationName);
  console.log('*** this.setupClientBusAttachment(clientApplicationName)');

  // create a new About Listener
  // TODO: have this call a prototype function instead of object function
  // to conform with the Zetta way
  var aboutListener = alljoyn.AboutListener(foundAllJoynDevice.bind(this));
  console.log('*** alljoyn.AboutListener');
  // register the About Listener
  clientBusAttachment.registerAboutListener(aboutListener)
  console.log('*** clientBusAttachment.registerAboutListener');
  // ask who implements what on the given interface
  clientBusAttachment.whoImplements([SERVICE_INTERFACE_NAME])
  console.log('*** clientBusAttachment.whoImplements');

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


