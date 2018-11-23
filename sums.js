/**
JS is my fifth scripting/programming language that I am still using.
Most of them have more structure than earlier JS versions.

As this code is very heavy in decision making, yes I do normally use this amount of decomposition
code you cant follow => errors
 
I think arrow functions are less useful than many people do. 
*/
"use strict";
// trying not to use 'ver-compare' or 'semver' as this may run a browser
if(typeof process === 'object' && process.version) {
	if(parseInt( process.version.substring(1,2)) < 8) {
		throw new Error("When using node, you must use a new version.");
	}
} // Add similar in-browser test


  /**
   * Math.sign
   * An import function, to buttress poor MSIE users
 
   * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
   * @param x
   * @access public
   * @return int, -1, 0, 1
   */
if (!Math.sign) {
  Math.sign = function(x) {
    // If x is NaN, the result is NaN.
    // If x is -0, the result is -0.
    // If x is +0, the result is +0.
    // If x is negative and not -0, the result is -1.
    // If x is positive and not +0, the result is +1.
    return ((x > 0) - (x < 0)) || +x;
    // A more aesthetical persuado-representation is shown below
    //
    // ( (x > 0) ? 0 : 1 )  // if x is negative then negative one
    //          +           // else (because you cant be both - and +)
    // ( (x < 0) ? 0 : -1 ) // if x is positive then positive one
    //         ||           // if x is 0, -0, or NaN, or not a number,
    //         +x           // Then the result will be x, (or) if x is
    //                      // not a number, then x converts to number
  };
}


/**
 * SumsService 
 * A interpreter to convert a string of arithmetic symbols to its result
 * this class has no current commercial value, 
 * a fast but ugly hack is to use eval(), which would deliver same results but has security concerns
 
 * @access public
 * @licence AGPL https://www.gnu.org/licenses/agpl-3.0.html
 * @author O Beresford owen@iceline.ltd.uk
 */
class SumsService {

  /**
     * constructor
     * a con'tor, nothing special
 
     * @access public
     * @return this
     */
	constructor() {
		this.stack=[];
		this.nodes=new SumNode();
		this.reset();
	}

	 /**
     * compute
     * A facade function to make use easier
 
     * @access public
     * @return void
     */
	compute(str) {
		Comparators.assert(typeof str ==='string', "Have been given correct data"); 
		Comparators.assert( str.length>=3 , "Have been given correct data"); 
		
		this.reset();
		this.parse(str);
		this.balance(this.sort());
		return this.reduce();
	}

	 /**
         * reset
         * a utility function to reset internal state
 
         * @access public
         * @return void
         */
	reset() {
		this.stack=[ this.nodes.makeNode('(', false) ];
	}

    /**
     * parse
     * Convert the supplied string to a list of symbols
 
     * @access public
     * @param str, a string of arithmatic symbols. Does some basic validation
     * @return this
     */
	parse(str) {
		let isInt='';
		let isBra=0;
		let parent=0;

		for (var i = 0; i < str.length; i++) {
			let c=str.charAt(i);
			if(Comparators.isWhitespace(c)) {
				continue; // safety, maybe not used	

			} else if(Comparators.isStructure(c)) {
				isBra+ (Comparators.openOrClose(c)?1:-1);
				Comparators.assertNot(isBra<0, "Missing stuff before close bracket "+isBra+" "+str);
				if(Comparators.openOrClose(c) && isInt!=='') {
					// awkward retest, or I cant branch on the else
					Comparators.assert(false, "Missing operator between number and bracket");
				} else if (isInt!=='') { // and isClose
					this.append(isInt, parent, true);
					isInt='';
				}
				parent= this.append(c, parent, false);
				isInt='';

			} else if(Comparators.isOperator(c)) {
				if(! this.stack[parent].isLeaf && c==='-' ) {
					isInt+=c;				
	
				} else {
					parent=this.append(c, parent, false);
					if(isInt) {
						this.append(isInt, parent, true);
						isInt='';
					}	
				}
			} else if(Comparators.isNumber(c)) {
				isInt+=""+c;
			}
		}
		if(isInt) {
			this.append(isInt, parent, true);
		}
		return this;
	}

    /**
     * append
     * Append the new data to the stack
 
     * @access public
	 * @param value  the thing that you are adding
	 * @param parent the node that this should be attached to
	 * @param isLeaf is the thing a terminal node/ leaf, or higher in the tree structure
     * @return the position where it was inserted
     */
	append(value, parent, isLeaf) {
		Comparators.assert(this.stack[parent],"Unknown parent, pointer sums borked");
		Comparators.assertNot(this.stack[parent].isLeaf, "May not attach a leaf to leaves");

		let i=this.stack.push(this.nodes.makeNode(value, isLeaf));
		i--;
		if(!Comparators.isStructure(value) || Comparators.openOrClose(value)) {
			this.stack[parent].leaves.push(i);
		}

		Comparators.assert(Comparators.canHaveMoreLeaves(this.stack, parent, 3 ),"Too many leaf nodes at aisle "+parent+" "+this.stack[parent].leaves.length);
		return i;
	}

    /**
     * sort
     * Adaptor to convert a tree to a sorted list of operators 
 
     * @access public
     * @return array of operators
     */
	sort() {
		// extra copy array to filter non-operators, and to allow sorting of them
		let ops=[];
		let bra=0;
		const LENGTH=this.stack.length;

		for(let i=0; i<LENGTH; i++) {
			if(Comparators.isStructure( this.stack[i].value) ) {
				bra += Comparators.openOrClose(this.stack[i].value)?1:-1;
			}
			if(!this.stack[i].isLeaf && !Comparators.isStructure( this.stack[i].value)) {
				this.stack[i].bodmas=bra*OP_TYPES+this.nodes.bodmas(this.stack[i].value);
				ops.push({pos:i, bodmas:this.stack[i].bodmas});
			}
		}

		ops.sort(function(a, b) { return Math.sign(a.bodmas -b.bodmas); });
		return ops;
	}

    /**
     * balance
     * Function to enforce BODMAS
 
     * @access public
     * @return void
     */
	balance( ops) {
		let stack2=[]; // full tree in correct order
		if(ops.length===0) {
			stack2=this.nodes.onlyNumbers(this.stack);
			Comparators.assert(stack2.length===1, "Supplied several numbers with no operators, confused");
			this.stack=stack2;
			return this;
		}

		for(let i=0; i< ops.length; i++) {
			let old=this.stack[ ops[i].pos];
			let parent = stack2.push(this.nodes.makeNode(old.value, false));
			parent--;
			ops[i].next=parent;
			if(parent>0) { // if this is the first item dont bother tryng
				this.nodes.injectBranch(stack2, ops, i);
			}
			if(typeof old.leaves[0] ==='number') {
				this.injectLeaf(old.leaves[0], ops, stack2, parent);
			}
			if(typeof old.leaves[1] ==='number') {
				this.injectLeaf(old.leaves[1], ops, stack2, parent);
			}
			if(parent>0 && Comparators.canHaveMoreLeaves(stack2, parent)) {
				this.injectLeaf2(stack2, ops, i);	
			}
		}
		for(let i=0; i<ops.length; i++) {
			Comparators.assertNot(Comparators.canHaveMoreLeaves(stack2,  ops[i].next), "There is an operator with a missing value "+i+"="+stack2[ ops[i].next].value +".");
		}

		this.stack=stack2;
		return this;
	}

    /**
     * reduce
     * Convert a stack to the single value
 
     * @access public
     * @return a value, likely an int
     */
	reduce() {
		for(let i=this.stack.length -1; i>=0; i--) {
			if(this.stack[i].isLeaf) { 
				continue;
			}
			this.stack[i].value=this.nodes.apply(
					this.stack[i].value,
					this.stack[ this.stack[i].leaves[0] ].value,
					this.stack[ this.stack[i].leaves[1] ].value
				);
		}
		return this.stack[0].value;	
	}


    /**
     * injectLeaf
     * Add a terminal /leaf node. Will inject backward pointers
 
	 * @param leaf ~ the thing that you are adding
	 * @param ops ~ the stack of operators
	 * @param stack2 ~ the current buffer
	 * @param parent ~ the position where the new node should be injected
     * @access public
     * @return void
     */
	injectLeaf(leaf, ops, stack2, parent) {
		let far=this.nodes.inList(ops, leaf);
		if( far ===false) {
			if(Comparators.isStructure(this.stack[leaf].value)) {
				return this.injectLeaf(this.stack[leaf].leaves[0], ops, stack2, parent );
			}

			let tt=stack2.push(this.nodes.makeNode(this.stack[leaf].value, true));
			stack2[parent].leaves.push(--tt);
		}
		Comparators.assert(Comparators.canHaveMoreLeaves(stack2, parent, 3 ),"Too many leaf nodes at aisle "+parent);
	}

    /**
     * injectLeaf2
     * Add a node with a different recipe. This one is very careful
 
     * @access public
	 * @param leaf ~ the thing that you are adding
	 * @param ops ~ the stack of operators
	 * @param stack2 ~ the current buffer
	 * @param parent ~ the position where the new node should be injected
     * @return void
     */
	injectLeaf2(stack, ops, current ) {
		let found=false;
		for(let i=current -1; i>=0; i-- ) {
			if(!Comparators.canHaveMoreLeaves(stack, ops[i].next)) {
				if(Comparators.isBranchXthLeaf(stack, ops[i].next, 1) &&
					ops[current].bodmas > ops[i].bodmas ) {
					// have to sort these, as these are being processed in bodmas order
					let annoying1= this.stack[ ops[current].pos].leaves[0];
					let annoying2= this.stack[ ops[i].pos].leaves[1];
					if( annoying1 < annoying2) {
						stack[ ops[current].next ].leaves.push( stack[ ops[i].next].leaves.pop() );
					} else {
						stack[ ops[current].next ].leaves.unshift( stack[ ops[i].next].leaves.pop() );
					}
					found=true;
					break;

				} else if(Comparators.isBranchXthLeaf(stack, ops[i].next, 0) &&
					ops[current].bodmas > ops[i].bodmas ) {
					let annoying1= this.stack[ ops[current].pos].leaves[0];
					let annoying2= this.stack[ ops[i].pos].leaves[1];

					if( annoying1 < annoying2) {
						stack[ ops[current].next ].leaves.push( stack[ ops[i].next].leaves.shift() );
					} else {
						stack[ ops[current].next ].leaves.unshift( stack[ ops[i].next].leaves.shift() );
					}
					found=true;
					break;
				}
			}
		}
		if( current +1 === ops.length) {
			Comparators.assert( found, "Tried to move a leaf to a higher prio operator, FAILED "+[current, ops.length, found].join(", "));
		}
	}

}

/**
 * SumNode 
 * A interpreter to convert a string of arithmetic symbols to its result
 * this class has no current commercial value, 
 * a fast but ugly hack is to use eval(), which would deliver same results but has security concerns
 
 * @access public
 * @licence AGPL https://www.gnu.org/licenses/agpl-3.0.html
 * @author O Beresford owen@iceline.ltd.uk
 */
class SumNode
{

    /**
     * apply 
     * Convert three values into a single value
	 * 
	 * @param op ~ the maths op
	 * @param l ~ the left
	 * @param r ~ the right
     * @access public
     * @return void
     */
	apply(op, l, r) {
		switch(op) {
			case '+': return l+r; break;
			case '-': return l-r; break;
			case '/': return l/r; break;
			case '*': return l*r; break;
			case '^': return Math.pow(l,r); break;
			case 'e': return l*Math.pow(10,r); break;
			default: throw new Error("Whut do you call that? "+op);
 		}
 		throw new Error("Javascript is broken, or someone can't refactor properly");
	}

    /**
     * inList
     * Reports whether the argument is in the first list
 
     * @access public
	 * @param ar ~ a list
	 * @param item ~ item to look for
     * @return bool
     */
	inList(ar, item) {
		const LENGTH=ar.length;
		for(let i =0; i<LENGTH; i++) {
			if(item===ar[i].pos) {
				return i;
			}
		}
		return false;
	}

    /**
     * makeNode
     * Convert two scalars into a Node struct.  Fixes int types
 
     * @access public
	 * @param v ~ value
	 * @param i ~ bool, isLeaf
     * @return new Struct
     */
	makeNode(v, i) {
		if(i && typeof v ==='string') {
			if(v.match(/\./)===null) {
				v=parseInt(v);
			} else {
				v=parseFloat(v);
			}
		}

		return { value:v, isLeaf:i, leaves:[] };
	}

    /**
     * makeNodeComplex
     * Makes the Node struct, add the leaves
 
     * @access public
     * @param hash ~ the additional external Nodes
     * @param oldNode ~ the old node to extract data from
     * @return new Struct
     */
	makeNodeComplex(hash, oldNode) {
		let t=this.makeNode(oldNode.value, false);
		if(typeof hash.joinRight ==='number') {
			t.leaves.push(hash.joinRight);
		}
		if(typeof hash.joinLeft==='number') {
			t.leaves.push(hash.joinLeft);
		}
		return t;	
	}

    /**
     * swapNodes
     * Flip two of the nodes; where there is an op too low
 
     * @access public
	 * @param stack ~ the stack to edit
	 * @param p1 ~ the left
	 * @param p2 ~ the right
     * @return void
     */
	swapNodes(stack, p1, p2) {
		let temp= stack[p1].value;
		stack[p1].value=stack[p2].value;
		stack[p1].isLeaf=false;
		stack[p1].leaves=stack[p2].leaves.slice();

		stack[p2].isLeaf=true;
		stack[p2].leaves=[];	
		stack[p2].value=temp;
			 
		Comparators.assert(Comparators.canHaveMoreLeaves(stack, p1, 3 ), "May only have 2 leaves per operation");
	}

    /**
     * injectBranch
     * Add references for branch nodes
 
     * @access public
	 * @param stack ~ the stack to edit
	 * @param ops ~ list of operators
	 * @param current ~ position in operators
     * @return void
     */
	injectBranch(stack, ops, current) {
		let child=stack.length-1;
		let found=false;
		// -1 here is so a node cannot be injected onto itself
		for(let i= current-1; i>=0; i--) {
			if( ops[i].bodmas < ops[current].bodmas &&
				Comparators.isBranchXthLeaf(stack, ops[i].next, 1) ) {
				stack[ child ].leaves.push(stack[ ops[i].next ].leaves[1]);
				stack[ ops[i].next ].leaves[1] = child ;
				found=true;
				break;
			}

			if(Comparators.canHaveMoreLeaves(stack, ops[i].next )) { 
				stack[ ops[i].next ].leaves.push(child);
				found=true;
				break;
			}

		}
		Comparators.assert(found, "Have not found correct parent to give child "+current+ " too ");
	}

    /**
     * bodmas 
     * Convert a symbol to an hash int
 
     * @access public
	 * @param i ~ position in operators
     * @return the hash
     */
	bodmas(i) {
		const sym=["+-", "*/", "^", "e", "()" ];
		const LENGTH=sym.length;

		for(let j =0; j<LENGTH; j++) {
			if(sym[j].indexOf(i) !== -1 ) { return j; }
		}
		throw new Error("Have unknown symbol "+i);
	}

    /**
     * onlyNumbers
     * return nodes which are numeric
 
     * @access public
	 * @param stack ~ input list
     * @return void
     */
	onlyNumbers( stack) {
		stack2=[];
		for(let i=0; i<stack.length; i++ ) {
			if(stack[i].isLeaf) {
				stack2.push( this.makeNode(stack[i].value, true));
			}
		}
		return stack2;
	}

}



const OP_TYPES=5;
/**
 * Comparators
 * List of static stateless test functions
 * 
 * @access public
 * @licence AGPL https://www.gnu.org/licenses/agpl-3.0.html
 * @author O Beresford owen@iceline.ltd.uk
 */
class Comparators
{
    /**
     * isOperator
	 * isStructure
	 * isNumber
	 * isWhitespace
	 * openOrClose  ~ brackets

     * Static functions to detect types, designed to be put in 'if' branches
	 * @param i ~ the char to test 
     * @access public
	 * @static
     * @return bool
     */
	static isOperator(i) {
		const ops="+-*/^e";
		return ops.indexOf(i)!==-1;
	}

	static isStructure(i) {
		//this is all I can think of, this simple calc doesnt do ϵ λ etc
		const brakets="()";
		return brakets.indexOf(i)!==-1;		
	}

	static isNumber(i) {
		const number="0123456789.-";
		return number.indexOf(i)!==-1;
	}
  
	static isWhitespace(i) {
		const white=" \t\v\r\n";
		return white.indexOf(i)!==-1;	
	}

  	static openOrClose(i) {
  		return i==='(';
  	}


    /**
     * canHaveMoreLeaves
     * Hopefully clearly named function, returns whether more leaves can be added
	 * @param stack ~ the current node buffer 
	 * @param pos ~ position in the stack
	 * @param limit ~ OPTIONAL how many leaf nodes is desired
     * @access public
     * @return bool
     */
	static canHaveMoreLeaves(stack, pos, limit=2 ) {
		return stack[pos].leaves.length < limit;
	}

    /**
     * isBranchXthLeaf
     * Hopefully clearly named function to report if a given child leaf is a leaf or a branch
	 * @param stack ~ the current node buffer 
	 * @param pos ~ position in the stack to start at
	 * @param X ~ which child to look at
      * @access public
     * @return bool
     */
	static isBranchXthLeaf(stack, pos, X) {
		return !Comparators.canHaveMoreLeaves(stack, pos, X+1 ) &&				
               stack[ stack[ pos ].leaves[X] ].isLeaf; 
	}

    /**
     * assert, assertNot
     * Two assert functions
 
     * @access public
     * @return void
     */
  	static assert( func, text) {
  		if(!func) {
  			throw new Error("Assert failed "+text);
  		}
  	}

   	static assertNot( func, text) {
  		if(func) {
  			throw new Error("AssertNot failed "+text);
  		}
  	}

}

if(typeof module ==='object') { module.exports={IcelineLtd:{ SumsService:SumsService}}; }


