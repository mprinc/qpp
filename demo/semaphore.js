// Example of two consumers
var QPP = require('./..');
var s = new QPP.Semaphore('toilet', 1);

// consumer 1, wait for some random time, to provide random decission on
// which consumer will allocate semaphore first`
setTimeout(function(){
	s.wait() // allocating the resource (toilet)
	.then(function(){ // resource is available, consuming resource
		console.log("Consumer 1: Yes! The toilet is freee! I am the next one!");
		setTimeout(function(){
			console.log("Consumer 1: Ah, life is much better place now!")
			s.signal(); // releasing resource (toilet)
		}, parseInt(Math.random()*1500)+1);
	});
}, parseInt(Math.random()*1500)+1);

setTimeout(function(){ // consumer 2
	s.wait() // allocating the resource (toilet)
	.then(function(){ // resource is available, consuming resource
		console.log("Consumer 2: Rather a great news! Restroom is available for me!");
		setTimeout(function(){
			console.log("Consumer 2: It is a lovely day outside!")
			s.signal(); // releasing resource (toilet)
		}, parseInt(Math.random()*2000)+1);
	});
}, parseInt(Math.random()*1500)+1);
// For more examples, please check unit tests at @see qpp.mapBandwith