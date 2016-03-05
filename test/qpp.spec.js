var chai = require("chai");
var expect = chai.expect;
// var should = chai.should;
var should = chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var sinon = require("sinon");
// http://chaijs.com/plugins/sinon-chai
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

// testing:
// cdd; cd ChaOS/democracy-framework/wikipedia/qpp
// node node_modules/mocha/bin/mocha test/qpp.spec.js
describe('Q-general: ', function() {

	describe('different environments', function() {
	    this.timeout(500);

		// it('without Q', function() {
        //     // var Q = require('q');
        //     var Promise = require('q');
        //     var QPP = require('..');
		// });

		it('with window', function() {
            global.window = {};
			global.Promise = require('q');
            var QPP = require('..');
		});
	});
});
