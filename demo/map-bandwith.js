var Q = require('q');
var QPP = require('./..');

var iterator = {};
var sum = 0;
var processingFunction = function(data, index){
	console.log("[processingFunction:starting] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
	// test for the limit of concurrently running functions
	var defered = Q.defer();
	setTimeout(function(){
		sum += data;
		console.log("[processingFunction:finishing] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
		defered.resolve();
	}, parseInt(Math.random()*100)+1);

	return defered.promise;
};

var options = {};
options.processingData = [0, 1, 2, 3, 4, 5];
options.limitConcurrentlyNum = 3;
options.processingFunction = processingFunction;
iterator = QPP.mapBandwith(options, iterator);

var promise = iterator.$promise;

promise.then(function(processedNo){
	console.log("Done: processed: %d, sum: %d", processedNo, sum);
});

// For more examples, please check unit tests at @see qpp.mapBandwith