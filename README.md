# qpp

=========

Promises Augmentation &amp; Patterns

# Installation
	npm install qpp --save

# Features

* Support for limiting a bandwith of executing a set of function
	* by the number of cuncurrent running functions
	* by the number of functions running at particular time period

* Support for parallelism
	* Semaphores

# Plans to add (please create new issue to ask for it)
* Time bandwith
* Semaphore hashes

# Usage

```
// Example of two consumers
var QPP = require('./..');
var s = new QPP.Semaphore('airstrip', 1);

// airplane (consumer) 1, waits for passangers to board
setTimeout(function(){
	s.wait() // allocating the resource (airstrip)
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

Plese check [documentation](http://mprinc.github.io/qpp/ "QPP Documentation") for detailed documentation and basic examples.

For more detailed and complex examples, please check the ***test*** folder in the repository

# Test
	npm test

# Release History
* 1.0.0 Initial release