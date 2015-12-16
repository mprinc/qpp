/**
* QPP
* Copyright(c) 2015 Sasha Rudan <mprinc@gmail.com>
* MIT Licensed 
* Promises Augmentation & Patterns library
*
* ```js
* var QPP = require('qpp');
* ```
* @module qpp
*/

(function () { // This prevents problems when concatenating scripts that aren't strict.
'use strict';

var Q = require('q');
var QPP = {
	name: 'qpp',
	desc: 'Promises Augmentation & Patterns library',
	version: '1.0.0'
};

/*
* @exports qpp.Semaphore
*/
QPP.Semaphore = (function() {
	/**
	* Constructor function.
	* @class qpp.Semaphore
	* @param {string} [name="semaphore"] - The name of the created semaphore
	* @param {number} [resourcesNo="1"] - The total numer of resources available
	*/
	var Semaphore = function(name, resourcesNo){
		this.name = name || "semaphore";
		resourcesNo = resourcesNo || 1;
		this.initialResources = resourcesNo;
		this.resourcesNo = resourcesNo;
		this.waitingQueue = [];
		this.debug = false;
	};

	/**
	* waits on semaphore
	* @memberof qpp.Semaphore#
	* @function wait
	* @returns {Promise} promise that will get realized after the semaphore is available
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
	* @returns {Promise} promise that will get realized after the semaphore is available
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
	* Constructor function.
	* @class qpp.SemaphoreMultiReservation
	* @param {string} [name="semaphore"] - The name of the created semaphore
	* @param {number} [resourcesNo="1"] - The total numer of resources available
	*/
	var SemaphoreMultiReservation = function(name, resourcesNo, waitForMoreDemandingConsumers){
		this.name = name || "semaphore";
		resourcesNo = resourcesNo || 1;
		this.initialResources = resourcesNo;
		this.resourcesNo = resourcesNo;
		this.waitingQueue = [];
		this.waitForMoreDemandingConsumers = typeof waitForMoreDemandingConsumers !== 'undefined' ? waitForMoreDemandingConsumers : true;
		this.debug = false;
	};

	/**
	* waits on semaphore
	* @memberof qpp.SemaphoreMultiReservation#
	* @function wait
	* @param {number} [resourcesNoNeeded="1"] - The numer of resources needed
	* @returns {Promise} promise that will get realized after the semaphore is available
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
	* @returns {Promise} promise that will get realized after the semaphore is available
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
* @exports qpp.mapBandwith
* @external
* Unescape special characters in the given string of html.
* @function mapBandwith - Bandwith limited iteration
* @param {Object} options - Parameters
* @param {string} options.name - The name of the iterator
* @param {string} options.thisObj - the object/context in which processing function will be called
* @param {Object} [iterator={}] iterator
* @return {String}
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