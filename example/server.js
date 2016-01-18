var zetta = require('zetta');
var DynamicAllJoyn = require('../index');
var app = require('./apps/starter');

zetta()
  .use(DynamicAllJoyn)
  .use(app)
  .listen(1337);
