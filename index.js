var Scout = require('zetta-scout');
var util = require('util');
var DynamicAllJoyn = require('./dynamic_alljoyn');

var DynamicAllJoynScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(DynamicAllJoynScout, Scout);

DynamicAllJoynScout.prototype.init = function(next) {

  var self = this;

  var query = this.server.where({type: 'starter'});
  var options = {default: 'DEFAULT'};

  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], DynamicAllJoyn, options);
    } else {
      self.discover(DynamicAllJoyn, options);
    }
  });

  next();

};
