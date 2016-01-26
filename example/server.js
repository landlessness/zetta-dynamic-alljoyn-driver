var zetta = require('zetta');
var DynamicAllJoyn = require('../index');

zetta()
  .use(DynamicAllJoyn, ['com.se.bus.discovery'], 'AboutPlusServiceTest')
  .listen(1337);
