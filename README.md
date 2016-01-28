##Zetta Dynamic Driver for AllJoyn

###Install

#### Prereqs

* Node v0.10.25
* AllJoyn v14.12b

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

