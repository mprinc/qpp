var Q = require('q');
var QPP = require('..');


var chai = require("chai");
var expect = chai.expect;
// var should = chai.should;
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var debug = false;
var extremeTest = false;
// var assert = require('chai').assert;

// testing:
// cdd; cd ChaOS/democracy-framework/wikipedia/qpp
// node node_modules/mocha/bin/mocha test/semaphore.spec.js
describe('Qpp.mapBandwith: ', function() {

	describe('when testing mapBandwith', function() {
	    this.timeout(500);

		it('it should exist', function() {
			expect(QPP).to.have.property('mapBandwith');
		});

		it('constructed object should have promise', function() {
			var iterator = QPP.mapBandwith();
			expect(iterator).to.be.a('object');
			expect(iterator).to.have.property('$promise');
			expect(iterator.$promise).to.be.instanceof(Q.makePromise);
		});

		it('it should react to missing parameters', function() {
			var iterator1 = QPP.mapBandwith();

			var options = {};
			var iterator2 = QPP.mapBandwith(options);
			options.processingFunction = function(){};
			var iterator3 = QPP.mapBandwith(options);
			return Q.all([
				iterator1.$promise.should.be.eventually.rejectedWith(Error, "Missing options"),
				iterator2.$promise.should.be.eventually.rejectedWith(Error, "Missing processingFunction"),
				iterator3.$promise.should.be.eventually.rejectedWith(Error, "Missing processingData")
			]);
		});

		it('it should spawn processingFunctions (promises) and limit them by options.limitConcurrentlyNum', function() {
			var options = {};
			var iterator = {};
			var sum = 0;
			var processingFunction = function(data, index){
				if(debug) console.log("[processingFunction:starting] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
				// test for the limit of concurrently running functions
				expect(index).to.be.a('number');
				expect(iterator.processingCurrentNo).to.be.at.most(options.limitConcurrentlyNum);
				var defered = Q.defer();
				setTimeout(function(){
					sum += data;
					if(debug) console.log("[processingFunction:finishing] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
					defered.resolve(index);
				}, parseInt(Math.random()*100)+1);

				return defered.promise;
			};
			options.processingData = [0, 1, 2, 3, 4, 5];
			options.limitConcurrentlyNum = 3;
			options.processingFunction = processingFunction;
			iterator = QPP.mapBandwith(options, iterator);
			expect(iterator.processingCurrentNo).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));
			expect(iterator.processingIterator).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));

			var promise = iterator.$promise.then(function(processedNo){
				expect(iterator.processingCurrentNo).to.be.equal(0);
				expect(iterator.processingIterator).to.be.equal(options.processingData.length);
				expect(sum).to.be.equal(options.processingData.reduce(function(sum, data){return data+sum;}, 0));
			});
			return Q.all([
				promise,
				iterator.$promise.should.be.eventually.equal(options.processingData.length)
			]);
		});

		it('it should spawn processingFunctions (callbacks) and options.limitConcurrentlyNum > options.processingData.length', function() {
			var options = {};
			var iterator = {};
			var sum = 0;
			var processingFunction = function(data, index, callback){
				if(debug) console.log("[processingFunction:starting] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
				// test for the limit of concurrently running functions
				expect(iterator.processingCurrentNo).to.be.at.most(options.limitConcurrentlyNum);
				setTimeout(function(){
					sum += data;
					if(debug) console.log("[processingFunction:finishing] data: %s, iterator.processingCurrentNo: %d", data, iterator.processingCurrentNo);
					expect(index).to.be.a('number');
					expect(callback).to.be.a('function');
					callback(index);
				}, parseInt(Math.random()*100)+1);
			};
			options.processingData = [0, 1, 2, 3, 4, 5];
			options.limitConcurrentlyNum = 10;
			options.processingFunction = processingFunction;
			iterator = QPP.mapBandwith(options, iterator);
			expect(iterator.processingCurrentNo).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));
			expect(iterator.processingIterator).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));

			var promise = iterator.$promise.then(function(processedNo){
				expect(iterator.processingCurrentNo).to.be.equal(0);
				expect(iterator.processingIterator).to.be.equal(options.processingData.length);
				expect(sum).to.be.equal(options.processingData.reduce(function(sum, data){return data+sum;}, 0));
			});
			return Q.all([
				promise,
				iterator.$promise.should.be.eventually.equal(options.processingData.length)
			]);
		});

		it('it should provide arguments to processingFunctions (both promises and callbacks mapBandwith running in parallel)', function() {
			var options1 = {};
			var options2 = {};
			var iterator1 = {};
			var iterator2 = {};
			var sum1 = 0;
			var sum2 = 0;
			var addition = 3;
			var substitution = 1;
			var multiplication = 2;
			var processingFunctionPromised = function(data, index, pAddition, pMultiplication){
				// test for the limit of concurrently running functions
				expect(index).to.be.a('number');
				expect(pAddition).to.be.a('number');
				expect(pMultiplication).to.be.a('number');
				var defered = Q.defer();
				setTimeout(function(){
					sum1 += data*pMultiplication + pAddition;
					defered.resolve(index);
				}, parseInt(Math.random()*100)+1);

				return defered.promise;
			};

			var processingFunctionCallbacked = function(data, index, pMultiplication, pSubstitution, callback){
				// test for the limit of concurrently running functions
				expect(index).to.be.a('number');
				expect(pMultiplication).to.be.a('number');
				expect(pSubstitution).to.be.a('number');
				setTimeout(function(){
					sum2 += data*pMultiplication - pSubstitution;
					expect(callback).to.be.a('function');
					callback(index);
				}, parseInt(Math.random()*100)+1);
			};
			options1.processingData = [0, 1, 2, 3, 4, 5];
			options1.processingArguments = [addition, multiplication];
			options1.limitConcurrentlyNum = 2;
			options1.processingFunction = processingFunctionPromised;
			options1.debug = debug;
			options1.name = "mapBandwith1";
			iterator1 = QPP.mapBandwith(options1, iterator1);

			options2.processingData = [0, 1, 2, 3, 4, 5, 6, 7];
			options2.processingArguments = [multiplication, substitution];
			options2.limitConcurrentlyNum = 3;
			options2.processingFunction = processingFunctionCallbacked;
			options2.debug = debug;
			options2.name = "mapBandwith2";
			iterator2 = QPP.mapBandwith(options2, iterator2);

			var promise1 = iterator1.$promise.then(function(processedNo){
				expect(sum1).to.be.equal(options1.processingData.reduce(function(sum, data){return (data*multiplication + addition)+sum;}, 0));
			});
			var promise2 = iterator2.$promise.then(function(processedNo){
				expect(sum2).to.be.equal(options2.processingData.reduce(function(sum, data){return (data*multiplication - substitution)+sum;}, 0));
			});
			return Q.all([
				promise1, promise2
			]);
		});
	});

	var processingDataLength = extremeTest ? 1000000 : 1000;
	it('it should work with large array options.processingData ('+processingDataLength+') (it will TAKE time ...)', function() {
	    if(extremeTest) this.timeout(1500000);
		var options = {};
		var iterator = {};
		var sum = 0;
		var processingFunction = function(data, index){
			// test for the limit of concurrently running functions
			expect(index).to.be.a('number');
			expect(iterator.processingCurrentNo).to.be.at.most(options.limitConcurrentlyNum);
			var defered = Q.defer();
			setTimeout(function(){
				sum += data;
				defered.resolve(index);
			}, 0);

			return defered.promise;
		};

		options.processingData = [];
		for(var i=0; i<processingDataLength; i++){
			options.processingData.push(i);
		}
		options.limitConcurrentlyNum = 3;
		options.processingFunction = processingFunction;
		iterator = QPP.mapBandwith(options, iterator);
		expect(iterator.processingCurrentNo).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));
		expect(iterator.processingIterator).to.be.equal(Math.min(options.limitConcurrentlyNum, options.processingData.length));

		var promise = iterator.$promise.then(function(processedNo){
			expect(iterator.processingCurrentNo).to.be.equal(0);
			expect(iterator.processingIterator).to.be.equal(options.processingData.length);
			expect(sum).to.be.equal(options.processingData.reduce(function(sum, data){return data+sum;}, 0));
		});
		return Q.all([
			promise,
			iterator.$promise.should.be.eventually.equal(options.processingData.length)
		]);
	});
});