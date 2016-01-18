module.exports = function testApp(server) {
  
  // add query params in the where object like so:
  // var dynamicAllJoynDeviceQuery = server.where({type: 'led'});
  var dynamicAllJoynDeviceQuery = server.where({});
  
  server.observe([dynamicAllJoynDeviceQuery], function(starterDevice){
    setInterval(function(){
      starterDevice.call('do', './example/apps/starter_app.js is running', function() {});
    }, 1000);
  });
  
}