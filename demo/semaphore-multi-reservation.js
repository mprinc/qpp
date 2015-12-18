// Example of 3 groups
var QPP = require('./..');
var s = new QPP.SemaphoreMultiReservation('Nebojsa tower', 5);

// group 1
setTimeout(function(){
	s.wait(3) // 3 people
	.then(function(){ // resource is available, consuming resource
		console.log("Group 1: Let's run to the top!");
		setTimeout(function(){
			console.log("Group 1: Great experience, but they ask us to leave!")
			s.signal(3); // releasing resource (toilet)
		}, parseInt(Math.random()*1500)+1);
	});
}, parseInt(Math.random()*100)+1);

// group 2
setTimeout(function(){
	s.wait(4) // 4 people
	.then(function(){ // resource is available, consuming resource
		console.log("Group 2: Tower is available for us!");
		setTimeout(function(){
			console.log("Group 2: Let's give the space for others!")
			s.signal(4); // releasing resource (toilet)
		}, parseInt(Math.random()*500)+1);
	});
}, parseInt(Math.random()*100)+1);

// group 3
setTimeout(function(){
	s.wait(2) // 2 people
	.then(function(){ // resource is available, consuming resource
		console.log("Group 3: Hey, i have to show you the view!");
		setTimeout(function(){
			console.log("Group 3: Ah, we could stay here forever!")
			s.signal(2); // releasing resource (toilet)
		}, parseInt(Math.random()*100)+1);
	});
}, parseInt(Math.random()*100)+1);

// This is the most interesting scenario:
//		Group 2: Tower is available for us
//		Group 2: Let's give the space for others
//		Group 3: Hey, i have to show you the view
//		Group 1: Let's run to the top
//		Group 3: Ah, we could stay here forever
//		Group 1: Great experience, but they ask us to leave!
// Because both group 1 and 3 ended up at the top of the towe simultaneously
// (there were enough of resources to allocate for both (2+3<=5))
// 
// For more examples, please check unit tests at @see qpp.SemaphoreMultiReservation