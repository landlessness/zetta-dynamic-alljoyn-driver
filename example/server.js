var zetta = require('zetta');
var DynamicAllJoyn = require('../index');
var app = require('./apps/starter');

zetta()
  .use(DynamicAllJoyn, ['com.se.bus.discovery'], 'AboutPlusServiceTest')
  .use(app)
  .listen(1337);
