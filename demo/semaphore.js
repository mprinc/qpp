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