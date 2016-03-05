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
// node node_modules/mocha/bin/mocha test/semaphores-hash.spec.js
describe('SemaphoresHash: ', function() {

	describe('when testing semaphoresHash', function() {
	    this.timeout(500);

		it('it should exist', function() {
			expect(QPP).to.have.property('SemaphoresHash');
		});

		it('it should be possible to create hash', function() {
			var s = new QPP.SemaphoresHash();
			expect(s).to.not.be.null;
			expect(s).to.have.property('semaphores');
			expect(s).to.have.property('initialResources');
			expect(s.initialResources).to.equal(1);

			var s = new QPP.SemaphoresHash(3);
			expect(s.initialResources).to.equal(3);
		});

		it('it should be possible to create semaphore', function() {
			var s = new QPP.SemaphoresHash(3);
			expect(s).to.not.be.null;
			expect(s).to.have.property('semaphores');
			expect(s.semaphores).to.deep.equal({});

			expect(s.semaphores).to.not.have.property('test');
			s.create('test');
			expect(s.semaphores).to.have.property('test');
			s.create('test'); // it should be idempotent
			expect(s.semaphores).to.have.property('test');
			expect(s.semaphores['test'].resourcesNo).to.equal(3);
		});

		it('it should be possible to wait on semaphoresHash', function() {
			var s = new QPP.SemaphoresHash();
			// expect(s.semaphores[].resourcesNo).to.equal(1);
			s.wait('test');
			expect(s.semaphores).to.have.property('test');
			expect(s.semaphores['test'].resourcesNo).to.equal(0);
			var wP = s.wait('test');
			expect(s.semaphores['test'].resourcesNo).to.equal(-1);
		});

		it('it should not be possible to signal on previouselly not created semaphore', function() {
			var s = new QPP.SemaphoresHash();
			// http://stackoverflow.com/questions/21587122/mocha-chai-expect-to-throw-not-catching-thrown-errors
			expect(s.signal.bind(s, 'test')).to.throw("Semaphore is not created")
		});

		it('it should be possible to signal on semaphoresHash (check s.resourcesNo)', function() {
			var s = new QPP.SemaphoresHash();
			s.create('test');
			expect(s.semaphores['test'].resourcesNo).to.equal(1);
			s.wait('test');
			expect(s.semaphores['test'].resourcesNo).to.equal(0);

			var wP = s.wait('test');
			var wPreturn1 =
			wP.then(function(resourcesNo){
				expect(s.semaphores['test'].resourcesNo).to.equal(0);
			}).done();
			expect(s.semaphores['test'].resourcesNo).to.equal(-1);
			setTimeout(function(){
				s.signal('test');
			}, 1);
			var wPreturn2 = expect(wP).to.eventually.equal(0);
			return Q.all([wPreturn1, wPreturn2]);
		});

		it('semaphores should be isolated', function() {
			var s = new QPP.SemaphoresHash();
			s.create('test1');
			s.create('test2');
			expect(s.semaphores['test1'].resourcesNo).to.equal(1);
			expect(s.semaphores['test2'].resourcesNo).to.equal(1);
			s.wait('test1');
			expect(s.semaphores['test1'].resourcesNo).to.equal(0);
			expect(s.semaphores['test2'].resourcesNo).to.equal(1);
			s.wait('test2');
			expect(s.semaphores['test1'].resourcesNo).to.equal(0);
			expect(s.semaphores['test2'].resourcesNo).to.equal(0);

			var wP = s.wait('test1');
			var wPreturn1 =
			wP.then(function(resourcesNo){
				expect(s.semaphores['test1'].resourcesNo).to.equal(0);
			}).done();
			expect(s.semaphores['test1'].resourcesNo).to.equal(-1);
			expect(s.semaphores['test2'].resourcesNo).to.equal(0);
			setTimeout(function(){
				s.signal('test1');
			}, 1);
			s.signal('test2');
			expect(s.semaphores['test1'].resourcesNo).to.equal(-1);
			expect(s.semaphores['test2'].resourcesNo).to.equal(1);
			var wPreturn2 = expect(wP).to.eventually.equal(0);
			return Q.all([wPreturn1, wPreturn2]);
		});

		it('it should be possible to signal on semaphoresHash (check fulfillness)', function() {
			var s = new QPP.SemaphoresHash();
			s.wait('test');

			var wP = s.wait('test');
		    // this.timeout(5000);
			setTimeout(function(){
				s.signal('test');
			}, 1);
			return wP;
		});

		it('it should be possible to wait and signal from multiple callbacks', function() {
			var s = new QPP.SemaphoresHash(1, false);
			task1Promise = s.wait('test');
			task1Promise.then(function(){
				setTimeout(function(){
					s.signal('test');
				}, parseInt(Math.random()*10)+1);
			}).done();
			task2Promise = s.wait('test');
			task2Promise.then(function(){
				setTimeout(function(){
					s.signal('test');
				}, parseInt(Math.random()*10)+1);
			}).done();
			task3Promise = s.wait('test');
			task3Promise.then(function(){
				setTimeout(function(){
					s.signal('test');
				}, parseInt(Math.random()*10)+1);
			}).done();
			task4Promise = s.wait('test');

			return Q.all([task1Promise, task2Promise, task3Promise, task4Promise]);
		});
	});
});
