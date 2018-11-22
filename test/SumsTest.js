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
describe('Can I use the SumsService module', function() {
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

	it('Can I do each partial (the problematic ones)?', function() {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		let sums=new SUMS.IcelineLtd.SumsService();

		Assert.equal(sums.nodes.apply('^', 2, 2), 4, "Can power 1");
		Assert.equal(sums.nodes.apply('^', 2, 2.1), 4.2870938501451725, "Can power 2");
		Assert.equal(sums.nodes.apply('^', 2.1, 2), 4.41, "Can power 3");
		Assert.equal(sums.nodes.apply('^', -2, 2), 4, "Can power 4");
		Assert.equal(sums.nodes.apply('^', 2, -2), 0.25, "Can power 5");
		Assert.equal(sums.nodes.apply('e', 2.1266233, 2.23424), 364.69563711544663);

		{  
			sums.stack=[{}, {}, {value:'('}];
			let ops= [ {pos:1, bodmas:2 }, {pos:2, bodmas:3}];
			let stack2=[{}, {leaves:[]}, {value:"("} ];
			sums.injectLeaf(2, ops, stack2, 1 ); 
			Assert.isTrue(stack2.length===3, "An item was added to the new seq stack");			
			Assert.isTrue(ops.length===2, "Ops remains the same length");
		}
		{  
			sums.stack=[{}, {}, {value:'('}];
			ops= [ {pos:1, bodmas:2 }, {pos:2, bodmas:3}];
			stack2=[{}, {leaves:[]}, {value:"("} ];
			sums.injectLeaf(2, ops, stack2,  1 ); 
			Assert.isTrue(stack2.length===3, "An item was added to the new seq stack");			
			Assert.isTrue(ops.length===2, "Ops remains the same length");
		}
/*
		{  
			sums.stack=[{}, {}, {}, {value:'('}];
			ops= [ {pos:1, bodmas:2 }, {pos:2, bodmas:3}];
			stack2=[{}, {leaves:[]}, {value:"("} ];
			sums.injectLeaf(3, ops, stack2, 3 ); 
			Assert.isTrue(stack2.length===4, "An item was added to the new seq stack");			
			Assert.isTrue(ops.length===2, "Ops remains the same length");
		}
*/ 
		{
			let preparedEarlier=[
			{ value: '+', isLeaf: false, leaves: [ 1, 2 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: '*', isLeaf: false, leaves: [ 3, 4 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 4, isLeaf: true, leaves: [] },
							];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{ value:'+', isLeaf:false, leaves:[2,3] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'*', isLeaf:false, leaves:[4,5] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'4', isLeaf:true, leaves:[] },
			 			];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		} 
		{ 
			let preparedEarlier=[
			{ value: '+', isLeaf: false, leaves: [ 1, 3 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: '*', isLeaf: false, leaves: [ 2, 4 ] },
			{ value: 4, isLeaf: true, leaves: [] },
				  ];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{ value:'*', isLeaf:false, leaves:[2,3] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'+', isLeaf:false, leaves:[4,5] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'4', isLeaf:true, leaves:[] },
			 ];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		}
		{
			let preparedEarlier=[
			{ value: '*', isLeaf: false, leaves: [ 1, 2 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: '+', isLeaf: false, leaves: [ 3, 4 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 4, isLeaf: true, leaves: [] },
							];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{value:'(', isLeaf:false, leaves:[2] },
				{ value:'+', isLeaf:false, leaves:[3,4] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'4', isLeaf:true, leaves:[] },
				{value:')', isLeaf:false, leaves:[] },
				{ value:'*', isLeaf:false, leaves:[7] },
				{ value:'4', isLeaf:true, leaves:[] },
			 			];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		}
		{
			let preparedEarlier=[
			{ value: '*', isLeaf: false, leaves: [ 1, 4 ] },
			{ value: '+', isLeaf: false, leaves: [ 2, 3 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: '+', isLeaf: false, leaves: [ 5, 6 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 4, isLeaf: true, leaves: [] },
							];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{value:'(', isLeaf:false, leaves:[2] },
				{ value:'+', isLeaf:false, leaves:[3,4] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'4', isLeaf:true, leaves:[] },
				{value:')', isLeaf:false, leaves:[] },
				{ value:'*', isLeaf:false, leaves:[7] },
				{value:'(', isLeaf:false, leaves:[8] },
				{ value:'+', isLeaf:false, leaves:[9,10] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'4', isLeaf:true, leaves:[] },
				{value:')', isLeaf:false, leaves:[] },
			 			];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		}
		{
			let preparedEarlier=[
			{ value: '*', isLeaf: false, leaves: [ 1, 2 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: '^', isLeaf: false, leaves: [ 3, 4 ] },
			{ value: 4, isLeaf: true, leaves: [] },
			{ value: 2,isLeaf: true,  leaves: [] },
				  ];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{ value:'*', isLeaf:false, leaves:[2,3] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'^', isLeaf:false, leaves:[4,5] },
				{ value:'4', isLeaf:true, leaves:[] },
				{ value:'2', isLeaf:true, leaves:[] },
			 ];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		}
		{
			let preparedEarlier=[
				{ value:'+', isLeaf:false, leaves:[1, 4] },
			    {value:'*', isLeaf:false, leaves:[2,3] },
				{ value:9, isLeaf:true, leaves:[] },
				{ value:2, isLeaf:true, leaves:[] },
				{value:'*', isLeaf:false, leaves:[5,6] },
				{ value:1, isLeaf:true, leaves:[] },
				{value:18, isLeaf:true, leaves:[] },		
							];
			sums.stack=[ 
				{value:'(', isLeaf:false, leaves:[1] },
				{value:'*', isLeaf:false, leaves:[2,3] },
				{ value:'9', isLeaf:true, leaves:[] },
				{ value:'2', isLeaf:true, leaves:[] },
				{ value:'+', isLeaf:false, leaves:[5] },
				{value:'*', isLeaf:false, leaves:[6,7] },
				{ value:'1', isLeaf:true, leaves:[] },
				{value:'18', isLeaf:true, leaves:[] },
				 			];
			sums.balance( sums.sort() );
			Assert.deepEqual(sums.stack, preparedEarlier);
		}
	
	});

	it('Can I compute?', function() {
		var SUMS = null;
		try {
			SUMS=require('../sums.js');
		} catch (e){
			Assert.isTrue(false, "Code didnt compile "+e.message);
		}
		let sums=new SUMS.IcelineLtd.SumsService();
		
		Assert.equal(sums.compute("3+4"), 7, "Sum 1");
		Assert.equal(sums.compute("3+4+3"), 10, "Sum 2");
		Assert.equal(sums.compute("3*4"), 12, "Sum 3");
		Assert.equal(sums.compute("16/4"), 4, "Sum 4");
		Assert.equal(sums.compute("2^10"), 1024, "Sum 5");
		Assert.equal(sums.compute("3+4*2"), 11, "Sum 6");
		Assert.equal(sums.compute("(3+4)"), 7, "Sum 7");
		Assert.equal(sums.compute("  1   +  1"), 2, "Sum 8");
		Assert.equal(sums.compute("\t1\v\t+  1\r"), 2, "Sum 9");
		Assert.equal(sums.compute("2+2+2+2+2"), 10, "Sum 10");
		Assert.equal(sums.compute("9*2+1*18"), 36, "Sum 11");
		Assert.equal(sums.compute("16^0.5"), 4, "Sum 12");
		Assert.equal(sums.compute("16^-2"), 0.00390625, "Sum 13");
		Assert.equal(sums.compute("-2 *2"), -4, "Sum 14");
		Assert.equal(sums.compute("2 * -2"), -4, "Sum 15 HARD");
		Assert.equal(sums.compute("0.25+ 0.75"), 1, "Sum 16");
		Assert.equal(sums.compute("1+(3+4)"), 8, "Sum 16");
		Assert.equal(sums.compute("3*(1+2)"), 9, "Sum 17");
		Assert.equal(sums.compute("((3))"), 3, "Sum 18");
		Assert.equal(sums.compute("1^1^1"), 1, "Sum 19");
		Assert.equal(sums.compute("2^3*1^1^1"), 8, "Sum 20");
		try {
			sums.compute("(1)+(3+4)");
		} catch(e) {
// NB Chai doesn't have expected exception
			console.log("Expected exception: "+e.message);			
		}
	});

});
