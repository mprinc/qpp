var Q = require('q');
var QPP = require('..');

var chai = require("chai");
var expect = chai.expect;
// var should = chai.should;
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// var assert = require('chai').assert;

// testing:
// cdd; cd ChaOS/democracy-framework/wikipedia/qpp
// node node_modules/mocha/bin/mocha test/semaphore.spec.js
describe('SemaphoreMultiReservation: ', function() {

	describe('when testing SemaphoreMultiReservation', function() {
	    this.timeout(500);

		it('it should exist', function() {
			expect(QPP).to.have.property('SemaphoreMultiReservation');
		});

		it('it should be possible to create with name: "test"', function() {
			var s = new QPP.SemaphoreMultiReservation();
			expect(s).to.not.be.null;
			expect(s).to.have.property('name');
			expect(s.name).to.equal('semaphore');
			expect(s).to.have.property('resourcesNo');
			expect(s.resourcesNo).to.equal(1);

			var s = new QPP.SemaphoreMultiReservation('test', 3);
			expect(s.name).to.equal('test');
			expect(s.resourcesNo).to.equal(3);
		});

		it('it should not be possible to wait for more resources on semaphore than initially available', function() {
			var s = new QPP.SemaphoreMultiReservation('test', 3);
			expect(s.resourcesNo).to.equal(3);
			var wP = s.wait(5);
			// wP.done();
			expect(s.resourcesNo).to.equal(3);

			s.wait().done();
			expect(s.resourcesNo).to.equal(2);

			return Q.all([
				wP.should.be.eventually.rejectedWith(Error, "Not possible to allocate more resources than were initially available")
				// expect(wP).to.eventually.be.rejectedWith(2)
			]);
		});

		it('it should be possible to wait on semaphore', function() {
			var s = new QPP.SemaphoreMultiReservation('test');
			expect(s.resourcesNo).to.equal(1);
			s.wait();
			expect(s.resourcesNo).to.equal(0);

			var wP = s.wait();
			expect(s.resourcesNo).to.equal(0);
		});

		it('it should be possible to signal on semaphore (check s.resourcesNo)', function() {
			var s = new QPP.SemaphoreMultiReservation('test');
			expect(s.resourcesNo).to.equal(1);
			s.wait();
			expect(s.resourcesNo).to.equal(0);

			var wP = s.wait();
			var wPreturn1 = 
			wP.then(function(resourcesNo){
				expect(resourcesNo).to.equal(0);
			}).done();
			expect(s.resourcesNo).to.equal(0);
			// return expect(QPP.resolve({ foo: "bar" })).to.eventually.have.property("foo");
			// return wP.should.eventually.equal(0);
		    // this.timeout(5000);
			setTimeout(function(){
				s.signal();
			}, 1);
			var wPreturn2 = expect(wP).to.eventually.equal(0);
			return Q.all([wPreturn1, wPreturn2]);
		});

		it('it should be possible to signal on semaphore (check fulfillness)', function() {
			var s = new QPP.SemaphoreMultiReservation('test');
			s.wait();

			var wP = s.wait();
		    // this.timeout(5000);
			setTimeout(function(){
				s.signal();
			}, 1);
			return wP;
		});

		it('it should be possible to wait and signal from multiple callbacks', function() {
			var s = new QPP.SemaphoreMultiReservation('test');
			task1Promise = s.wait();
			task1Promise.then(function(){
				setTimeout(function(){
					s.signal();
				}, parseInt(Math.random()*10)+1);
			}).done();
			task2Promise = s.wait();
			task2Promise.then(function(){
				setTimeout(function(){
					s.signal();
				}, parseInt(Math.random()*10)+1);
			}).done();
			task3Promise = s.wait();
			task3Promise.then(function(){
				setTimeout(function(){
					s.signal();
				}, parseInt(Math.random()*10)+1);
			}).done();
			task4Promise = s.wait();

			return Q.all([task1Promise, task2Promise, task3Promise, task4Promise]);
		});

		it('it should be possible to wait on semaphore for more resources', function() {
			var s = new QPP.SemaphoreMultiReservation('test', 3);
			expect(s.resourcesNo).to.equal(3);
			s.wait(2);
			expect(s.resourcesNo).to.equal(1);

			var wP = s.wait(3);
			expect(s.resourcesNo).to.equal(1);
		});

		it('it should be possible to signal on semaphore for more resources (check s.resourcesNo)', function() {
			var s = new QPP.SemaphoreMultiReservation('test', 3);
			expect(s.resourcesNo).to.equal(3);
			s.wait(2);
			expect(s.resourcesNo).to.equal(1);

			var wP = s.wait(3);
			var wDreturn2 = Q.defer();
			var wPreturn1 = 
			wP.then(function(resourcesNo){
				expect(resourcesNo).to.equal(0);
				setTimeout(function(){
					s.signal(3);
					wDreturn2.resolve(s.resourcesNo);
				}, 1);
			}).done();
			expect(s.resourcesNo).to.equal(1);
			// return expect(QPP.resolve({ foo: "bar" })).to.eventually.have.property("foo");
			// return wP.should.eventually.equal(0);
		    // this.timeout(5000);
			setTimeout(function(){
				s.signal(1);
				s.signal(1);
			}, 1);
			var wPreturn3 = expect(wDreturn2.promise).to.eventually.equal(3);
			return Q.all([wPreturn1, wPreturn3, wDreturn2.promise]);
		});

		it('it should be possible to wait and signal from multiple callbacks and reserving/releasing multiple resources with waitForMoreDemandingConsumers', function() {
			var s = new QPP.SemaphoreMultiReservation('test', 3, true);
			task1Promise = s.wait(1);
			task1Promise.then(function(){
				setTimeout(function(){
					s.signal(1);
				}, parseInt(Math.random()*10)+1);
			}).done();
			var runningTask = 'no';
			expect(runningTask).equal('no');
			task2Promise = s.wait(3);
			task2Promise.then(function(){
				expect(runningTask).equal('no');
				runningTask = '2';
				setTimeout(function(){
					s.signal(3);
				}, parseInt(Math.random()*10)+1);
			}).done();
			task3Promise = s.wait(2);
			task3Promise.then(function(){
				expect(runningTask).equal('2');
				runningTask = '3';
				setTimeout(function(){
					s.signal(2);
				}, parseInt(Math.random()*10)+1);
			}).done();
			task4Promise = s.wait(1);

			return Q.all([task1Promise, task2Promise, task3Promise, task4Promise]);
		});

		it('it should be possible to wait and signal from multiple callbacks and reserving/releasing multiple resources without waitForMoreDemandingConsumers', function() {
			var s = new QPP.SemaphoreMultiReservation('test', 3, false);
			task1Promise = s.wait(1);
			task1Promise.then(function(){
				setTimeout(function(){
					s.signal(1);
				}, parseInt(Math.random()*10)+1);
			}).done();
			var runningTask = 'no';
			expect(runningTask).equal('no');
			task2Promise = s.wait(3);
			task2Promise.then(function(){
				expect(runningTask).equal('3');
				runningTask = '2';
				setTimeout(function(){
					s.signal(3);
				}, parseInt(Math.random()*10)+1);
			}).done();
			task3Promise = s.wait(2);
			task3Promise.then(function(){
				expect(runningTask).equal('no');
				runningTask = '3';
				setTimeout(function(){
					s.signal(2);
				}, parseInt(Math.random()*10)+1);
			}).done();
			task4Promise = s.wait(1);

			return Q.all([task1Promise, task2Promise, task3Promise, task4Promise]);
		});

	});
});