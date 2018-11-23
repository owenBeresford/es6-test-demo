const CHAI = require('chai');
const Assert=CHAI.assert;

/**
 * erm name?
 * A test script Mocha style
 * 
 * run manually as (manual use of Node, so you can choose your interpreter)
 *    node $path/mocha test/SumsTest.js
 * @access public
 * @return void
 */
describe('Can I use the SumsService module "set -t ms-value"', function() {
	it('loaded OK?', function() {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		Assert.isOk(SUMS.IcelineLtd, "Root namespace exists");
		Assert.isOk(SUMS.IcelineLtd.SumsService,"SumService class exists");		
	});

	it('I can test with timers [1]?', function(done) {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		let sums=new SUMS.IcelineLtd.SumsService();

		setTimeout(function() { Assert.isTrue(1===1, "Obvious true value"); done(); }, 1000);
	});

	it('I can test with timers [2]?', function(done) {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		let sums=new SUMS.IcelineLtd.SumsService();

		setTimeout(function() { console.log("This is a fake timeout event"); Assert.isNotTrue(1, "Should fail"); done(); }, 1000);
		setTimeout(function() { console.log("This is a fake API call that also calls done()"); done(); }, 2000);
	});

	it('I can test with timers [3]?', function(done) {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		let sums=new SUMS.IcelineLtd.SumsService();

		setTimeout(function() { console.log("This is a fake timeout event"); Assert.isNotTrue(1, "Should fail"); done(); }, 3000);
		setTimeout(function() { console.log("This is a fake API call that also calls done()"); done(); }, 4000);
	});



});

