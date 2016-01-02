// Example of two consumers
var QPP = require('./..');
var semaphores = new QPP.SemaphoresHash();

setTimeout(function(){
	semaphores.wait('b&w-printer') // allocating the resource (b&w-printer)
	.then(function(){ // resource is available, consuming resource
		console.log("U1: b&w-printer is available!");
		setTimeout(function(){
			console.log("U1: Printing on the b&w-printer is finished!")
			semaphores.signal('b&w-printer'); // releasing resource (airstrip)
		}, parseInt(Math.random()*1500)+1);
	});
	semaphores.wait('color-printer') // allocating the resource (b&w-printer)
	.then(function(){ // resource is available, consuming resource
		console.log("U1: color-printer is available");
		setTimeout(function(){
			console.log("U1: Printing on the color-printer is finished!")
			semaphores.signal('color-printer'); // releasing resource (airstrip)
		}, parseInt(Math.random()*1500)+1);
	});
}, parseInt(Math.random()*1500)+1);

setTimeout(function(){
	semaphores.wait('b&w-printer') // allocating the resource (b&w-printer)
	.then(function(){ // resource is available, consuming resource
		console.log("U2: b&w-printer is available!");
		setTimeout(function(){
			console.log("U2: Printing on the b&w-printer is finished!")
			semaphores.signal('b&w-printer'); // releasing resource (airstrip)
		}, parseInt(Math.random()*1500)+1);
	});
	semaphores.wait('color-printer') // allocating the resource (b&w-printer)
	.then(function(){ // resource is available, consuming resource
		console.log("U2: color-printer is available");
		setTimeout(function(){
			console.log("U2: Printing on the color-printer is finished!")
			semaphores.signal('color-printer'); // releasing resource (airstrip)
		}, parseInt(Math.random()*1500)+1);
	});
}, parseInt(Math.random()*1500)+1);

// For more examples, please check unit tests at @see qpp.SemaphoresHash