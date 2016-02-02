var zetta = require('zetta');
var DynamicAllJoyn = require('../index');

zetta()
  .use(DynamicAllJoyn, ['com.se.*'], 'AboutPlusServiceTest')
  .listen(1337);
