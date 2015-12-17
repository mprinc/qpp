/**
* QPP
* Copyright(c) 2015 Sasha Rudan <mprinc@gmail.com>
* MIT Licensed 
* Promises Augmentation & Patterns library
*
* ```js
* var QPP = require('qpp');
* ```
*/

(function () { // This prevents problems when concatenating scripts that aren't strict.
'use strict';

/**
* @description
* ## Info
* This module provides different Promise related (implemented with) patterns and sollutions
* It contains semaphore implementation for syncing consumers of resources
* (like simultaneous writing in files, etc), and concurrent itterators that are limited 
* by number of parallel execution of iterators (if we want to limit number of parallel acceses
* to webservice, etc).
* ## Dependencies
* This module requires {@link https://www.npmjs.com/package/q | q npm module} (please check also the @see {@link https://github.com/kriskowal/q | q github})
* @module module:qpp
* @requires module:q
*/

var Q = require('q');

 // TODO: how to express that Promise is part of q module
/**
 * @external Promise
 * @see {@link https://github.com/kriskowal/q/wiki/API-Reference | Q-Promise API Reference}
 */

var QPP = {
	name: 'qpp',
	desc: 'Promises Augmentation & Patterns library',
	version: '1.0.0'
};

/*
* @exports qpp.Semaphore
*/
QPP.Semaphore = (function() {

	// TODO: what is the minimal set of tags to describe Semaphore a class that is exported as a part of QPP module

	/**
	* Constructor function. Creates a new semaphore with optional name and resources number
	*
	* @classdesc This is a class that provides promises enabled semaphores. 
	* It is possible to create a semaphore with a name (merely fore debugging purposes) 
	* and speciffic number of resources that we can wait for to get available, 
	* and release them when we do not need them anymore
	* 
	* @example
	* // Example of two consumers
	* var QPP = require('qpp');
	* var s = new QPP.Semaphore('toilet', 5);
	*
	* // consumer 1, wait for some random time, to provide random decission on
	* // which consumer will allocate semaphore first`
	* setTimeout(function(){
	*	s.wait() // allocating the resource (toilet)
	*	.then(function(){ // resource is available, consuming resource
	*		console.log("Consumer 1: Yes! The toilet is freee! I am the next one!");
	*		setTimeout(function(){
	*			console.log("Consumer 1: Ah, life is much better place now!")
	*			s.signal(); // releasing resource (toilet)
	*		}, parseInt(Math.random()*1500)+1);
	*	});
	* }, parseInt(Math.random()*100)+1);
	*
	* setTimeout(function(){ // consumer 2
	*	s.wait() // allocating the resource (toilet)
	*	.then(function(){ // resource is available, consuming resource
	*		console.log("Consumer 2: Rather a great news! Restroom is available for me!");
	*		setTimeout(function(){
	*			console.log("Consumer 2: It is a lovely day outside!")
	*			s.signal(); // releasing resource (toilet)
	*		}, parseInt(Math.random()*100)+1);
	*	});
	* }, parseInt(Math.random()*100)+1);
	* // For more examples, please check unit tests at @see {@link qpp.mapBandwith}
	*
	* @memberof qpp
	* @alias qpp.Semaphore
	* @exports qpp.Semaphore
	* @class qpp.Semaphore
	* @param {string} [name="semaphore"] - The name of the created semaphore
	* @param {number(integer)} [resourcesNo=1] - The total numer of resources available
	* @param {boolean} [debug=false] - Defines if debugging messages should be shown during Semaphore operations
	*/
	var Semaphore = function(name, resourcesNo, debug){
		/**
		* @memberof! qpp.Semaphore#
		* @var {string} name - name of the semaphore
		*/
		this.name = name || "semaphore";
		resourcesNo = resourcesNo || 1;
		/**
		* @memberof! qpp.Semaphore#
		* @private
		* @var {string} initialResources - initial (total) number of resources that Semaphore has
		*/
		this.initialResources = resourcesNo;
		/**
		* @memberof! qpp.Semaphore#
		* @var {string} resourcesNo - currently available number of resources
		*/
		this.resourcesNo = resourcesNo;
		/**
		* @memberof! qpp.Semaphore#
		* @private
		* @var {string} waitingQueue - queue holding the list of waiting consumers (functions) for available resources
		*/
		this.waitingQueue = [];

		/** 
		* @memberof! qpp.Semaphore#
		* @var {boolean} debug - defines if debugging messages should be shown during Semaphore operations
		*/
		this.debug = typeof this.debug !== 'undefined' ? this.debug : false;
	};

	/**
	* waits on semaphore
	* @memberof qpp.Semaphore#
	* @function wait
	* @returns {external:Promise} promise that will get resolved after the semaphore is available.
	* The only possibility for promise to get rejected is when semaphore gets destroyed
	* In that case it will get rejected with an @see {@link Error}.
	*/
	Semaphore.prototype.wait = function(){
		var deferred = Q.defer();
		if(this.debug) console.log("[Semaphore:%s:wait] this.resourcesNo:%d", this.name, this.resourcesNo);
		else{
			this.resourcesNo--;
			// enough available resources
			if(this.resourcesNo>=0){
				if(this.debug) console.log("[Semaphore:%s:wait] available", this.name);
				deferred.resolve(this.resourcesNo);
			// no enough available resources
			}else{
				if(this.debug) console.log("[Semaphore:%s:wait] not available", this.name);
				var that = this;
				this.waitingQueue.push(function(){
					if(that.debug) console.log("[Semaphore:%s:wait:callback] became available", that.name);
					deferred.resolve(that.resourcesNo);
				});
			}			
		}
		return deferred.promise;
	};

/*	Semaphore.prototype.waitWithSync = function(){
		var deferred = Q.defer();
		if(this.resourcesNo>0){
			this.resourcesNo--;
			deferred.resolve(this.resourcesNo);
			return {$available: true, $promise: deferred.promise};
		}else{
			var that = this;
			this.waitingQueue.push(function(){
				deferred.resolve(that.resourcesNo);
			});
			return {$available: false, $promise: deferred.promise};
		}
	}
*/
	/**
	* release resources in semaphore
	* @memberof qpp.Semaphore#
	* @function signal
	*/
	Semaphore.prototype.signal = function(){
		if(this.debug) console.log("[Semaphore:%s:signal] this.resourcesNo:%d", this.name, this.resourcesNo);
		this.resourcesNo++;
		// someone is waiting for available resources
		if(this.waitingQueue.length>0){
			if(this.debug) console.log("[Semaphore:%s:signal] %d consumers waiting in the queue", this.name, this.waitingQueue.length);
			var func = this.waitingQueue.shift();
			func();
		}else{
			if(this.debug) console.log("[Semaphore:%s:signal] no consumers waiting in the queue", this.name);
		}
	}

	return Semaphore;
})();

/*
* @exports qpp.SemaphoreMultiReservation
*/
QPP.SemaphoreMultiReservation = (function() {
	/**
	* Constructor function. Creates a new semaphore with optional name and resources number
	*
	* @classdesc This is a class that provides promises enabled semaphores.
	* It differs from the class Semaphore (@see {@link qpp.Semaphore} ) in a way
	* it supports allocation of more than one resource in one wait() call
	* 
	* @example
	* // Example of 3 groups
	* var QPP = require('qpp');
	* var s = new QPP.SemaphoreMultiReservation('Nebojsa tower', 5);
	* 
	* // group 1
	* setTimeout(function(){
	* 	s.wait(3) // 3 people
	* 	.then(function(){ // resource is available, consuming resource
	* 		console.log("Group 1: Let's run to the top!");
	* 		setTimeout(function(){
	* 			console.log("Group 1: Great experience, but they ask us to leave!")
	* 			s.signal(3); // releasing resource (toilet)
	* 		}, parseInt(Math.random()*1500)+1);
	* 	});
	* }, parseInt(Math.random()*100)+1);
	* 
	* // group 2
	* setTimeout(function(){
	* 	s.wait(4) // 4 people
	* 	.then(function(){ // resource is available, consuming resource
	* 		console.log("Group 2: Tower is available for us!");
	* 		setTimeout(function(){
	* 			console.log("Group 2: Let's give the space for others!")
	* 			s.signal(4); // releasing resource (toilet)
	* 		}, parseInt(Math.random()*500)+1);
	* 	});
	* }, parseInt(Math.random()*100)+1);
	* 
	* // group 3
	* setTimeout(function(){
	* 	s.wait(2) // 2 people
	* 	.then(function(){ // resource is available, consuming resource
	* 		console.log("Group 3: Hey, i have to show you the view!");
	* 		setTimeout(function(){
	* 			console.log("Group 3: Ah, we could stay here forever!")
	* 			s.signal(2); // releasing resource (toilet)
	* 		}, parseInt(Math.random()*100)+1);
	* 	});
	* }, parseInt(Math.random()*100)+1);
	* 
	* // This is the most interesting scenario:
	* //		Group 2: Tower is available for us
	* //		Group 2: Let's give the space for others
	* //		Group 3: Hey, i have to show you the view
	* //		Group 1: Let's run to the top
	* //		Group 3: Ah, we could stay here forever
	* //		Group 1: Great experience, but they ask us to leave!
	* // Because both group 1 and 3 ended up at the top of the towe simultaneously
	* // (there were enough of resources to allocate for both (2+3<=5))
	* // 
	* // For more examples, please check unit tests at @see qpp.mapBandwith	
	*
	* @memberof qpp
	* @exports qpp.Semaphore
	* @class qpp.SemaphoreMultiReservation
	* @param {string} [name="semaphore"] - The name of the created semaphore
	* @param {number(integer)} [resourcesNo=1] - The total numer of resources available
	* @param {boolean} [debug=false] - Defines if debugging messages should be shown during Semaphore operations
	* @param {boolean} [waitForMoreDemandingConsumers=true] - Defines if consumer can allocate resources even if other consumer waits for available resources (but needs more resources than currently available)
	*/
	var SemaphoreMultiReservation = function(name, resourcesNo, waitForMoreDemandingConsumers){
		/**
		* @memberof! qpp.SemaphoreMultiReservation#
		* @var {string} name - name of the semaphore
		*/
		this.name = name || "semaphore";

		/**
		* @memberof! qpp.SemaphoreMultiReservation#
		* @private
		* @var {string} initialResources - initial (total) number of resources that semaphore has
		*/
		this.initialResources = resourcesNo;

		/**
		* @memberof! qpp.SemaphoreMultiReservation#
		* @var {string} resourcesNo - currently available number of resources
		*/
		this.resourcesNo = resourcesNo;
		/**
		* @memberof! qpp.SemaphoreMultiReservation#
		* @private
		* @var {string} waitingQueue - queue holding the list of waiting consumers (functions) for available resources
		*/
		this.waitingQueue = [];
		/**
		* @memberof! qpp.SemaphoreMultiReservation#
		* @var {boolean} waitForMoreDemandingConsumers=true - defines if consumer can allocate resources even if other consumer waits for available resources (but needs more resources than currently available)
		* @example
		* var s = new Semaphore('s', 3);
		* var wP1 = s.wait(1); // fine, 2 resources left available
		* var wP2 = s.wait(3); // not fine (consumer 1 has to release)
		* // wP3 will be fine and resolved if {@link this.waitForMoreDemandingConsumers} === false
		* // or not fine and not resolved until consumer 1's resources are released (signaled) 
		* // if {@link this.waitForMoreDemandingConsumers} === true (default)
		* var wP3 = s.wait(2);
		*/
		this.waitForMoreDemandingConsumers = typeof waitForMoreDemandingConsumers !== 'undefined' ? waitForMoreDemandingConsumers : true;

		/** 
		* @memberof! qpp.SemaphoreMultiReservation#
		* @var {boolean} debug - defines if debugging messages should be shown during Semaphore operations
		*/
		this.debug = typeof this.debug !== 'undefined' ? this.debug : false;
	};

	/**
	* waits on semaphore
	* @memberof qpp.SemaphoreMultiReservation#
	* @function wait
	* @param {number} [resourcesNoNeeded="1"] - The numer of resources needed
	* @returns {external:Promise} promise that will get resolved after the semaphore is available/
	* The only possibility for promise to get rejected is when semaphore gets destroyed
	* In that case it will get rejected with an @see {@link Error}.
	*/
	SemaphoreMultiReservation.prototype.wait = function(resourcesNoNeeded){
		var deferred = Q.defer();
		resourcesNoNeeded = resourcesNoNeeded || 1;
		if(resourcesNoNeeded > this.initialResources) deferred.reject(new Error("Not possible to allocate more resources than were initially available"));
		else{
			if(this.debug) console.log("[SemaphoreMultiReservation:%s:wait] this.resourcesNo:%d, resourcesNoNeeded:%d", this.name, this.resourcesNo, resourcesNoNeeded);
			// enough available resources and (no one is waiting on semaphore or it is allowed to get resources before)
			if((this.resourcesNo >= resourcesNoNeeded) && (this.waitingQueue.length <= 0 || !this.waitForMoreDemandingConsumers)){
				this.resourcesNo -= resourcesNoNeeded; // allocation
				if(this.debug) console.log("[SemaphoreMultiReservation:%s:wait] available", this.name);
				deferred.resolve(this.resourcesNo);
			// no enough available resources
			}else{
				if(this.debug) console.log("[SemaphoreMultiReservation:%s:wait] not available", this.name);
				var that = this;
				this.waitingQueue.push({
					func: function(){
						if(that.debug) console.log("[Semaphore:%s:wait:callback] became available", that.name);
						deferred.resolve(that.resourcesNo);
					},
					rNo: resourcesNoNeeded
				});
			}
		}
		return deferred.promise;
	};

/*	SemaphoreMultiReservation.prototype.waitWithSync = function(){
		var deferred = Q.defer();
		if(this.resourcesNo>0){
			this.resourcesNo--;
			deferred.resolve(this.resourcesNo);
			return {$available: true, $promise: deferred.promise};
		}else{
			var that = this;
			this.waitingQueue.push(function(){
				deferred.resolve(that.resourcesNo);
			});
			return {$available: false, $promise: deferred.promise};
		}
	}
*/
	/**
	* release resources in semaphore
	* @memberof qpp.SemaphoreMultiReservation#
	* @function signal
	* @param {number} [resourcesReleased="1"] - The numer of resources released
	*/

	SemaphoreMultiReservation.prototype.signal = function(resourcesReleased){
		resourcesReleased = resourcesReleased || 1;
		if(this.debug) console.log("[SemaphoreMultiReservation:%s:signal] this.resourcesNo:%d, resourcesReleased:%d", this.name, this.resourcesNo, resourcesReleased);
		this.resourcesNo += resourcesReleased;
		// someone is waiting for available resources
		if(this.waitingQueue.length>0){
			if(this.debug) console.log("[SemaphoreMultiReservation:%s:signal] %d consumers waiting in the queue", this.name, this.waitingQueue.length);
			do{
				var qEl = this.waitingQueue[0];
				if(this.resourcesNo >= qEl.rNo){
					if(this.debug) console.log("[SemaphoreMultiReservation:%s:signal] releasing a consumer");
					this.waitingQueue.shift();
					this.resourcesNo -= qEl.rNo; // allocating
					qEl.func();
				}else{
					if(this.debug) console.log("[SemaphoreMultiReservation:%s:signal] consumer needs too much resources (needed %d out of %s available)", this.name, qEl.rNo, this.resourcesNo);
					break;
				}
			}while(this.waitingQueue.length>0);
		}else{
			if(this.debug) console.log("[SemaphoreMultiReservation:%s:signal] no consumers waiting in the queue", this.name);
		}
	}

	return SemaphoreMultiReservation;
})();

/**
* This is a type (a signature) of a processing function (callback) that is called for every element to be processed in the case of itterators (mapBandwith, etc)
* @callback processingFunctionCallback
* @param {*} dataElement - data element to be processed
* @param {number(index)} index - index of the processing element in the array
* @param {...*} [processingArgs] - additional arguments passed with options.processingArguments
* @param {processingFunctionFinishedCallback} callback - callback from the processing function back, when the processing is finished
* @returns {Promise} promise that will get realized after function  is available
*/

/**
* This is a type (a signature) of a processing function callback, called back from the processing function {@link processingFunctionCallback}. Processing function calls the iterator (mapBandwith etc) when it finishes processing the processing element.
* Note: the more preferred way is that function returns a promise and communicate with iterator through the promise instead through callback
* @callback processingFunctionFinishedCallback  @see {@link processingFunctionCallback}
* @param {number(index)} index - index of the processing element in the array that has been processed @see {@link processingFunctionCallback}
*/

/**
* @example
* var Q = require('q');
* var QPP = require('./..');
* 
* var iterator = {};
* var sum = 0;
* var processingFunction = function(data, index){
* 	console.log("[processingFunction:starting] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
* 	// test for the limit of concurrently running functions
* 	var defered = Q.defer();
* 	setTimeout(function(){
* 		sum += data;
* 		console.log("[processingFunction:finishing] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
* 		defered.resolve();
* 	}, parseInt(Math.random()*100)+1);
* 
* 	return defered.promise;
* };
* 
* var options = {};
* options.processingData = [0, 1, 2, 3, 4, 5];
* options.limitConcurrentlyNum = 3;
* options.processingFunction = processingFunction;
* iterator = QPP.mapBandwith(options, iterator);
* 
* var promise = iterator.$promise;
* 
* promise.then(function(processedNo){
* 	console.log("Done: processed: %d, sum: %d", processedNo, sum);
* });
*
* @exports qpp.mapBandwith
* @function mapBandwith - Bandwith limited iteration

* @param {Object} options - Parameters
* @param {string} options.name - the name of the iterator
* @param {Array.<*>} options.processingData - an array that has to be processed. For each element of array the options.processingFunction will be invited to process it
* @param {processingFunctionCallback} options.processingFunction - function that is called for processing data 
* @param {Object} [options.thisObj] - the object/context in which processing function will be called
* @param {Array.<*>} [options.processingArguments] - arguments that will be passed to the options.processingFunction in addition to element to process and few other maintance parameters
* @param {number(integer)} options.limitConcurrentlyNum - the number of concurrently processing array elements (calls to the options.processingFunction)
* @param {number(integer)} options.limitPerSecond - the maximum number array elements to process per second
* @param {boolean} options.debug - defines if debugging messages should be shown during mapBandwith processing

* @param {Object} [iterator={}] iterator that keeps information of the iteration status and options
* @return {Object} iterator that keeps information of the iteration status and options
*/
QPP.mapBandwith = function(options, iterator){
	iterator = iterator || {};
	var deferred = Q.defer();
	iterator.$promise = deferred.promise;
	if(typeof options == 'undefined'){
		deferred.reject(new Error("[MapBandwith] Missing options"));
		return iterator;
	}

	iterator.name = options.name || "no-name";
	iterator.thisObj = options.thisObj,
	iterator.processingFunction = options.processingFunction;
	iterator.processingData = options.processingData;
	iterator.processingArguments = options.processingArguments;
	iterator.limitConcurrentlyNum = options.limitConcurrentlyNum || 1;
	iterator.limitPerSecond = options.limitPerSecond;
	iterator.debug = typeof options.debug !== 'undefined' ? options.debug : false;

	if(typeof options.processingFunction === 'undefined'){
		deferred.reject(new Error("[MapBandwith:"+iterator.name+"] Missing processingFunction"));
		return iterator;
	}

	if(typeof options.processingData === 'undefined'){
		deferred.reject(new Error("[MapBandwith:"+iterator.name+"] Missing processingData"));
		return iterator;
	}

	iterator.promises = [];
	iterator.processingIterator = 0;
	iterator.processingCurrentNo = 0;
	var processingFunctionFinished = function(){
		iterator.processingCurrentNo--;
		addProcessingFunctions();
	};

	var addProcessingFunctions = function(){
		while(iterator.processingIterator < iterator.processingData.length 
		&& iterator.processingCurrentNo < iterator.limitConcurrentlyNum){
			iterator.processingCurrentNo++;

			if(options.processingArguments) {
				var procArguments = [iterator.processingData[iterator.processingIterator], iterator.processingIterator];
				// http://stackoverflow.com/questions/1374126/how-to-extend-an-existing-javascript-array-with-another-array
				procArguments.push.apply(procArguments, options.processingArguments);
				procArguments.push(processingFunctionFinished);
				if(iterator.debug) console.log("[MapBandwith:"+iterator.name+"] iterator.processingIterator: %d, procArguments:%s", iterator.processingIterator, JSON.stringify(procArguments));

				var promise = iterator.processingFunction.apply(iterator.thisObj || this, procArguments);
			}else{
				if(iterator.thisObj){
					var promise = iterator.processingFunction.call(iterator.thisObj, iterator.processingData[iterator.processingIterator], iterator.processingIterator, processingFunctionFinished);									
				}else{
					var promise = iterator.processingFunction(iterator.processingData[iterator.processingIterator], iterator.processingIterator, processingFunctionFinished);									
				}
			}

			iterator.processingIterator++;
			if(typeof promise !== 'undefined' && ('then' in promise)) promise.then(function(){
				processingFunctionFinished();
			}).done();
		}
		if(iterator.processingCurrentNo == 0) deferred.resolve(iterator.processingData.length);			
	}

	addProcessingFunctions();

	return iterator;
};

QPP.mapBandwithDataList = function(processingFunction, processingData){

};

QPP.mapBandwithArgumentsList = function(processingFunction, processingData){

};

// node.js world
module.exports = (function() {
	return QPP;
})();

}()); // end of 'use strict';