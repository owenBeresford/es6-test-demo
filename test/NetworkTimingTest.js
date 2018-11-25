"use strict";
const CHAI = require('chai');
const Assert=CHAI.assert;
// the baseline for this is to be able to test in-browser JS.
// so the unit test needs to use browser API, not http library
const XMLHTTPRequest = require('xmlhttprequest').XMLHttpRequest;

// this needs to be executed as 
// mocha -s 40000 -t 40000 tests/SumsTimingsTest.js


// this class shouldnt be in a test here....
class WrappedJSONIO {

	constructor(xhr) {
		this.xhr=xhr;
		this.headers={};
		this.body="";
	}

	send(param, good, bad) {
		const self=this;
		this.xhr.timeout=param.timeout || 2000;
		this.xhr.addEventListener("timeout", function() { bad("timeout", {}); });
		this.xhr.addEventListener("error", function() { bad("Unknown error", {}); } );

		try {
// @link https://davidwalsh.name/xmlhttprequest
			this.xhr.addEventListener("readystatechange", function() {
				if(self.xhr.readyState===self.xhr.HEADERS_RECEIVED) {
					self.headers=self.parseHeaders(self.xhr.getAllResponseHeaders())
				}
				if(self.xhr.readyState===self.xhr.DONE) {
					if(self.validateData(self.xhr.responseText, self.headers, param)) {
						good(self.body, self.headers);
					} else {
						bad( self.body, self.headers);
					}
				} // else ignore
			} );

			this.xhr.open(param.method || "GET", param.url, true);
			if(param.headers ) {
				Object.keys(param.headers).forEach(function(a ) {	
					self.xhr.setRequestHeader(a, param.headers[a]);	
				});
			}
			this.xhr.send(param.body || null);
		} catch (e) {
			bad(e.message, {});
		}

	}

// @link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
	parseHeaders(headers) {
		var arr = headers.trim().split(/[\r\n]+/);

		var headerMap = {};
		arr.forEach(function (line) {
				var parts = line.split(': ');
				var header = parts.shift();
				var value = parts.join(': ');
				headerMap[header] = value;
				});
		return headerMap;
	}

	validateData(body, headers, param ) {
		if( headers['content-type'].match(/application\/json/) ) {
		// add other header options 
			this.body=JSON.parse(body); // exceptio9n are caught next function outside
		}
		// if param.exec && type is js, eval body
		if( headers['content-type'].match(/application\/xml/) ) {
		// add other header options 
			if (window.DOMParser) {
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(txt, "text/xml");

			} else { 
				// leSigh MSIE
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = false;
				xmlDoc.loadXML(txt);
			}
			this.body=xmlDoc;
		}

		if( headers['content-type'].match(/text\/html/i) ) {
			this.body=body.trim();
		}

		this.body=body.trim();
		return true;
	}


}


/**
 * erm name?
 * A test script Mocha style
 * 
 * run manually as (manual use of Node, so you can choose your interpreter)
 *    node $path/mocha -t 40000 -s 40000 test/SumsTest.js
 * @access public
 * @return void
 */
describe('Can I use timing stuff', function() {
	it('I can test with timers [1]?', function(done) {
		let json=new WrappedJSONIO( new XMLHTTPRequest());
		Assert.isTrue(typeof json.send==='function', "Obvious true value"); 
		let haveDied=false;

		const BAD=function(msg, args ) {
			Assert.isTrue(false, "This is a timeout or error event "+msg);
			haveDied=true;
			done();
		};
		const GOOD=function(data, args) {
			Assert.isTrue(true, "This is a GOOD event");
			// add more asserts on looking at data
			haveDied=true;
			done();
		};
		const param={ url:"https://www.google.co.uk/" };
		json.send(param, GOOD, BAD );
		
		setTimeout(function() { Assert.isTrue(haveDied, "Timeout set on XHR didnt work, hit this instead"); if(!haveDied) { done(); } }, 2200);

	});


});

