##Zetta Dynamic Driver for AllJoyn

###Install

#### Requires

* Node v0.10.25

#### Includes

* AllJoyn v14.12b (via Node AllJoyn driver v1.0.0)

#### Install

```
$> git clone https://github.com/zettajs/zetta-dynamic-alljoyn-driver zetta-{device}-{platform}-driver
```

###Usage

```
var zetta = require('zetta');
var Starter = require('zetta-dynamic-alljoyn-driver');

zetta()
  .use(Starter)
  .listen(1337)
```

### Hardware

* AllJoyn

###Transitions


###Design

