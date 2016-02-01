##Zetta Dynamic Driver for AllJoyn

#### Overview

This Zetta driver dynamically discovers AllJoyn devices.

###Install

#### Requires

* Node v0.10.25

#### Includes

* AllJoyn v14.12b (via Node AllJoyn driver v1.0.0)

#### Install

```
$> git clone https://github.com/zettajs/zetta-dynamic-alljoyn-driver
$> npm install
```

###Usage

```
var zetta = require('zetta');
var alljoyn = require('zetta-dynamic-alljoyn-driver');

zetta()
  .use(alljoyn)
  .listen(1337)
```

### Hardware

* AllJoyn

###Transitions


###Design

