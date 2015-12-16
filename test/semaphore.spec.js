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
describe('Semaphore: ', function() {

	describe('when testing semaphore', function() {
	    this.timeout(500);

		it('it should exist', function() {
			expect(QPP).to.have.property('Semaphore');
		});

		it('it should be possible to create with name: "test"', function() {
			var s = new QPP.Semaphore();
			expect(s).to.not.be.null;
			expect(s).to.have.property('name');
			expect(s.name).to.equal('semaphore');
			expect(s).to.have.property('resourcesNo');
			expect(s.resourcesNo).to.equal(1);

			var s = new QPP.Semaphore('test', 3);
			expect(s.name).to.equal('test');
			expect(s.resourcesNo).to.equal(3);
		});

		it('it should be possible to wait on semaphore', function() {
			var s = new QPP.Semaphore('test');
			expect(s.resourcesNo).to.equal(1);
			s.wait();
			expect(s.resourcesNo).to.equal(0);

			var wP = s.wait();
			expect(s.resourcesNo).to.equal(-1);
		});

		it('it should be possible to signal on semaphore (check s.resourcesNo)', function() {
			var s = new QPP.Semaphore('test');
			expect(s.resourcesNo).to.equal(1);
			s.wait();
			expect(s.resourcesNo).to.equal(0);

			var wP = s.wait();
			var wPreturn1 = 
			wP.then(function(resourcesNo){
				expect(resourcesNo).to.equal(0);
			}).done();
			expect(s.resourcesNo).to.equal(-1);
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
			var s = new QPP.Semaphore('test');
			s.wait();

			var wP = s.wait();
		    // this.timeout(5000);
			setTimeout(function(){
				s.signal();
			}, 1);
			return wP;
		});

		it('it should be possible to wait and signal from multiple callbacks', function() {
			var s = new QPP.Semaphore('test');
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
	});
});