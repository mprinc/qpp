# qpp

Promises Augmentation &amp; Patterns

[![Build Status](https://travis-ci.org/mprinc/qpp.svg)](https://travis-ci.org/mprinc/qpp)
[![Dependency Status](https://david-dm.org/mprinc/qpp.svg)](https://david-dm.org/mprinc/qpp)
[![Coverage Status](https://img.shields.io/coveralls/mprinc/qpp.svg)](https://coveralls.io/r/mprinc/qpp)
[![Gittip](http://img.shields.io/gittip/mprinc.png)](https://www.gittip.com/mprinc/)

[![NPM](https://nodei.co/npm/qpp.png?downloads=true&stars=true)](https://nodei.co/npm/qpp/)

# Installation
	npm install qpp --save

# Features

* Works in node and browser
* Support for limiting a bandwidth of executing a set of function
	* by the number of concurrent running functions
	* (TODO) by the number of functions running at particular time period

* Support for parallelism
	* Semaphores
		* single resource allocation
		* support for __naming consumers__ (great for debugging deadlocks and leaks)
			* every time you call wait you can provide a name, and use it on signal
			* you can also use auto-provided unique consumer id
			* check unit test: 
				* file: test/semaphore.spec.js
				* test: 'it should be possible to wait and signal from multiple callbacks'
		* multiple resources allocation
	* Semaphores hash
		* collection of semaphores, each addressed by unique name

# Plans to add (please create new issue to ask for it)
* Time bandwidth

# Usage

```
// Example of two consumers
var QPP = require('./..');
var s = new QPP.Semaphore('airstrip', 1);

// airplane (consumer) 1, waits for passengers to board
setTimeout(function(){
	s.wait() // allocating the resource (airstrip), returns a promise
	.then(function(){ // resource is available, consuming resource
		console.log("Pilot 1: Yes! The airstrip is freee! We are the next one!");
		setTimeout(function(){
			console.log("Pilot 1: Ah, view is much better here!")
			s.signal(); // releasing resource (airstrip)
		}, parseInt(Math.random()*1500)+1);
	});
}, parseInt(Math.random()*1500)+1);

setTimeout(function(){ // airplane (consumer) 2
	s.wait() // allocating the resource (airstrip)
	.then(function(){ // resource is available, consuming resource
		console.log("Pilot 2: Great we are ready to departure, no one on the airstrip!");
		setTimeout(function(){
			console.log("Pilot 2: Dear passangers, enjoy our flight!")
			s.signal(); // releasing resource (airstrip)
		}, parseInt(Math.random()*2000)+1);
	});
}, parseInt(Math.random()*1500)+1);

// For more examples, please check unit tests at @see qpp.Semaphore
```

Please check [documentation](http://mprinc.github.io/qpp/ "QPP Documentation") for detailed documentation and basic examples.

For more detailed and complex examples, please check the ***test*** folder in the repository

# Test
	npm test

# Release History
* 1.0.0 Initial release