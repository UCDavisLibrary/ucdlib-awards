/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/define-properties/index.js":
/*!*************************************************!*\
  !*** ./node_modules/define-properties/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var keys = __webpack_require__(/*! object-keys */ "./node_modules/object-keys/index.js");
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var hasPropertyDescriptors = __webpack_require__(/*! has-property-descriptors */ "./node_modules/has-property-descriptors/index.js")();

var supportsDescriptors = origDefineProperty && hasPropertyDescriptors;

var defineProperty = function (object, name, value, predicate) {
	if (name in object) {
		if (predicate === true) {
			if (object[name] === value) {
				return;
			}
		} else if (!isFunction(predicate) || !predicate()) {
			return;
		}
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value; // eslint-disable-line no-param-reassign
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;


/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;


/***/ }),

/***/ "./node_modules/get-intrinsic/index.js":
/*!*********************************************!*\
  !*** ./node_modules/get-intrinsic/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();
var hasProto = __webpack_require__(/*! has-proto */ "./node_modules/has-proto/index.js")();

var getProto = Object.getPrototypeOf || (
	hasProto
		? function (x) { return x.__proto__; } // eslint-disable-line no-proto
		: null
);

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var hasOwn = __webpack_require__(/*! has */ "./node_modules/has/src/index.js");
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};


/***/ }),

/***/ "./node_modules/globalthis/implementation.browser.js":
/*!***********************************************************!*\
  !*** ./node_modules/globalthis/implementation.browser.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";
/* eslint no-negated-condition: 0, no-new-func: 0 */



if (typeof self !== 'undefined') {
	module.exports = self;
} else if (typeof window !== 'undefined') {
	module.exports = window;
} else {
	module.exports = Function('return this')();
}


/***/ }),

/***/ "./node_modules/globalthis/index.js":
/*!******************************************!*\
  !*** ./node_modules/globalthis/index.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var defineProperties = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/globalthis/implementation.browser.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/globalthis/polyfill.js");
var shim = __webpack_require__(/*! ./shim */ "./node_modules/globalthis/shim.js");

var polyfill = getPolyfill();

var getGlobal = function () { return polyfill; };

defineProperties(getGlobal, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = getGlobal;


/***/ }),

/***/ "./node_modules/globalthis/polyfill.js":
/*!*********************************************!*\
  !*** ./node_modules/globalthis/polyfill.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/globalthis/implementation.browser.js");

module.exports = function getPolyfill() {
	if (typeof __webpack_require__.g !== 'object' || !__webpack_require__.g || __webpack_require__.g.Math !== Math || __webpack_require__.g.Array !== Array) {
		return implementation;
	}
	return __webpack_require__.g;
};


/***/ }),

/***/ "./node_modules/globalthis/shim.js":
/*!*****************************************!*\
  !*** ./node_modules/globalthis/shim.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/globalthis/polyfill.js");

module.exports = function shimGlobal() {
	var polyfill = getPolyfill();
	if (define.supportsDescriptors) {
		var descriptor = Object.getOwnPropertyDescriptor(polyfill, 'globalThis');
		if (!descriptor || (descriptor.configurable && (descriptor.enumerable || !descriptor.writable || globalThis !== polyfill))) { // eslint-disable-line max-len
			Object.defineProperty(polyfill, 'globalThis', {
				configurable: true,
				enumerable: false,
				value: polyfill,
				writable: true
			});
		}
	} else if (typeof globalThis !== 'object' || globalThis !== polyfill) {
		polyfill.globalThis = polyfill;
	}
	return polyfill;
};


/***/ }),

/***/ "./node_modules/has-property-descriptors/index.js":
/*!********************************************************!*\
  !*** ./node_modules/has-property-descriptors/index.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors()) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;


/***/ }),

/***/ "./node_modules/has-proto/index.js":
/*!*****************************************!*\
  !*** ./node_modules/has-proto/index.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


var test = {
	foo: {}
};

var $Object = Object;

module.exports = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};


/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};


/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/***/ ((module) => {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),

/***/ "./node_modules/has/src/index.js":
/*!***************************************!*\
  !*** ./node_modules/has/src/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);


/***/ }),

/***/ "./node_modules/intersection-observer/intersection-observer.js":
/*!*********************************************************************!*\
  !*** ./node_modules/intersection-observer/intersection-observer.js ***!
  \*********************************************************************/
/***/ (() => {

/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */
(function() {
'use strict';

// Exit early if we're not running in a browser.
if (typeof window !== 'object') {
  return;
}

// Exit early if all IntersectionObserver and IntersectionObserverEntry
// features are natively supported.
if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

  // Minimal polyfill for Edge 15's lack of `isIntersecting`
  // See: https://github.com/w3c/IntersectionObserver/issues/211
  if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    Object.defineProperty(window.IntersectionObserverEntry.prototype,
      'isIntersecting', {
      get: function () {
        return this.intersectionRatio > 0;
      }
    });
  }
  return;
}

/**
 * Returns the embedding frame element, if any.
 * @param {!Document} doc
 * @return {!Element}
 */
function getFrameElement(doc) {
  try {
    return doc.defaultView && doc.defaultView.frameElement || null;
  } catch (e) {
    // Ignore the error.
    return null;
  }
}

/**
 * A local reference to the root document.
 */
var document = (function(startDoc) {
  var doc = startDoc;
  var frame = getFrameElement(doc);
  while (frame) {
    doc = frame.ownerDocument;
    frame = getFrameElement(doc);
  }
  return doc;
})(window.document);

/**
 * An IntersectionObserver registry. This registry exists to hold a strong
 * reference to IntersectionObserver instances currently observing a target
 * element. Without this registry, instances without another reference may be
 * garbage collected.
 */
var registry = [];

/**
 * The signal updater for cross-origin intersection. When not null, it means
 * that the polyfill is configured to work in a cross-origin mode.
 * @type {function(DOMRect|ClientRect, DOMRect|ClientRect)}
 */
var crossOriginUpdater = null;

/**
 * The current cross-origin intersection. Only used in the cross-origin mode.
 * @type {DOMRect|ClientRect}
 */
var crossOriginRect = null;


/**
 * Creates the global IntersectionObserverEntry constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
 * @param {Object} entry A dictionary of instance properties.
 * @constructor
 */
function IntersectionObserverEntry(entry) {
  this.time = entry.time;
  this.target = entry.target;
  this.rootBounds = ensureDOMRect(entry.rootBounds);
  this.boundingClientRect = ensureDOMRect(entry.boundingClientRect);
  this.intersectionRect = ensureDOMRect(entry.intersectionRect || getEmptyRect());
  this.isIntersecting = !!entry.intersectionRect;

  // Calculates the intersection ratio.
  var targetRect = this.boundingClientRect;
  var targetArea = targetRect.width * targetRect.height;
  var intersectionRect = this.intersectionRect;
  var intersectionArea = intersectionRect.width * intersectionRect.height;

  // Sets intersection ratio.
  if (targetArea) {
    // Round the intersection ratio to avoid floating point math issues:
    // https://github.com/w3c/IntersectionObserver/issues/324
    this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
  } else {
    // If area is zero and is intersecting, sets to 1, otherwise to 0
    this.intersectionRatio = this.isIntersecting ? 1 : 0;
  }
}


/**
 * Creates the global IntersectionObserver constructor.
 * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
 * @param {Function} callback The function to be invoked after intersection
 *     changes have queued. The function is not invoked if the queue has
 *     been emptied by calling the `takeRecords` method.
 * @param {Object=} opt_options Optional configuration options.
 * @constructor
 */
function IntersectionObserver(callback, opt_options) {

  var options = opt_options || {};

  if (typeof callback != 'function') {
    throw new Error('callback must be a function');
  }

  if (
    options.root &&
    options.root.nodeType != 1 &&
    options.root.nodeType != 9
  ) {
    throw new Error('root must be a Document or Element');
  }

  // Binds and throttles `this._checkForIntersections`.
  this._checkForIntersections = throttle(
      this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

  // Private properties.
  this._callback = callback;
  this._observationTargets = [];
  this._queuedEntries = [];
  this._rootMarginValues = this._parseRootMargin(options.rootMargin);

  // Public properties.
  this.thresholds = this._initThresholds(options.threshold);
  this.root = options.root || null;
  this.rootMargin = this._rootMarginValues.map(function(margin) {
    return margin.value + margin.unit;
  }).join(' ');

  /** @private @const {!Array<!Document>} */
  this._monitoringDocuments = [];
  /** @private @const {!Array<function()>} */
  this._monitoringUnsubscribes = [];
}


/**
 * The minimum interval within which the document will be checked for
 * intersection changes.
 */
IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


/**
 * The frequency in which the polyfill polls for intersection changes.
 * this can be updated on a per instance basis and must be set prior to
 * calling `observe` on the first target.
 */
IntersectionObserver.prototype.POLL_INTERVAL = null;

/**
 * Use a mutation observer on the root element
 * to detect intersection changes.
 */
IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


/**
 * Sets up the polyfill in the cross-origin mode. The result is the
 * updater function that accepts two arguments: `boundingClientRect` and
 * `intersectionRect` - just as these fields would be available to the
 * parent via `IntersectionObserverEntry`. This function should be called
 * each time the iframe receives intersection information from the parent
 * window, e.g. via messaging.
 * @return {function(DOMRect|ClientRect, DOMRect|ClientRect)}
 */
IntersectionObserver._setupCrossOriginUpdater = function() {
  if (!crossOriginUpdater) {
    /**
     * @param {DOMRect|ClientRect} boundingClientRect
     * @param {DOMRect|ClientRect} intersectionRect
     */
    crossOriginUpdater = function(boundingClientRect, intersectionRect) {
      if (!boundingClientRect || !intersectionRect) {
        crossOriginRect = getEmptyRect();
      } else {
        crossOriginRect = convertFromParentRect(boundingClientRect, intersectionRect);
      }
      registry.forEach(function(observer) {
        observer._checkForIntersections();
      });
    };
  }
  return crossOriginUpdater;
};


/**
 * Resets the cross-origin mode.
 */
IntersectionObserver._resetCrossOriginUpdater = function() {
  crossOriginUpdater = null;
  crossOriginRect = null;
};


/**
 * Starts observing a target element for intersection changes based on
 * the thresholds values.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.observe = function(target) {
  var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
    return item.element == target;
  });

  if (isTargetAlreadyObserved) {
    return;
  }

  if (!(target && target.nodeType == 1)) {
    throw new Error('target must be an Element');
  }

  this._registerInstance();
  this._observationTargets.push({element: target, entry: null});
  this._monitorIntersections(target.ownerDocument);
  this._checkForIntersections();
};


/**
 * Stops observing a target element for intersection changes.
 * @param {Element} target The DOM element to observe.
 */
IntersectionObserver.prototype.unobserve = function(target) {
  this._observationTargets =
      this._observationTargets.filter(function(item) {
        return item.element != target;
      });
  this._unmonitorIntersections(target.ownerDocument);
  if (this._observationTargets.length == 0) {
    this._unregisterInstance();
  }
};


/**
 * Stops observing all target elements for intersection changes.
 */
IntersectionObserver.prototype.disconnect = function() {
  this._observationTargets = [];
  this._unmonitorAllIntersections();
  this._unregisterInstance();
};


/**
 * Returns any queue entries that have not yet been reported to the
 * callback and clears the queue. This can be used in conjunction with the
 * callback to obtain the absolute most up-to-date intersection information.
 * @return {Array} The currently queued entries.
 */
IntersectionObserver.prototype.takeRecords = function() {
  var records = this._queuedEntries.slice();
  this._queuedEntries = [];
  return records;
};


/**
 * Accepts the threshold value from the user configuration object and
 * returns a sorted array of unique threshold values. If a value is not
 * between 0 and 1 and error is thrown.
 * @private
 * @param {Array|number=} opt_threshold An optional threshold value or
 *     a list of threshold values, defaulting to [0].
 * @return {Array} A sorted list of unique and valid threshold values.
 */
IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
  var threshold = opt_threshold || [0];
  if (!Array.isArray(threshold)) threshold = [threshold];

  return threshold.sort().filter(function(t, i, a) {
    if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
      throw new Error('threshold must be a number between 0 and 1 inclusively');
    }
    return t !== a[i - 1];
  });
};


/**
 * Accepts the rootMargin value from the user configuration object
 * and returns an array of the four margin values as an object containing
 * the value and unit properties. If any of the values are not properly
 * formatted or use a unit other than px or %, and error is thrown.
 * @private
 * @param {string=} opt_rootMargin An optional rootMargin value,
 *     defaulting to '0px'.
 * @return {Array<Object>} An array of margin objects with the keys
 *     value and unit.
 */
IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
  var marginString = opt_rootMargin || '0px';
  var margins = marginString.split(/\s+/).map(function(margin) {
    var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
    if (!parts) {
      throw new Error('rootMargin must be specified in pixels or percent');
    }
    return {value: parseFloat(parts[1]), unit: parts[2]};
  });

  // Handles shorthand.
  margins[1] = margins[1] || margins[0];
  margins[2] = margins[2] || margins[0];
  margins[3] = margins[3] || margins[1];

  return margins;
};


/**
 * Starts polling for intersection changes if the polling is not already
 * happening, and if the page's visibility state is visible.
 * @param {!Document} doc
 * @private
 */
IntersectionObserver.prototype._monitorIntersections = function(doc) {
  var win = doc.defaultView;
  if (!win) {
    // Already destroyed.
    return;
  }
  if (this._monitoringDocuments.indexOf(doc) != -1) {
    // Already monitoring.
    return;
  }

  // Private state for monitoring.
  var callback = this._checkForIntersections;
  var monitoringInterval = null;
  var domObserver = null;

  // If a poll interval is set, use polling instead of listening to
  // resize and scroll events or DOM mutations.
  if (this.POLL_INTERVAL) {
    monitoringInterval = win.setInterval(callback, this.POLL_INTERVAL);
  } else {
    addEvent(win, 'resize', callback, true);
    addEvent(doc, 'scroll', callback, true);
    if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in win) {
      domObserver = new win.MutationObserver(callback);
      domObserver.observe(doc, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }

  this._monitoringDocuments.push(doc);
  this._monitoringUnsubscribes.push(function() {
    // Get the window object again. When a friendly iframe is destroyed, it
    // will be null.
    var win = doc.defaultView;

    if (win) {
      if (monitoringInterval) {
        win.clearInterval(monitoringInterval);
      }
      removeEvent(win, 'resize', callback, true);
    }

    removeEvent(doc, 'scroll', callback, true);
    if (domObserver) {
      domObserver.disconnect();
    }
  });

  // Also monitor the parent.
  var rootDoc =
    (this.root && (this.root.ownerDocument || this.root)) || document;
  if (doc != rootDoc) {
    var frame = getFrameElement(doc);
    if (frame) {
      this._monitorIntersections(frame.ownerDocument);
    }
  }
};


/**
 * Stops polling for intersection changes.
 * @param {!Document} doc
 * @private
 */
IntersectionObserver.prototype._unmonitorIntersections = function(doc) {
  var index = this._monitoringDocuments.indexOf(doc);
  if (index == -1) {
    return;
  }

  var rootDoc =
    (this.root && (this.root.ownerDocument || this.root)) || document;

  // Check if any dependent targets are still remaining.
  var hasDependentTargets =
      this._observationTargets.some(function(item) {
        var itemDoc = item.element.ownerDocument;
        // Target is in this context.
        if (itemDoc == doc) {
          return true;
        }
        // Target is nested in this context.
        while (itemDoc && itemDoc != rootDoc) {
          var frame = getFrameElement(itemDoc);
          itemDoc = frame && frame.ownerDocument;
          if (itemDoc == doc) {
            return true;
          }
        }
        return false;
      });
  if (hasDependentTargets) {
    return;
  }

  // Unsubscribe.
  var unsubscribe = this._monitoringUnsubscribes[index];
  this._monitoringDocuments.splice(index, 1);
  this._monitoringUnsubscribes.splice(index, 1);
  unsubscribe();

  // Also unmonitor the parent.
  if (doc != rootDoc) {
    var frame = getFrameElement(doc);
    if (frame) {
      this._unmonitorIntersections(frame.ownerDocument);
    }
  }
};


/**
 * Stops polling for intersection changes.
 * @param {!Document} doc
 * @private
 */
IntersectionObserver.prototype._unmonitorAllIntersections = function() {
  var unsubscribes = this._monitoringUnsubscribes.slice(0);
  this._monitoringDocuments.length = 0;
  this._monitoringUnsubscribes.length = 0;
  for (var i = 0; i < unsubscribes.length; i++) {
    unsubscribes[i]();
  }
};


/**
 * Scans each observation target for intersection changes and adds them
 * to the internal entries queue. If new entries are found, it
 * schedules the callback to be invoked.
 * @private
 */
IntersectionObserver.prototype._checkForIntersections = function() {
  if (!this.root && crossOriginUpdater && !crossOriginRect) {
    // Cross origin monitoring, but no initial data available yet.
    return;
  }

  var rootIsInDom = this._rootIsInDom();
  var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

  this._observationTargets.forEach(function(item) {
    var target = item.element;
    var targetRect = getBoundingClientRect(target);
    var rootContainsTarget = this._rootContainsTarget(target);
    var oldEntry = item.entry;
    var intersectionRect = rootIsInDom && rootContainsTarget &&
        this._computeTargetAndRootIntersection(target, targetRect, rootRect);

    var rootBounds = null;
    if (!this._rootContainsTarget(target)) {
      rootBounds = getEmptyRect();
    } else if (!crossOriginUpdater || this.root) {
      rootBounds = rootRect;
    }

    var newEntry = item.entry = new IntersectionObserverEntry({
      time: now(),
      target: target,
      boundingClientRect: targetRect,
      rootBounds: rootBounds,
      intersectionRect: intersectionRect
    });

    if (!oldEntry) {
      this._queuedEntries.push(newEntry);
    } else if (rootIsInDom && rootContainsTarget) {
      // If the new entry intersection ratio has crossed any of the
      // thresholds, add a new entry.
      if (this._hasCrossedThreshold(oldEntry, newEntry)) {
        this._queuedEntries.push(newEntry);
      }
    } else {
      // If the root is not in the DOM or target is not contained within
      // root but the previous entry for this target had an intersection,
      // add a new record indicating removal.
      if (oldEntry && oldEntry.isIntersecting) {
        this._queuedEntries.push(newEntry);
      }
    }
  }, this);

  if (this._queuedEntries.length) {
    this._callback(this.takeRecords(), this);
  }
};


/**
 * Accepts a target and root rect computes the intersection between then
 * following the algorithm in the spec.
 * TODO(philipwalton): at this time clip-path is not considered.
 * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
 * @param {Element} target The target DOM element
 * @param {Object} targetRect The bounding rect of the target.
 * @param {Object} rootRect The bounding rect of the root after being
 *     expanded by the rootMargin value.
 * @return {?Object} The final intersection rect object or undefined if no
 *     intersection is found.
 * @private
 */
IntersectionObserver.prototype._computeTargetAndRootIntersection =
    function(target, targetRect, rootRect) {
  // If the element isn't displayed, an intersection can't happen.
  if (window.getComputedStyle(target).display == 'none') return;

  var intersectionRect = targetRect;
  var parent = getParentNode(target);
  var atRoot = false;

  while (!atRoot && parent) {
    var parentRect = null;
    var parentComputedStyle = parent.nodeType == 1 ?
        window.getComputedStyle(parent) : {};

    // If the parent isn't displayed, an intersection can't happen.
    if (parentComputedStyle.display == 'none') return null;

    if (parent == this.root || parent.nodeType == /* DOCUMENT */ 9) {
      atRoot = true;
      if (parent == this.root || parent == document) {
        if (crossOriginUpdater && !this.root) {
          if (!crossOriginRect ||
              crossOriginRect.width == 0 && crossOriginRect.height == 0) {
            // A 0-size cross-origin intersection means no-intersection.
            parent = null;
            parentRect = null;
            intersectionRect = null;
          } else {
            parentRect = crossOriginRect;
          }
        } else {
          parentRect = rootRect;
        }
      } else {
        // Check if there's a frame that can be navigated to.
        var frame = getParentNode(parent);
        var frameRect = frame && getBoundingClientRect(frame);
        var frameIntersect =
            frame &&
            this._computeTargetAndRootIntersection(frame, frameRect, rootRect);
        if (frameRect && frameIntersect) {
          parent = frame;
          parentRect = convertFromParentRect(frameRect, frameIntersect);
        } else {
          parent = null;
          intersectionRect = null;
        }
      }
    } else {
      // If the element has a non-visible overflow, and it's not the <body>
      // or <html> element, update the intersection rect.
      // Note: <body> and <html> cannot be clipped to a rect that's not also
      // the document rect, so no need to compute a new intersection.
      var doc = parent.ownerDocument;
      if (parent != doc.body &&
          parent != doc.documentElement &&
          parentComputedStyle.overflow != 'visible') {
        parentRect = getBoundingClientRect(parent);
      }
    }

    // If either of the above conditionals set a new parentRect,
    // calculate new intersection data.
    if (parentRect) {
      intersectionRect = computeRectIntersection(parentRect, intersectionRect);
    }
    if (!intersectionRect) break;
    parent = parent && getParentNode(parent);
  }
  return intersectionRect;
};


/**
 * Returns the root rect after being expanded by the rootMargin value.
 * @return {ClientRect} The expanded root rect.
 * @private
 */
IntersectionObserver.prototype._getRootRect = function() {
  var rootRect;
  if (this.root && !isDoc(this.root)) {
    rootRect = getBoundingClientRect(this.root);
  } else {
    // Use <html>/<body> instead of window since scroll bars affect size.
    var doc = isDoc(this.root) ? this.root : document;
    var html = doc.documentElement;
    var body = doc.body;
    rootRect = {
      top: 0,
      left: 0,
      right: html.clientWidth || body.clientWidth,
      width: html.clientWidth || body.clientWidth,
      bottom: html.clientHeight || body.clientHeight,
      height: html.clientHeight || body.clientHeight
    };
  }
  return this._expandRectByRootMargin(rootRect);
};


/**
 * Accepts a rect and expands it by the rootMargin value.
 * @param {DOMRect|ClientRect} rect The rect object to expand.
 * @return {ClientRect} The expanded rect.
 * @private
 */
IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
  var margins = this._rootMarginValues.map(function(margin, i) {
    return margin.unit == 'px' ? margin.value :
        margin.value * (i % 2 ? rect.width : rect.height) / 100;
  });
  var newRect = {
    top: rect.top - margins[0],
    right: rect.right + margins[1],
    bottom: rect.bottom + margins[2],
    left: rect.left - margins[3]
  };
  newRect.width = newRect.right - newRect.left;
  newRect.height = newRect.bottom - newRect.top;

  return newRect;
};


/**
 * Accepts an old and new entry and returns true if at least one of the
 * threshold values has been crossed.
 * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
 *    particular target element or null if no previous entry exists.
 * @param {IntersectionObserverEntry} newEntry The current entry for a
 *    particular target element.
 * @return {boolean} Returns true if a any threshold has been crossed.
 * @private
 */
IntersectionObserver.prototype._hasCrossedThreshold =
    function(oldEntry, newEntry) {

  // To make comparing easier, an entry that has a ratio of 0
  // but does not actually intersect is given a value of -1
  var oldRatio = oldEntry && oldEntry.isIntersecting ?
      oldEntry.intersectionRatio || 0 : -1;
  var newRatio = newEntry.isIntersecting ?
      newEntry.intersectionRatio || 0 : -1;

  // Ignore unchanged ratios
  if (oldRatio === newRatio) return;

  for (var i = 0; i < this.thresholds.length; i++) {
    var threshold = this.thresholds[i];

    // Return true if an entry matches a threshold or if the new ratio
    // and the old ratio are on the opposite sides of a threshold.
    if (threshold == oldRatio || threshold == newRatio ||
        threshold < oldRatio !== threshold < newRatio) {
      return true;
    }
  }
};


/**
 * Returns whether or not the root element is an element and is in the DOM.
 * @return {boolean} True if the root element is an element and is in the DOM.
 * @private
 */
IntersectionObserver.prototype._rootIsInDom = function() {
  return !this.root || containsDeep(document, this.root);
};


/**
 * Returns whether or not the target element is a child of root.
 * @param {Element} target The target element to check.
 * @return {boolean} True if the target element is a child of root.
 * @private
 */
IntersectionObserver.prototype._rootContainsTarget = function(target) {
  var rootDoc =
    (this.root && (this.root.ownerDocument || this.root)) || document;
  return (
    containsDeep(rootDoc, target) &&
    (!this.root || rootDoc == target.ownerDocument)
  );
};


/**
 * Adds the instance to the global IntersectionObserver registry if it isn't
 * already present.
 * @private
 */
IntersectionObserver.prototype._registerInstance = function() {
  if (registry.indexOf(this) < 0) {
    registry.push(this);
  }
};


/**
 * Removes the instance from the global IntersectionObserver registry.
 * @private
 */
IntersectionObserver.prototype._unregisterInstance = function() {
  var index = registry.indexOf(this);
  if (index != -1) registry.splice(index, 1);
};


/**
 * Returns the result of the performance.now() method or null in browsers
 * that don't support the API.
 * @return {number} The elapsed time since the page was requested.
 */
function now() {
  return window.performance && performance.now && performance.now();
}


/**
 * Throttles a function and delays its execution, so it's only called at most
 * once within a given time period.
 * @param {Function} fn The function to throttle.
 * @param {number} timeout The amount of time that must pass before the
 *     function can be called again.
 * @return {Function} The throttled function.
 */
function throttle(fn, timeout) {
  var timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(function() {
        fn();
        timer = null;
      }, timeout);
    }
  };
}


/**
 * Adds an event handler to a DOM node ensuring cross-browser compatibility.
 * @param {Node} node The DOM node to add the event handler to.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to add.
 * @param {boolean} opt_useCapture Optionally adds the even to the capture
 *     phase. Note: this only works in modern browsers.
 */
function addEvent(node, event, fn, opt_useCapture) {
  if (typeof node.addEventListener == 'function') {
    node.addEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.attachEvent == 'function') {
    node.attachEvent('on' + event, fn);
  }
}


/**
 * Removes a previously added event handler from a DOM node.
 * @param {Node} node The DOM node to remove the event handler from.
 * @param {string} event The event name.
 * @param {Function} fn The event handler to remove.
 * @param {boolean} opt_useCapture If the event handler was added with this
 *     flag set to true, it should be set to true here in order to remove it.
 */
function removeEvent(node, event, fn, opt_useCapture) {
  if (typeof node.removeEventListener == 'function') {
    node.removeEventListener(event, fn, opt_useCapture || false);
  }
  else if (typeof node.detachEvent == 'function') {
    node.detachEvent('on' + event, fn);
  }
}


/**
 * Returns the intersection between two rect objects.
 * @param {Object} rect1 The first rect.
 * @param {Object} rect2 The second rect.
 * @return {?Object|?ClientRect} The intersection rect or undefined if no
 *     intersection is found.
 */
function computeRectIntersection(rect1, rect2) {
  var top = Math.max(rect1.top, rect2.top);
  var bottom = Math.min(rect1.bottom, rect2.bottom);
  var left = Math.max(rect1.left, rect2.left);
  var right = Math.min(rect1.right, rect2.right);
  var width = right - left;
  var height = bottom - top;

  return (width >= 0 && height >= 0) && {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: width,
    height: height
  } || null;
}


/**
 * Shims the native getBoundingClientRect for compatibility with older IE.
 * @param {Element} el The element whose bounding rect to get.
 * @return {DOMRect|ClientRect} The (possibly shimmed) rect of the element.
 */
function getBoundingClientRect(el) {
  var rect;

  try {
    rect = el.getBoundingClientRect();
  } catch (err) {
    // Ignore Windows 7 IE11 "Unspecified error"
    // https://github.com/w3c/IntersectionObserver/pull/205
  }

  if (!rect) return getEmptyRect();

  // Older IE
  if (!(rect.width && rect.height)) {
    rect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top
    };
  }
  return rect;
}


/**
 * Returns an empty rect object. An empty rect is returned when an element
 * is not in the DOM.
 * @return {ClientRect} The empty rect.
 */
function getEmptyRect() {
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0
  };
}


/**
 * Ensure that the result has all of the necessary fields of the DOMRect.
 * Specifically this ensures that `x` and `y` fields are set.
 *
 * @param {?DOMRect|?ClientRect} rect
 * @return {?DOMRect}
 */
function ensureDOMRect(rect) {
  // A `DOMRect` object has `x` and `y` fields.
  if (!rect || 'x' in rect) {
    return rect;
  }
  // A IE's `ClientRect` type does not have `x` and `y`. The same is the case
  // for internally calculated Rect objects. For the purposes of
  // `IntersectionObserver`, it's sufficient to simply mirror `left` and `top`
  // for these fields.
  return {
    top: rect.top,
    y: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    x: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height
  };
}


/**
 * Inverts the intersection and bounding rect from the parent (frame) BCR to
 * the local BCR space.
 * @param {DOMRect|ClientRect} parentBoundingRect The parent's bound client rect.
 * @param {DOMRect|ClientRect} parentIntersectionRect The parent's own intersection rect.
 * @return {ClientRect} The local root bounding rect for the parent's children.
 */
function convertFromParentRect(parentBoundingRect, parentIntersectionRect) {
  var top = parentIntersectionRect.top - parentBoundingRect.top;
  var left = parentIntersectionRect.left - parentBoundingRect.left;
  return {
    top: top,
    left: left,
    height: parentIntersectionRect.height,
    width: parentIntersectionRect.width,
    bottom: top + parentIntersectionRect.height,
    right: left + parentIntersectionRect.width
  };
}


/**
 * Checks to see if a parent element contains a child element (including inside
 * shadow DOM).
 * @param {Node} parent The parent element.
 * @param {Node} child The child element.
 * @return {boolean} True if the parent node contains the child node.
 */
function containsDeep(parent, child) {
  var node = child;
  while (node) {
    if (node == parent) return true;

    node = getParentNode(node);
  }
  return false;
}


/**
 * Gets the parent node of an element or its host element if the parent node
 * is a shadow root.
 * @param {Node} node The node whose parent to get.
 * @return {Node|null} The parent node or null if no parent exists.
 */
function getParentNode(node) {
  var parent = node.parentNode;

  if (node.nodeType == /* DOCUMENT */ 9 && node != document) {
    // If this node is a document node, look for the embedding frame.
    return getFrameElement(node);
  }

  // If the parent has element that is assigned through shadow root slot
  if (parent && parent.assignedSlot) {
    parent = parent.assignedSlot.parentNode
  }

  if (parent && parent.nodeType == 11 && parent.host) {
    // If the parent is a shadow root, return the host element.
    return parent.host;
  }

  return parent;
}

/**
 * Returns true if `node` is a Document.
 * @param {!Node} node
 * @returns {boolean}
 */
function isDoc(node) {
  return node && node.nodeType === 9;
}


// Exposes the constructors globally.
window.IntersectionObserver = IntersectionObserver;
window.IntersectionObserverEntry = IntersectionObserverEntry;

}());


/***/ }),

/***/ "./node_modules/object-keys/implementation.js":
/*!****************************************************!*\
  !*** ./node_modules/object-keys/implementation.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js"); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/index.js":
/*!*******************************************!*\
  !*** ./node_modules/object-keys/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var slice = Array.prototype.slice;
var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js");

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : __webpack_require__(/*! ./implementation */ "./node_modules/object-keys/implementation.js");

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/isArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/object-keys/isArguments.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};


/***/ }),

/***/ "./node_modules/array-flat-polyfill/index.mjs":
/*!****************************************************!*\
  !*** ./node_modules/array-flat-polyfill/index.mjs ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
Array.prototype.flat||Object.defineProperty(Array.prototype,"flat",{configurable:!0,value:function r(){var t=isNaN(arguments[0])?1:Number(arguments[0]);return t?Array.prototype.reduce.call(this,function(a,e){return Array.isArray(e)?a.push.apply(a,r.call(e,t-1)):a.push(e),a},[]):Array.prototype.slice.call(this)},writable:!0}),Array.prototype.flatMap||Object.defineProperty(Array.prototype,"flatMap",{configurable:!0,value:function(r){return Array.prototype.map.apply(this,arguments).flat()},writable:!0})


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!***************************************************************!*\
  !*** ./node_modules/@ucd-lib/cork-app-build/lib/polyfills.js ***!
  \***************************************************************/
// intersection-observer, array-flat-polyfill and globalthis were added to support iOS 11 devices (iPad mini 4, iPad air 2, etc) specifically for the library v3 website launch
__webpack_require__(/*! intersection-observer */ "./node_modules/intersection-observer/intersection-observer.js");
__webpack_require__(/*! array-flat-polyfill */ "./node_modules/array-flat-polyfill/index.mjs");
const globalThisFn = __webpack_require__(/*! globalthis */ "./node_modules/globalthis/index.js");

if (typeof globalThis === 'undefined') {
    window.globalThis = globalThisFn();
}
})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
console.log('Hello from UCDlib Awards!');

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Z0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7QUNOQTtBQUNBLG1CQUFPLENBQUMsNEZBQXVCO0FBQy9CLG1CQUFPLENBQUMseUVBQXFCO0FBQzdCLHFCQUFxQixtQkFBTyxDQUFDLHNEQUFZOztBQUV6QztBQUNBO0FBQ0EsQzs7Ozs7Ozs7OztBQ1BBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9kZWZpbmUtcHJvcGVydGllcy9pbmRleC5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vbm9kZV9tb2R1bGVzL2Z1bmN0aW9uLWJpbmQvaW1wbGVtZW50YXRpb24uanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2luZGV4LmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvZ2V0LWludHJpbnNpYy9pbmRleC5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vbm9kZV9tb2R1bGVzL2dsb2JhbHRoaXMvaW1wbGVtZW50YXRpb24uYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vbm9kZV9tb2R1bGVzL2dsb2JhbHRoaXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9nbG9iYWx0aGlzL3BvbHlmaWxsLmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvZ2xvYmFsdGhpcy9zaGltLmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvaGFzLXByb3BlcnR5LWRlc2NyaXB0b3JzL2luZGV4LmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvaGFzLXByb3RvL2luZGV4LmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvaGFzLXN5bWJvbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9oYXMtc3ltYm9scy9zaGFtcy5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vbm9kZV9tb2R1bGVzL2hhcy9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9pbnRlcnNlY3Rpb24tb2JzZXJ2ZXIvaW50ZXJzZWN0aW9uLW9ic2VydmVyLmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaW1wbGVtZW50YXRpb24uanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy8uL25vZGVfbW9kdWxlcy9vYmplY3Qta2V5cy9pbmRleC5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vbm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2lzQXJndW1lbnRzLmpzIiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvYXJyYXktZmxhdC1wb2x5ZmlsbC9pbmRleC5tanMiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vdWNkbGliLWF3YXJkcy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3VjZGxpYi1hd2FyZHMvLi9ub2RlX21vZHVsZXMvQHVjZC1saWIvY29yay1hcHAtYnVpbGQvbGliL3BvbHlmaWxscy5qcyIsIndlYnBhY2s6Ly91Y2RsaWItYXdhcmRzLy4vc3JjL2pzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGtleXMgPSByZXF1aXJlKCdvYmplY3Qta2V5cycpO1xudmFyIGhhc1N5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2woJ2ZvbycpID09PSAnc3ltYm9sJztcblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xudmFyIG9yaWdEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAoZm4pIHtcblx0cmV0dXJuIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0ci5jYWxsKGZuKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cbnZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3JzID0gcmVxdWlyZSgnaGFzLXByb3BlcnR5LWRlc2NyaXB0b3JzJykoKTtcblxudmFyIHN1cHBvcnRzRGVzY3JpcHRvcnMgPSBvcmlnRGVmaW5lUHJvcGVydHkgJiYgaGFzUHJvcGVydHlEZXNjcmlwdG9ycztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgdmFsdWUsIHByZWRpY2F0ZSkge1xuXHRpZiAobmFtZSBpbiBvYmplY3QpIHtcblx0XHRpZiAocHJlZGljYXRlID09PSB0cnVlKSB7XG5cdFx0XHRpZiAob2JqZWN0W25hbWVdID09PSB2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghaXNGdW5jdGlvbihwcmVkaWNhdGUpIHx8ICFwcmVkaWNhdGUoKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRpZiAoc3VwcG9ydHNEZXNjcmlwdG9ycykge1xuXHRcdG9yaWdEZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIHtcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdFx0dmFsdWU6IHZhbHVlLFxuXHRcdFx0d3JpdGFibGU6IHRydWVcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvYmplY3RbbmFtZV0gPSB2YWx1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuXHR9XG59O1xuXG52YXIgZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmplY3QsIG1hcCkge1xuXHR2YXIgcHJlZGljYXRlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDoge307XG5cdHZhciBwcm9wcyA9IGtleXMobWFwKTtcblx0aWYgKGhhc1N5bWJvbHMpIHtcblx0XHRwcm9wcyA9IGNvbmNhdC5jYWxsKHByb3BzLCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG1hcCkpO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BzW2ldLCBtYXBbcHJvcHNbaV1dLCBwcmVkaWNhdGVzW3Byb3BzW2ldXSk7XG5cdH1cbn07XG5cbmRlZmluZVByb3BlcnRpZXMuc3VwcG9ydHNEZXNjcmlwdG9ycyA9ICEhc3VwcG9ydHNEZXNjcmlwdG9ycztcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVQcm9wZXJ0aWVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQgbm8taW52YWxpZC10aGlzOiAxICovXG5cbnZhciBFUlJPUl9NRVNTQUdFID0gJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIGNhbGxlZCBvbiBpbmNvbXBhdGlibGUgJztcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgZnVuY1R5cGUgPSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQodGhhdCkge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzO1xuICAgIGlmICh0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nIHx8IHRvU3RyLmNhbGwodGFyZ2V0KSAhPT0gZnVuY1R5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihFUlJPUl9NRVNTQUdFICsgdGFyZ2V0KTtcbiAgICB9XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICB2YXIgYm91bmQ7XG4gICAgdmFyIGJpbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRhcmdldC5hcHBseShcbiAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhhdCxcbiAgICAgICAgICAgICAgICBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBib3VuZExlbmd0aCA9IE1hdGgubWF4KDAsIHRhcmdldC5sZW5ndGggLSBhcmdzLmxlbmd0aCk7XG4gICAgdmFyIGJvdW5kQXJncyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm91bmRMZW5ndGg7IGkrKykge1xuICAgICAgICBib3VuZEFyZ3MucHVzaCgnJCcgKyBpKTtcbiAgICB9XG5cbiAgICBib3VuZCA9IEZ1bmN0aW9uKCdiaW5kZXInLCAncmV0dXJuIGZ1bmN0aW9uICgnICsgYm91bmRBcmdzLmpvaW4oJywnKSArICcpeyByZXR1cm4gYmluZGVyLmFwcGx5KHRoaXMsYXJndW1lbnRzKTsgfScpKGJpbmRlcik7XG5cbiAgICBpZiAodGFyZ2V0LnByb3RvdHlwZSkge1xuICAgICAgICB2YXIgRW1wdHkgPSBmdW5jdGlvbiBFbXB0eSgpIHt9O1xuICAgICAgICBFbXB0eS5wcm90b3R5cGUgPSB0YXJnZXQucHJvdG90eXBlO1xuICAgICAgICBib3VuZC5wcm90b3R5cGUgPSBuZXcgRW1wdHkoKTtcbiAgICAgICAgRW1wdHkucHJvdG90eXBlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gYm91bmQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW1wbGVtZW50YXRpb24gPSByZXF1aXJlKCcuL2ltcGxlbWVudGF0aW9uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgfHwgaW1wbGVtZW50YXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1bmRlZmluZWQ7XG5cbnZhciAkU3ludGF4RXJyb3IgPSBTeW50YXhFcnJvcjtcbnZhciAkRnVuY3Rpb24gPSBGdW5jdGlvbjtcbnZhciAkVHlwZUVycm9yID0gVHlwZUVycm9yO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbnZhciBnZXRFdmFsbGVkQ29uc3RydWN0b3IgPSBmdW5jdGlvbiAoZXhwcmVzc2lvblN5bnRheCkge1xuXHR0cnkge1xuXHRcdHJldHVybiAkRnVuY3Rpb24oJ1widXNlIHN0cmljdFwiOyByZXR1cm4gKCcgKyBleHByZXNzaW9uU3ludGF4ICsgJykuY29uc3RydWN0b3I7JykoKTtcblx0fSBjYXRjaCAoZSkge31cbn07XG5cbnZhciAkZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5pZiAoJGdPUEQpIHtcblx0dHJ5IHtcblx0XHQkZ09QRCh7fSwgJycpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0JGdPUEQgPSBudWxsOyAvLyB0aGlzIGlzIElFIDgsIHdoaWNoIGhhcyBhIGJyb2tlbiBnT1BEXG5cdH1cbn1cblxudmFyIHRocm93VHlwZUVycm9yID0gZnVuY3Rpb24gKCkge1xuXHR0aHJvdyBuZXcgJFR5cGVFcnJvcigpO1xufTtcbnZhciBUaHJvd1R5cGVFcnJvciA9ICRnT1BEXG5cdD8gKGZ1bmN0aW9uICgpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tY2FsbGVyLCBuby1yZXN0cmljdGVkLXByb3BlcnRpZXNcblx0XHRcdGFyZ3VtZW50cy5jYWxsZWU7IC8vIElFIDggZG9lcyBub3QgdGhyb3cgaGVyZVxuXHRcdFx0cmV0dXJuIHRocm93VHlwZUVycm9yO1xuXHRcdH0gY2F0Y2ggKGNhbGxlZVRocm93cykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gSUUgOCB0aHJvd3Mgb24gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhcmd1bWVudHMsICcnKVxuXHRcdFx0XHRyZXR1cm4gJGdPUEQoYXJndW1lbnRzLCAnY2FsbGVlJykuZ2V0O1xuXHRcdFx0fSBjYXRjaCAoZ09QRHRocm93cykge1xuXHRcdFx0XHRyZXR1cm4gdGhyb3dUeXBlRXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KCkpXG5cdDogdGhyb3dUeXBlRXJyb3I7XG5cbnZhciBoYXNTeW1ib2xzID0gcmVxdWlyZSgnaGFzLXN5bWJvbHMnKSgpO1xudmFyIGhhc1Byb3RvID0gcmVxdWlyZSgnaGFzLXByb3RvJykoKTtcblxudmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IChcblx0aGFzUHJvdG9cblx0XHQ/IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Ll9fcHJvdG9fXzsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvXG5cdFx0OiBudWxsXG4pO1xuXG52YXIgbmVlZHNFdmFsID0ge307XG5cbnZhciBUeXBlZEFycmF5ID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnIHx8ICFnZXRQcm90byA/IHVuZGVmaW5lZCA6IGdldFByb3RvKFVpbnQ4QXJyYXkpO1xuXG52YXIgSU5UUklOU0lDUyA9IHtcblx0JyVBZ2dyZWdhdGVFcnJvciUnOiB0eXBlb2YgQWdncmVnYXRlRXJyb3IgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQWdncmVnYXRlRXJyb3IsXG5cdCclQXJyYXklJzogQXJyYXksXG5cdCclQXJyYXlCdWZmZXIlJzogdHlwZW9mIEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEFycmF5QnVmZmVyLFxuXHQnJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlJzogaGFzU3ltYm9scyAmJiBnZXRQcm90byA/IGdldFByb3RvKFtdW1N5bWJvbC5pdGVyYXRvcl0oKSkgOiB1bmRlZmluZWQsXG5cdCclQXN5bmNGcm9tU3luY0l0ZXJhdG9yUHJvdG90eXBlJSc6IHVuZGVmaW5lZCxcblx0JyVBc3luY0Z1bmN0aW9uJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0dlbmVyYXRvciUnOiBuZWVkc0V2YWwsXG5cdCclQXN5bmNHZW5lcmF0b3JGdW5jdGlvbiUnOiBuZWVkc0V2YWwsXG5cdCclQXN5bmNJdGVyYXRvclByb3RvdHlwZSUnOiBuZWVkc0V2YWwsXG5cdCclQXRvbWljcyUnOiB0eXBlb2YgQXRvbWljcyA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBBdG9taWNzLFxuXHQnJUJpZ0ludCUnOiB0eXBlb2YgQmlnSW50ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEJpZ0ludCxcblx0JyVCaWdJbnQ2NEFycmF5JSc6IHR5cGVvZiBCaWdJbnQ2NEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEJpZ0ludDY0QXJyYXksXG5cdCclQmlnVWludDY0QXJyYXklJzogdHlwZW9mIEJpZ1VpbnQ2NEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEJpZ1VpbnQ2NEFycmF5LFxuXHQnJUJvb2xlYW4lJzogQm9vbGVhbixcblx0JyVEYXRhVmlldyUnOiB0eXBlb2YgRGF0YVZpZXcgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogRGF0YVZpZXcsXG5cdCclRGF0ZSUnOiBEYXRlLFxuXHQnJWRlY29kZVVSSSUnOiBkZWNvZGVVUkksXG5cdCclZGVjb2RlVVJJQ29tcG9uZW50JSc6IGRlY29kZVVSSUNvbXBvbmVudCxcblx0JyVlbmNvZGVVUkklJzogZW5jb2RlVVJJLFxuXHQnJWVuY29kZVVSSUNvbXBvbmVudCUnOiBlbmNvZGVVUklDb21wb25lbnQsXG5cdCclRXJyb3IlJzogRXJyb3IsXG5cdCclZXZhbCUnOiBldmFsLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV2YWxcblx0JyVFdmFsRXJyb3IlJzogRXZhbEVycm9yLFxuXHQnJUZsb2F0MzJBcnJheSUnOiB0eXBlb2YgRmxvYXQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEZsb2F0MzJBcnJheSxcblx0JyVGbG9hdDY0QXJyYXklJzogdHlwZW9mIEZsb2F0NjRBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGbG9hdDY0QXJyYXksXG5cdCclRmluYWxpemF0aW9uUmVnaXN0cnklJzogdHlwZW9mIEZpbmFsaXphdGlvblJlZ2lzdHJ5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEZpbmFsaXphdGlvblJlZ2lzdHJ5LFxuXHQnJUZ1bmN0aW9uJSc6ICRGdW5jdGlvbixcblx0JyVHZW5lcmF0b3JGdW5jdGlvbiUnOiBuZWVkc0V2YWwsXG5cdCclSW50OEFycmF5JSc6IHR5cGVvZiBJbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogSW50OEFycmF5LFxuXHQnJUludDE2QXJyYXklJzogdHlwZW9mIEludDE2QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogSW50MTZBcnJheSxcblx0JyVJbnQzMkFycmF5JSc6IHR5cGVvZiBJbnQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDMyQXJyYXksXG5cdCclaXNGaW5pdGUlJzogaXNGaW5pdGUsXG5cdCclaXNOYU4lJzogaXNOYU4sXG5cdCclSXRlcmF0b3JQcm90b3R5cGUlJzogaGFzU3ltYm9scyAmJiBnZXRQcm90byA/IGdldFByb3RvKGdldFByb3RvKFtdW1N5bWJvbC5pdGVyYXRvcl0oKSkpIDogdW5kZWZpbmVkLFxuXHQnJUpTT04lJzogdHlwZW9mIEpTT04gPT09ICdvYmplY3QnID8gSlNPTiA6IHVuZGVmaW5lZCxcblx0JyVNYXAlJzogdHlwZW9mIE1hcCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBNYXAsXG5cdCclTWFwSXRlcmF0b3JQcm90b3R5cGUlJzogdHlwZW9mIE1hcCA9PT0gJ3VuZGVmaW5lZCcgfHwgIWhhc1N5bWJvbHMgfHwgIWdldFByb3RvID8gdW5kZWZpbmVkIDogZ2V0UHJvdG8obmV3IE1hcCgpW1N5bWJvbC5pdGVyYXRvcl0oKSksXG5cdCclTWF0aCUnOiBNYXRoLFxuXHQnJU51bWJlciUnOiBOdW1iZXIsXG5cdCclT2JqZWN0JSc6IE9iamVjdCxcblx0JyVwYXJzZUZsb2F0JSc6IHBhcnNlRmxvYXQsXG5cdCclcGFyc2VJbnQlJzogcGFyc2VJbnQsXG5cdCclUHJvbWlzZSUnOiB0eXBlb2YgUHJvbWlzZSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBQcm9taXNlLFxuXHQnJVByb3h5JSc6IHR5cGVvZiBQcm94eSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBQcm94eSxcblx0JyVSYW5nZUVycm9yJSc6IFJhbmdlRXJyb3IsXG5cdCclUmVmZXJlbmNlRXJyb3IlJzogUmVmZXJlbmNlRXJyb3IsXG5cdCclUmVmbGVjdCUnOiB0eXBlb2YgUmVmbGVjdCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBSZWZsZWN0LFxuXHQnJVJlZ0V4cCUnOiBSZWdFeHAsXG5cdCclU2V0JSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogU2V0LFxuXHQnJVNldEl0ZXJhdG9yUHJvdG90eXBlJSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNTeW1ib2xzIHx8ICFnZXRQcm90byA/IHVuZGVmaW5lZCA6IGdldFByb3RvKG5ldyBTZXQoKVtTeW1ib2wuaXRlcmF0b3JdKCkpLFxuXHQnJVNoYXJlZEFycmF5QnVmZmVyJSc6IHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBTaGFyZWRBcnJheUJ1ZmZlcixcblx0JyVTdHJpbmclJzogU3RyaW5nLFxuXHQnJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJSc6IGhhc1N5bWJvbHMgJiYgZ2V0UHJvdG8gPyBnZXRQcm90bygnJ1tTeW1ib2wuaXRlcmF0b3JdKCkpIDogdW5kZWZpbmVkLFxuXHQnJVN5bWJvbCUnOiBoYXNTeW1ib2xzID8gU3ltYm9sIDogdW5kZWZpbmVkLFxuXHQnJVN5bnRheEVycm9yJSc6ICRTeW50YXhFcnJvcixcblx0JyVUaHJvd1R5cGVFcnJvciUnOiBUaHJvd1R5cGVFcnJvcixcblx0JyVUeXBlZEFycmF5JSc6IFR5cGVkQXJyYXksXG5cdCclVHlwZUVycm9yJSc6ICRUeXBlRXJyb3IsXG5cdCclVWludDhBcnJheSUnOiB0eXBlb2YgVWludDhBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50OEFycmF5LFxuXHQnJVVpbnQ4Q2xhbXBlZEFycmF5JSc6IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50OENsYW1wZWRBcnJheSxcblx0JyVVaW50MTZBcnJheSUnOiB0eXBlb2YgVWludDE2QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogVWludDE2QXJyYXksXG5cdCclVWludDMyQXJyYXklJzogdHlwZW9mIFVpbnQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFVpbnQzMkFycmF5LFxuXHQnJVVSSUVycm9yJSc6IFVSSUVycm9yLFxuXHQnJVdlYWtNYXAlJzogdHlwZW9mIFdlYWtNYXAgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogV2Vha01hcCxcblx0JyVXZWFrUmVmJSc6IHR5cGVvZiBXZWFrUmVmID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFdlYWtSZWYsXG5cdCclV2Vha1NldCUnOiB0eXBlb2YgV2Vha1NldCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBXZWFrU2V0XG59O1xuXG5pZiAoZ2V0UHJvdG8pIHtcblx0dHJ5IHtcblx0XHRudWxsLmVycm9yOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3RjMzkvcHJvcG9zYWwtc2hhZG93cmVhbG0vcHVsbC8zODQjaXNzdWVjb21tZW50LTEzNjQyNjQyMjlcblx0XHR2YXIgZXJyb3JQcm90byA9IGdldFByb3RvKGdldFByb3RvKGUpKTtcblx0XHRJTlRSSU5TSUNTWyclRXJyb3IucHJvdG90eXBlJSddID0gZXJyb3JQcm90bztcblx0fVxufVxuXG52YXIgZG9FdmFsID0gZnVuY3Rpb24gZG9FdmFsKG5hbWUpIHtcblx0dmFyIHZhbHVlO1xuXHRpZiAobmFtZSA9PT0gJyVBc3luY0Z1bmN0aW9uJScpIHtcblx0XHR2YWx1ZSA9IGdldEV2YWxsZWRDb25zdHJ1Y3RvcignYXN5bmMgZnVuY3Rpb24gKCkge30nKTtcblx0fSBlbHNlIGlmIChuYW1lID09PSAnJUdlbmVyYXRvckZ1bmN0aW9uJScpIHtcblx0XHR2YWx1ZSA9IGdldEV2YWxsZWRDb25zdHJ1Y3RvcignZnVuY3Rpb24qICgpIHt9Jyk7XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVBc3luY0dlbmVyYXRvckZ1bmN0aW9uJScpIHtcblx0XHR2YWx1ZSA9IGdldEV2YWxsZWRDb25zdHJ1Y3RvcignYXN5bmMgZnVuY3Rpb24qICgpIHt9Jyk7XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVBc3luY0dlbmVyYXRvciUnKSB7XG5cdFx0dmFyIGZuID0gZG9FdmFsKCclQXN5bmNHZW5lcmF0b3JGdW5jdGlvbiUnKTtcblx0XHRpZiAoZm4pIHtcblx0XHRcdHZhbHVlID0gZm4ucHJvdG90eXBlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChuYW1lID09PSAnJUFzeW5jSXRlcmF0b3JQcm90b3R5cGUlJykge1xuXHRcdHZhciBnZW4gPSBkb0V2YWwoJyVBc3luY0dlbmVyYXRvciUnKTtcblx0XHRpZiAoZ2VuICYmIGdldFByb3RvKSB7XG5cdFx0XHR2YWx1ZSA9IGdldFByb3RvKGdlbi5wcm90b3R5cGUpO1xuXHRcdH1cblx0fVxuXG5cdElOVFJJTlNJQ1NbbmFtZV0gPSB2YWx1ZTtcblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG52YXIgTEVHQUNZX0FMSUFTRVMgPSB7XG5cdCclQXJyYXlCdWZmZXJQcm90b3R5cGUlJzogWydBcnJheUJ1ZmZlcicsICdwcm90b3R5cGUnXSxcblx0JyVBcnJheVByb3RvdHlwZSUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUFycmF5UHJvdG9fZW50cmllcyUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZScsICdlbnRyaWVzJ10sXG5cdCclQXJyYXlQcm90b19mb3JFYWNoJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ2ZvckVhY2gnXSxcblx0JyVBcnJheVByb3RvX2tleXMlJzogWydBcnJheScsICdwcm90b3R5cGUnLCAna2V5cyddLFxuXHQnJUFycmF5UHJvdG9fdmFsdWVzJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ3ZhbHVlcyddLFxuXHQnJUFzeW5jRnVuY3Rpb25Qcm90b3R5cGUlJzogWydBc3luY0Z1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUFzeW5jR2VuZXJhdG9yJSc6IFsnQXN5bmNHZW5lcmF0b3JGdW5jdGlvbicsICdwcm90b3R5cGUnXSxcblx0JyVBc3luY0dlbmVyYXRvclByb3RvdHlwZSUnOiBbJ0FzeW5jR2VuZXJhdG9yRnVuY3Rpb24nLCAncHJvdG90eXBlJywgJ3Byb3RvdHlwZSddLFxuXHQnJUJvb2xlYW5Qcm90b3R5cGUlJzogWydCb29sZWFuJywgJ3Byb3RvdHlwZSddLFxuXHQnJURhdGFWaWV3UHJvdG90eXBlJSc6IFsnRGF0YVZpZXcnLCAncHJvdG90eXBlJ10sXG5cdCclRGF0ZVByb3RvdHlwZSUnOiBbJ0RhdGUnLCAncHJvdG90eXBlJ10sXG5cdCclRXJyb3JQcm90b3R5cGUlJzogWydFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVFdmFsRXJyb3JQcm90b3R5cGUlJzogWydFdmFsRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclRmxvYXQzMkFycmF5UHJvdG90eXBlJSc6IFsnRmxvYXQzMkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUZsb2F0NjRBcnJheVByb3RvdHlwZSUnOiBbJ0Zsb2F0NjRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVGdW5jdGlvblByb3RvdHlwZSUnOiBbJ0Z1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUdlbmVyYXRvciUnOiBbJ0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUdlbmVyYXRvclByb3RvdHlwZSUnOiBbJ0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZScsICdwcm90b3R5cGUnXSxcblx0JyVJbnQ4QXJyYXlQcm90b3R5cGUlJzogWydJbnQ4QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSW50MTZBcnJheVByb3RvdHlwZSUnOiBbJ0ludDE2QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSW50MzJBcnJheVByb3RvdHlwZSUnOiBbJ0ludDMyQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSlNPTlBhcnNlJSc6IFsnSlNPTicsICdwYXJzZSddLFxuXHQnJUpTT05TdHJpbmdpZnklJzogWydKU09OJywgJ3N0cmluZ2lmeSddLFxuXHQnJU1hcFByb3RvdHlwZSUnOiBbJ01hcCcsICdwcm90b3R5cGUnXSxcblx0JyVOdW1iZXJQcm90b3R5cGUlJzogWydOdW1iZXInLCAncHJvdG90eXBlJ10sXG5cdCclT2JqZWN0UHJvdG90eXBlJSc6IFsnT2JqZWN0JywgJ3Byb3RvdHlwZSddLFxuXHQnJU9ialByb3RvX3RvU3RyaW5nJSc6IFsnT2JqZWN0JywgJ3Byb3RvdHlwZScsICd0b1N0cmluZyddLFxuXHQnJU9ialByb3RvX3ZhbHVlT2YlJzogWydPYmplY3QnLCAncHJvdG90eXBlJywgJ3ZhbHVlT2YnXSxcblx0JyVQcm9taXNlUHJvdG90eXBlJSc6IFsnUHJvbWlzZScsICdwcm90b3R5cGUnXSxcblx0JyVQcm9taXNlUHJvdG9fdGhlbiUnOiBbJ1Byb21pc2UnLCAncHJvdG90eXBlJywgJ3RoZW4nXSxcblx0JyVQcm9taXNlX2FsbCUnOiBbJ1Byb21pc2UnLCAnYWxsJ10sXG5cdCclUHJvbWlzZV9yZWplY3QlJzogWydQcm9taXNlJywgJ3JlamVjdCddLFxuXHQnJVByb21pc2VfcmVzb2x2ZSUnOiBbJ1Byb21pc2UnLCAncmVzb2x2ZSddLFxuXHQnJVJhbmdlRXJyb3JQcm90b3R5cGUlJzogWydSYW5nZUVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVJlZmVyZW5jZUVycm9yUHJvdG90eXBlJSc6IFsnUmVmZXJlbmNlRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclUmVnRXhwUHJvdG90eXBlJSc6IFsnUmVnRXhwJywgJ3Byb3RvdHlwZSddLFxuXHQnJVNldFByb3RvdHlwZSUnOiBbJ1NldCcsICdwcm90b3R5cGUnXSxcblx0JyVTaGFyZWRBcnJheUJ1ZmZlclByb3RvdHlwZSUnOiBbJ1NoYXJlZEFycmF5QnVmZmVyJywgJ3Byb3RvdHlwZSddLFxuXHQnJVN0cmluZ1Byb3RvdHlwZSUnOiBbJ1N0cmluZycsICdwcm90b3R5cGUnXSxcblx0JyVTeW1ib2xQcm90b3R5cGUlJzogWydTeW1ib2wnLCAncHJvdG90eXBlJ10sXG5cdCclU3ludGF4RXJyb3JQcm90b3R5cGUlJzogWydTeW50YXhFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVUeXBlZEFycmF5UHJvdG90eXBlJSc6IFsnVHlwZWRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVUeXBlRXJyb3JQcm90b3R5cGUlJzogWydUeXBlRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclVWludDhBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQ4QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVWludDhDbGFtcGVkQXJyYXlQcm90b3R5cGUlJzogWydVaW50OENsYW1wZWRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVVaW50MTZBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQxNkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVVpbnQzMkFycmF5UHJvdG90eXBlJSc6IFsnVWludDMyQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVVJJRXJyb3JQcm90b3R5cGUlJzogWydVUklFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVXZWFrTWFwUHJvdG90eXBlJSc6IFsnV2Vha01hcCcsICdwcm90b3R5cGUnXSxcblx0JyVXZWFrU2V0UHJvdG90eXBlJSc6IFsnV2Vha1NldCcsICdwcm90b3R5cGUnXVxufTtcblxudmFyIGJpbmQgPSByZXF1aXJlKCdmdW5jdGlvbi1iaW5kJyk7XG52YXIgaGFzT3duID0gcmVxdWlyZSgnaGFzJyk7XG52YXIgJGNvbmNhdCA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBBcnJheS5wcm90b3R5cGUuY29uY2F0KTtcbnZhciAkc3BsaWNlQXBwbHkgPSBiaW5kLmNhbGwoRnVuY3Rpb24uYXBwbHksIEFycmF5LnByb3RvdHlwZS5zcGxpY2UpO1xudmFyICRyZXBsYWNlID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSk7XG52YXIgJHN0clNsaWNlID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFN0cmluZy5wcm90b3R5cGUuc2xpY2UpO1xudmFyICRleGVjID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFJlZ0V4cC5wcm90b3R5cGUuZXhlYyk7XG5cbi8qIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaC9ibG9iLzQuMTcuMTUvZGlzdC9sb2Rhc2guanMjTDY3MzUtTDY3NDQgKi9cbnZhciByZVByb3BOYW1lID0gL1teJS5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwlJCkpL2c7XG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7IC8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IGZ1bmN0aW9uIHN0cmluZ1RvUGF0aChzdHJpbmcpIHtcblx0dmFyIGZpcnN0ID0gJHN0clNsaWNlKHN0cmluZywgMCwgMSk7XG5cdHZhciBsYXN0ID0gJHN0clNsaWNlKHN0cmluZywgLTEpO1xuXHRpZiAoZmlyc3QgPT09ICclJyAmJiBsYXN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIGNsb3NpbmcgYCVgJyk7XG5cdH0gZWxzZSBpZiAobGFzdCA9PT0gJyUnICYmIGZpcnN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIG9wZW5pbmcgYCVgJyk7XG5cdH1cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHQkcmVwbGFjZShzdHJpbmcsIHJlUHJvcE5hbWUsIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3ViU3RyaW5nKSB7XG5cdFx0cmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gcXVvdGUgPyAkcmVwbGFjZShzdWJTdHJpbmcsIHJlRXNjYXBlQ2hhciwgJyQxJykgOiBudW1iZXIgfHwgbWF0Y2g7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcbi8qIGVuZCBhZGFwdGF0aW9uICovXG5cbnZhciBnZXRCYXNlSW50cmluc2ljID0gZnVuY3Rpb24gZ2V0QmFzZUludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0dmFyIGludHJpbnNpY05hbWUgPSBuYW1lO1xuXHR2YXIgYWxpYXM7XG5cdGlmIChoYXNPd24oTEVHQUNZX0FMSUFTRVMsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0YWxpYXMgPSBMRUdBQ1lfQUxJQVNFU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpbnRyaW5zaWNOYW1lID0gJyUnICsgYWxpYXNbMF0gKyAnJSc7XG5cdH1cblxuXHRpZiAoaGFzT3duKElOVFJJTlNJQ1MsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0dmFyIHZhbHVlID0gSU5UUklOU0lDU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpZiAodmFsdWUgPT09IG5lZWRzRXZhbCkge1xuXHRcdFx0dmFsdWUgPSBkb0V2YWwoaW50cmluc2ljTmFtZSk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICYmICFhbGxvd01pc3NpbmcpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgJyArIG5hbWUgKyAnIGV4aXN0cywgYnV0IGlzIG5vdCBhdmFpbGFibGUuIFBsZWFzZSBmaWxlIGFuIGlzc3VlIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRhbGlhczogYWxpYXMsXG5cdFx0XHRuYW1lOiBpbnRyaW5zaWNOYW1lLFxuXHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0fTtcblx0fVxuXG5cdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ2ludHJpbnNpYyAnICsgbmFtZSArICcgZG9lcyBub3QgZXhpc3QhJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdldEludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0aWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgbmFtZSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xuXHR9XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYWxsb3dNaXNzaW5nICE9PSAnYm9vbGVhbicpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignXCJhbGxvd01pc3NpbmdcIiBhcmd1bWVudCBtdXN0IGJlIGEgYm9vbGVhbicpO1xuXHR9XG5cblx0aWYgKCRleGVjKC9eJT9bXiVdKiU/JC8sIG5hbWUpID09PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcignYCVgIG1heSBub3QgYmUgcHJlc2VudCBhbnl3aGVyZSBidXQgYXQgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBpbnRyaW5zaWMgbmFtZScpO1xuXHR9XG5cdHZhciBwYXJ0cyA9IHN0cmluZ1RvUGF0aChuYW1lKTtcblx0dmFyIGludHJpbnNpY0Jhc2VOYW1lID0gcGFydHMubGVuZ3RoID4gMCA/IHBhcnRzWzBdIDogJyc7XG5cblx0dmFyIGludHJpbnNpYyA9IGdldEJhc2VJbnRyaW5zaWMoJyUnICsgaW50cmluc2ljQmFzZU5hbWUgKyAnJScsIGFsbG93TWlzc2luZyk7XG5cdHZhciBpbnRyaW5zaWNSZWFsTmFtZSA9IGludHJpbnNpYy5uYW1lO1xuXHR2YXIgdmFsdWUgPSBpbnRyaW5zaWMudmFsdWU7XG5cdHZhciBza2lwRnVydGhlckNhY2hpbmcgPSBmYWxzZTtcblxuXHR2YXIgYWxpYXMgPSBpbnRyaW5zaWMuYWxpYXM7XG5cdGlmIChhbGlhcykge1xuXHRcdGludHJpbnNpY0Jhc2VOYW1lID0gYWxpYXNbMF07XG5cdFx0JHNwbGljZUFwcGx5KHBhcnRzLCAkY29uY2F0KFswLCAxXSwgYWxpYXMpKTtcblx0fVxuXG5cdGZvciAodmFyIGkgPSAxLCBpc093biA9IHRydWU7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdHZhciBwYXJ0ID0gcGFydHNbaV07XG5cdFx0dmFyIGZpcnN0ID0gJHN0clNsaWNlKHBhcnQsIDAsIDEpO1xuXHRcdHZhciBsYXN0ID0gJHN0clNsaWNlKHBhcnQsIC0xKTtcblx0XHRpZiAoXG5cdFx0XHQoXG5cdFx0XHRcdChmaXJzdCA9PT0gJ1wiJyB8fCBmaXJzdCA9PT0gXCInXCIgfHwgZmlyc3QgPT09ICdgJylcblx0XHRcdFx0fHwgKGxhc3QgPT09ICdcIicgfHwgbGFzdCA9PT0gXCInXCIgfHwgbGFzdCA9PT0gJ2AnKVxuXHRcdFx0KVxuXHRcdFx0JiYgZmlyc3QgIT09IGxhc3Rcblx0XHQpIHtcblx0XHRcdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ3Byb3BlcnR5IG5hbWVzIHdpdGggcXVvdGVzIG11c3QgaGF2ZSBtYXRjaGluZyBxdW90ZXMnKTtcblx0XHR9XG5cdFx0aWYgKHBhcnQgPT09ICdjb25zdHJ1Y3RvcicgfHwgIWlzT3duKSB7XG5cdFx0XHRza2lwRnVydGhlckNhY2hpbmcgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGludHJpbnNpY0Jhc2VOYW1lICs9ICcuJyArIHBhcnQ7XG5cdFx0aW50cmluc2ljUmVhbE5hbWUgPSAnJScgKyBpbnRyaW5zaWNCYXNlTmFtZSArICclJztcblxuXHRcdGlmIChoYXNPd24oSU5UUklOU0lDUywgaW50cmluc2ljUmVhbE5hbWUpKSB7XG5cdFx0XHR2YWx1ZSA9IElOVFJJTlNJQ1NbaW50cmluc2ljUmVhbE5hbWVdO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0aWYgKCEocGFydCBpbiB2YWx1ZSkpIHtcblx0XHRcdFx0aWYgKCFhbGxvd01pc3NpbmcpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignYmFzZSBpbnRyaW5zaWMgZm9yICcgKyBuYW1lICsgJyBleGlzdHMsIGJ1dCB0aGUgcHJvcGVydHkgaXMgbm90IGF2YWlsYWJsZS4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdm9pZCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoJGdPUEQgJiYgKGkgKyAxKSA+PSBwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdFx0dmFyIGRlc2MgPSAkZ09QRCh2YWx1ZSwgcGFydCk7XG5cdFx0XHRcdGlzT3duID0gISFkZXNjO1xuXG5cdFx0XHRcdC8vIEJ5IGNvbnZlbnRpb24sIHdoZW4gYSBkYXRhIHByb3BlcnR5IGlzIGNvbnZlcnRlZCB0byBhbiBhY2Nlc3NvclxuXHRcdFx0XHQvLyBwcm9wZXJ0eSB0byBlbXVsYXRlIGEgZGF0YSBwcm9wZXJ0eSB0aGF0IGRvZXMgbm90IHN1ZmZlciBmcm9tXG5cdFx0XHRcdC8vIHRoZSBvdmVycmlkZSBtaXN0YWtlLCB0aGF0IGFjY2Vzc29yJ3MgZ2V0dGVyIGlzIG1hcmtlZCB3aXRoXG5cdFx0XHRcdC8vIGFuIGBvcmlnaW5hbFZhbHVlYCBwcm9wZXJ0eS4gSGVyZSwgd2hlbiB3ZSBkZXRlY3QgdGhpcywgd2Vcblx0XHRcdFx0Ly8gdXBob2xkIHRoZSBpbGx1c2lvbiBieSBwcmV0ZW5kaW5nIHRvIHNlZSB0aGF0IG9yaWdpbmFsIGRhdGFcblx0XHRcdFx0Ly8gcHJvcGVydHksIGkuZS4sIHJldHVybmluZyB0aGUgdmFsdWUgcmF0aGVyIHRoYW4gdGhlIGdldHRlclxuXHRcdFx0XHQvLyBpdHNlbGYuXG5cdFx0XHRcdGlmIChpc093biAmJiAnZ2V0JyBpbiBkZXNjICYmICEoJ29yaWdpbmFsVmFsdWUnIGluIGRlc2MuZ2V0KSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZGVzYy5nZXQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZVtwYXJ0XTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNPd24gPSBoYXNPd24odmFsdWUsIHBhcnQpO1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlW3BhcnRdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNPd24gJiYgIXNraXBGdXJ0aGVyQ2FjaGluZykge1xuXHRcdFx0XHRJTlRSSU5TSUNTW2ludHJpbnNpY1JlYWxOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiLyogZXNsaW50IG5vLW5lZ2F0ZWQtY29uZGl0aW9uOiAwLCBuby1uZXctZnVuYzogMCAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0bW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSB7XG5cdG1vZHVsZS5leHBvcnRzID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKCdkZWZpbmUtcHJvcGVydGllcycpO1xuXG52YXIgaW1wbGVtZW50YXRpb24gPSByZXF1aXJlKCcuL2ltcGxlbWVudGF0aW9uJyk7XG52YXIgZ2V0UG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG52YXIgc2hpbSA9IHJlcXVpcmUoJy4vc2hpbScpO1xuXG52YXIgcG9seWZpbGwgPSBnZXRQb2x5ZmlsbCgpO1xuXG52YXIgZ2V0R2xvYmFsID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcG9seWZpbGw7IH07XG5cbmRlZmluZVByb3BlcnRpZXMoZ2V0R2xvYmFsLCB7XG5cdGdldFBvbHlmaWxsOiBnZXRQb2x5ZmlsbCxcblx0aW1wbGVtZW50YXRpb246IGltcGxlbWVudGF0aW9uLFxuXHRzaGltOiBzaGltXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRHbG9iYWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRQb2x5ZmlsbCgpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWwgIT09ICdvYmplY3QnIHx8ICFnbG9iYWwgfHwgZ2xvYmFsLk1hdGggIT09IE1hdGggfHwgZ2xvYmFsLkFycmF5ICE9PSBBcnJheSkge1xuXHRcdHJldHVybiBpbXBsZW1lbnRhdGlvbjtcblx0fVxuXHRyZXR1cm4gZ2xvYmFsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmluZSA9IHJlcXVpcmUoJ2RlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZ2V0UG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2hpbUdsb2JhbCgpIHtcblx0dmFyIHBvbHlmaWxsID0gZ2V0UG9seWZpbGwoKTtcblx0aWYgKGRlZmluZS5zdXBwb3J0c0Rlc2NyaXB0b3JzKSB7XG5cdFx0dmFyIGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHBvbHlmaWxsLCAnZ2xvYmFsVGhpcycpO1xuXHRcdGlmICghZGVzY3JpcHRvciB8fCAoZGVzY3JpcHRvci5jb25maWd1cmFibGUgJiYgKGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCAhZGVzY3JpcHRvci53cml0YWJsZSB8fCBnbG9iYWxUaGlzICE9PSBwb2x5ZmlsbCkpKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbWF4LWxlblxuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHBvbHlmaWxsLCAnZ2xvYmFsVGhpcycsIHtcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0dmFsdWU6IHBvbHlmaWxsLFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSAnb2JqZWN0JyB8fCBnbG9iYWxUaGlzICE9PSBwb2x5ZmlsbCkge1xuXHRcdHBvbHlmaWxsLmdsb2JhbFRoaXMgPSBwb2x5ZmlsbDtcblx0fVxuXHRyZXR1cm4gcG9seWZpbGw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnZ2V0LWludHJpbnNpYycpO1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gR2V0SW50cmluc2ljKCclT2JqZWN0LmRlZmluZVByb3BlcnR5JScsIHRydWUpO1xuXG52YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9ycyA9IGZ1bmN0aW9uIGhhc1Byb3BlcnR5RGVzY3JpcHRvcnMoKSB7XG5cdGlmICgkZGVmaW5lUHJvcGVydHkpIHtcblx0XHR0cnkge1xuXHRcdFx0JGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgdmFsdWU6IDEgfSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvLyBJRSA4IGhhcyBhIGJyb2tlbiBkZWZpbmVQcm9wZXJ0eVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5oYXNQcm9wZXJ0eURlc2NyaXB0b3JzLmhhc0FycmF5TGVuZ3RoRGVmaW5lQnVnID0gZnVuY3Rpb24gaGFzQXJyYXlMZW5ndGhEZWZpbmVCdWcoKSB7XG5cdC8vIG5vZGUgdjAuNiBoYXMgYSBidWcgd2hlcmUgYXJyYXkgbGVuZ3RocyBjYW4gYmUgU2V0IGJ1dCBub3QgRGVmaW5lZFxuXHRpZiAoIWhhc1Byb3BlcnR5RGVzY3JpcHRvcnMoKSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cdHRyeSB7XG5cdFx0cmV0dXJuICRkZWZpbmVQcm9wZXJ0eShbXSwgJ2xlbmd0aCcsIHsgdmFsdWU6IDEgfSkubGVuZ3RoICE9PSAxO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gSW4gRmlyZWZveCA0LTIyLCBkZWZpbmluZyBsZW5ndGggb24gYW4gYXJyYXkgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBoYXNQcm9wZXJ0eURlc2NyaXB0b3JzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdGVzdCA9IHtcblx0Zm9vOiB7fVxufTtcblxudmFyICRPYmplY3QgPSBPYmplY3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzUHJvdG8oKSB7XG5cdHJldHVybiB7IF9fcHJvdG9fXzogdGVzdCB9LmZvbyA9PT0gdGVzdC5mb28gJiYgISh7IF9fcHJvdG9fXzogbnVsbCB9IGluc3RhbmNlb2YgJE9iamVjdCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3JpZ1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbDtcbnZhciBoYXNTeW1ib2xTaGFtID0gcmVxdWlyZSgnLi9zaGFtcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhc05hdGl2ZVN5bWJvbHMoKSB7XG5cdGlmICh0eXBlb2Ygb3JpZ1N5bWJvbCAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBTeW1ib2wgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2Ygb3JpZ1N5bWJvbCgnZm9vJykgIT09ICdzeW1ib2wnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAodHlwZW9mIFN5bWJvbCgnYmFyJykgIT09ICdzeW1ib2wnKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHJldHVybiBoYXNTeW1ib2xTaGFtKCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQgY29tcGxleGl0eTogWzIsIDE4XSwgbWF4LXN0YXRlbWVudHM6IFsyLCAzM10gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzU3ltYm9scygpIHtcblx0aWYgKHR5cGVvZiBTeW1ib2wgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSAnc3ltYm9sJykgeyByZXR1cm4gdHJ1ZTsgfVxuXG5cdHZhciBvYmogPSB7fTtcblx0dmFyIHN5bSA9IFN5bWJvbCgndGVzdCcpO1xuXHR2YXIgc3ltT2JqID0gT2JqZWN0KHN5bSk7XG5cdGlmICh0eXBlb2Ygc3ltID09PSAnc3RyaW5nJykgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bSkgIT09ICdbb2JqZWN0IFN5bWJvbF0nKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bU9iaikgIT09ICdbb2JqZWN0IFN5bWJvbF0nKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdC8vIHRlbXAgZGlzYWJsZWQgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9samhhcmIvb2JqZWN0LmFzc2lnbi9pc3N1ZXMvMTdcblx0Ly8gaWYgKHN5bSBpbnN0YW5jZW9mIFN5bWJvbCkgeyByZXR1cm4gZmFsc2U7IH1cblx0Ly8gdGVtcCBkaXNhYmxlZCBwZXIgaHR0cHM6Ly9naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzL2lzc3Vlcy80XG5cdC8vIGlmICghKHN5bU9iaiBpbnN0YW5jZW9mIFN5bWJvbCkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0Ly8gaWYgKHR5cGVvZiBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nICE9PSAnZnVuY3Rpb24nKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvLyBpZiAoU3RyaW5nKHN5bSkgIT09IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzeW0pKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHZhciBzeW1WYWwgPSA0Mjtcblx0b2JqW3N5bV0gPSBzeW1WYWw7XG5cdGZvciAoc3ltIGluIG9iaikgeyByZXR1cm4gZmFsc2U7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheCwgbm8tdW5yZWFjaGFibGUtbG9vcFxuXHRpZiAodHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoICE9PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgPT09ICdmdW5jdGlvbicgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0dmFyIHN5bXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iaik7XG5cdGlmIChzeW1zLmxlbmd0aCAhPT0gMSB8fCBzeW1zWzBdICE9PSBzeW0pIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKCFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqLCBzeW0pKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHN5bSk7XG5cdFx0aWYgKGRlc2NyaXB0b3IudmFsdWUgIT09IHN5bVZhbCB8fCBkZXNjcmlwdG9yLmVudW1lcmFibGUgIT09IHRydWUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnZnVuY3Rpb24tYmluZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgVzNDIFNPRlRXQVJFIEFORCBET0NVTUVOVCBOT1RJQ0UgQU5EIExJQ0VOU0UuXG4gKlxuICogIGh0dHBzOi8vd3d3LnczLm9yZy9Db25zb3J0aXVtL0xlZ2FsLzIwMTUvY29weXJpZ2h0LXNvZnR3YXJlLWFuZC1kb2N1bWVudFxuICpcbiAqL1xuKGZ1bmN0aW9uKCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyBFeGl0IGVhcmx5IGlmIHdlJ3JlIG5vdCBydW5uaW5nIGluIGEgYnJvd3Nlci5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0Jykge1xuICByZXR1cm47XG59XG5cbi8vIEV4aXQgZWFybHkgaWYgYWxsIEludGVyc2VjdGlvbk9ic2VydmVyIGFuZCBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5XG4vLyBmZWF0dXJlcyBhcmUgbmF0aXZlbHkgc3VwcG9ydGVkLlxuaWYgKCdJbnRlcnNlY3Rpb25PYnNlcnZlcicgaW4gd2luZG93ICYmXG4gICAgJ0ludGVyc2VjdGlvbk9ic2VydmVyRW50cnknIGluIHdpbmRvdyAmJlxuICAgICdpbnRlcnNlY3Rpb25SYXRpbycgaW4gd2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlKSB7XG5cbiAgLy8gTWluaW1hbCBwb2x5ZmlsbCBmb3IgRWRnZSAxNSdzIGxhY2sgb2YgYGlzSW50ZXJzZWN0aW5nYFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS93M2MvSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvaXNzdWVzLzIxMVxuICBpZiAoISgnaXNJbnRlcnNlY3RpbmcnIGluIHdpbmRvdy5JbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5LnByb3RvdHlwZSkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyRW50cnkucHJvdG90eXBlLFxuICAgICAgJ2lzSW50ZXJzZWN0aW5nJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVyc2VjdGlvblJhdGlvID4gMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm47XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZW1iZWRkaW5nIGZyYW1lIGVsZW1lbnQsIGlmIGFueS5cbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4geyFFbGVtZW50fVxuICovXG5mdW5jdGlvbiBnZXRGcmFtZUVsZW1lbnQoZG9jKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRvYy5kZWZhdWx0VmlldyAmJiBkb2MuZGVmYXVsdFZpZXcuZnJhbWVFbGVtZW50IHx8IG51bGw7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUgdGhlIGVycm9yLlxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQSBsb2NhbCByZWZlcmVuY2UgdG8gdGhlIHJvb3QgZG9jdW1lbnQuXG4gKi9cbnZhciBkb2N1bWVudCA9IChmdW5jdGlvbihzdGFydERvYykge1xuICB2YXIgZG9jID0gc3RhcnREb2M7XG4gIHZhciBmcmFtZSA9IGdldEZyYW1lRWxlbWVudChkb2MpO1xuICB3aGlsZSAoZnJhbWUpIHtcbiAgICBkb2MgPSBmcmFtZS5vd25lckRvY3VtZW50O1xuICAgIGZyYW1lID0gZ2V0RnJhbWVFbGVtZW50KGRvYyk7XG4gIH1cbiAgcmV0dXJuIGRvYztcbn0pKHdpbmRvdy5kb2N1bWVudCk7XG5cbi8qKlxuICogQW4gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgcmVnaXN0cnkuIFRoaXMgcmVnaXN0cnkgZXhpc3RzIHRvIGhvbGQgYSBzdHJvbmdcbiAqIHJlZmVyZW5jZSB0byBJbnRlcnNlY3Rpb25PYnNlcnZlciBpbnN0YW5jZXMgY3VycmVudGx5IG9ic2VydmluZyBhIHRhcmdldFxuICogZWxlbWVudC4gV2l0aG91dCB0aGlzIHJlZ2lzdHJ5LCBpbnN0YW5jZXMgd2l0aG91dCBhbm90aGVyIHJlZmVyZW5jZSBtYXkgYmVcbiAqIGdhcmJhZ2UgY29sbGVjdGVkLlxuICovXG52YXIgcmVnaXN0cnkgPSBbXTtcblxuLyoqXG4gKiBUaGUgc2lnbmFsIHVwZGF0ZXIgZm9yIGNyb3NzLW9yaWdpbiBpbnRlcnNlY3Rpb24uIFdoZW4gbm90IG51bGwsIGl0IG1lYW5zXG4gKiB0aGF0IHRoZSBwb2x5ZmlsbCBpcyBjb25maWd1cmVkIHRvIHdvcmsgaW4gYSBjcm9zcy1vcmlnaW4gbW9kZS5cbiAqIEB0eXBlIHtmdW5jdGlvbihET01SZWN0fENsaWVudFJlY3QsIERPTVJlY3R8Q2xpZW50UmVjdCl9XG4gKi9cbnZhciBjcm9zc09yaWdpblVwZGF0ZXIgPSBudWxsO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50IGNyb3NzLW9yaWdpbiBpbnRlcnNlY3Rpb24uIE9ubHkgdXNlZCBpbiB0aGUgY3Jvc3Mtb3JpZ2luIG1vZGUuXG4gKiBAdHlwZSB7RE9NUmVjdHxDbGllbnRSZWN0fVxuICovXG52YXIgY3Jvc3NPcmlnaW5SZWN0ID0gbnVsbDtcblxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGdsb2JhbCBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5IGNvbnN0cnVjdG9yLlxuICogaHR0cHM6Ly93M2MuZ2l0aHViLmlvL0ludGVyc2VjdGlvbk9ic2VydmVyLyNpbnRlcnNlY3Rpb24tb2JzZXJ2ZXItZW50cnlcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSBBIGRpY3Rpb25hcnkgb2YgaW5zdGFuY2UgcHJvcGVydGllcy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5KGVudHJ5KSB7XG4gIHRoaXMudGltZSA9IGVudHJ5LnRpbWU7XG4gIHRoaXMudGFyZ2V0ID0gZW50cnkudGFyZ2V0O1xuICB0aGlzLnJvb3RCb3VuZHMgPSBlbnN1cmVET01SZWN0KGVudHJ5LnJvb3RCb3VuZHMpO1xuICB0aGlzLmJvdW5kaW5nQ2xpZW50UmVjdCA9IGVuc3VyZURPTVJlY3QoZW50cnkuYm91bmRpbmdDbGllbnRSZWN0KTtcbiAgdGhpcy5pbnRlcnNlY3Rpb25SZWN0ID0gZW5zdXJlRE9NUmVjdChlbnRyeS5pbnRlcnNlY3Rpb25SZWN0IHx8IGdldEVtcHR5UmVjdCgpKTtcbiAgdGhpcy5pc0ludGVyc2VjdGluZyA9ICEhZW50cnkuaW50ZXJzZWN0aW9uUmVjdDtcblxuICAvLyBDYWxjdWxhdGVzIHRoZSBpbnRlcnNlY3Rpb24gcmF0aW8uXG4gIHZhciB0YXJnZXRSZWN0ID0gdGhpcy5ib3VuZGluZ0NsaWVudFJlY3Q7XG4gIHZhciB0YXJnZXRBcmVhID0gdGFyZ2V0UmVjdC53aWR0aCAqIHRhcmdldFJlY3QuaGVpZ2h0O1xuICB2YXIgaW50ZXJzZWN0aW9uUmVjdCA9IHRoaXMuaW50ZXJzZWN0aW9uUmVjdDtcbiAgdmFyIGludGVyc2VjdGlvbkFyZWEgPSBpbnRlcnNlY3Rpb25SZWN0LndpZHRoICogaW50ZXJzZWN0aW9uUmVjdC5oZWlnaHQ7XG5cbiAgLy8gU2V0cyBpbnRlcnNlY3Rpb24gcmF0aW8uXG4gIGlmICh0YXJnZXRBcmVhKSB7XG4gICAgLy8gUm91bmQgdGhlIGludGVyc2VjdGlvbiByYXRpbyB0byBhdm9pZCBmbG9hdGluZyBwb2ludCBtYXRoIGlzc3VlczpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdzNjL0ludGVyc2VjdGlvbk9ic2VydmVyL2lzc3Vlcy8zMjRcbiAgICB0aGlzLmludGVyc2VjdGlvblJhdGlvID0gTnVtYmVyKChpbnRlcnNlY3Rpb25BcmVhIC8gdGFyZ2V0QXJlYSkudG9GaXhlZCg0KSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgYXJlYSBpcyB6ZXJvIGFuZCBpcyBpbnRlcnNlY3RpbmcsIHNldHMgdG8gMSwgb3RoZXJ3aXNlIHRvIDBcbiAgICB0aGlzLmludGVyc2VjdGlvblJhdGlvID0gdGhpcy5pc0ludGVyc2VjdGluZyA/IDEgOiAwO1xuICB9XG59XG5cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBnbG9iYWwgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgY29uc3RydWN0b3IuXG4gKiBodHRwczovL3czYy5naXRodWIuaW8vSW50ZXJzZWN0aW9uT2JzZXJ2ZXIvI2ludGVyc2VjdGlvbi1vYnNlcnZlci1pbnRlcmZhY2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIGFmdGVyIGludGVyc2VjdGlvblxuICogICAgIGNoYW5nZXMgaGF2ZSBxdWV1ZWQuIFRoZSBmdW5jdGlvbiBpcyBub3QgaW52b2tlZCBpZiB0aGUgcXVldWUgaGFzXG4gKiAgICAgYmVlbiBlbXB0aWVkIGJ5IGNhbGxpbmcgdGhlIGB0YWtlUmVjb3Jkc2AgbWV0aG9kLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfb3B0aW9ucyBPcHRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoY2FsbGJhY2ssIG9wdF9vcHRpb25zKSB7XG5cbiAgdmFyIG9wdGlvbnMgPSBvcHRfb3B0aW9ucyB8fCB7fTtcblxuICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICB9XG5cbiAgaWYgKFxuICAgIG9wdGlvbnMucm9vdCAmJlxuICAgIG9wdGlvbnMucm9vdC5ub2RlVHlwZSAhPSAxICYmXG4gICAgb3B0aW9ucy5yb290Lm5vZGVUeXBlICE9IDlcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyb290IG11c3QgYmUgYSBEb2N1bWVudCBvciBFbGVtZW50Jyk7XG4gIH1cblxuICAvLyBCaW5kcyBhbmQgdGhyb3R0bGVzIGB0aGlzLl9jaGVja0ZvckludGVyc2VjdGlvbnNgLlxuICB0aGlzLl9jaGVja0ZvckludGVyc2VjdGlvbnMgPSB0aHJvdHRsZShcbiAgICAgIHRoaXMuX2NoZWNrRm9ySW50ZXJzZWN0aW9ucy5iaW5kKHRoaXMpLCB0aGlzLlRIUk9UVExFX1RJTUVPVVQpO1xuXG4gIC8vIFByaXZhdGUgcHJvcGVydGllcy5cbiAgdGhpcy5fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgdGhpcy5fb2JzZXJ2YXRpb25UYXJnZXRzID0gW107XG4gIHRoaXMuX3F1ZXVlZEVudHJpZXMgPSBbXTtcbiAgdGhpcy5fcm9vdE1hcmdpblZhbHVlcyA9IHRoaXMuX3BhcnNlUm9vdE1hcmdpbihvcHRpb25zLnJvb3RNYXJnaW4pO1xuXG4gIC8vIFB1YmxpYyBwcm9wZXJ0aWVzLlxuICB0aGlzLnRocmVzaG9sZHMgPSB0aGlzLl9pbml0VGhyZXNob2xkcyhvcHRpb25zLnRocmVzaG9sZCk7XG4gIHRoaXMucm9vdCA9IG9wdGlvbnMucm9vdCB8fCBudWxsO1xuICB0aGlzLnJvb3RNYXJnaW4gPSB0aGlzLl9yb290TWFyZ2luVmFsdWVzLm1hcChmdW5jdGlvbihtYXJnaW4pIHtcbiAgICByZXR1cm4gbWFyZ2luLnZhbHVlICsgbWFyZ2luLnVuaXQ7XG4gIH0pLmpvaW4oJyAnKTtcblxuICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8IURvY3VtZW50Pn0gKi9cbiAgdGhpcy5fbW9uaXRvcmluZ0RvY3VtZW50cyA9IFtdO1xuICAvKiogQHByaXZhdGUgQGNvbnN0IHshQXJyYXk8ZnVuY3Rpb24oKT59ICovXG4gIHRoaXMuX21vbml0b3JpbmdVbnN1YnNjcmliZXMgPSBbXTtcbn1cblxuXG4vKipcbiAqIFRoZSBtaW5pbXVtIGludGVydmFsIHdpdGhpbiB3aGljaCB0aGUgZG9jdW1lbnQgd2lsbCBiZSBjaGVja2VkIGZvclxuICogaW50ZXJzZWN0aW9uIGNoYW5nZXMuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5USFJPVFRMRV9USU1FT1VUID0gMTAwO1xuXG5cbi8qKlxuICogVGhlIGZyZXF1ZW5jeSBpbiB3aGljaCB0aGUgcG9seWZpbGwgcG9sbHMgZm9yIGludGVyc2VjdGlvbiBjaGFuZ2VzLlxuICogdGhpcyBjYW4gYmUgdXBkYXRlZCBvbiBhIHBlciBpbnN0YW5jZSBiYXNpcyBhbmQgbXVzdCBiZSBzZXQgcHJpb3IgdG9cbiAqIGNhbGxpbmcgYG9ic2VydmVgIG9uIHRoZSBmaXJzdCB0YXJnZXQuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5QT0xMX0lOVEVSVkFMID0gbnVsbDtcblxuLyoqXG4gKiBVc2UgYSBtdXRhdGlvbiBvYnNlcnZlciBvbiB0aGUgcm9vdCBlbGVtZW50XG4gKiB0byBkZXRlY3QgaW50ZXJzZWN0aW9uIGNoYW5nZXMuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5VU0VfTVVUQVRJT05fT0JTRVJWRVIgPSB0cnVlO1xuXG5cbi8qKlxuICogU2V0cyB1cCB0aGUgcG9seWZpbGwgaW4gdGhlIGNyb3NzLW9yaWdpbiBtb2RlLiBUaGUgcmVzdWx0IGlzIHRoZVxuICogdXBkYXRlciBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgdHdvIGFyZ3VtZW50czogYGJvdW5kaW5nQ2xpZW50UmVjdGAgYW5kXG4gKiBgaW50ZXJzZWN0aW9uUmVjdGAgLSBqdXN0IGFzIHRoZXNlIGZpZWxkcyB3b3VsZCBiZSBhdmFpbGFibGUgdG8gdGhlXG4gKiBwYXJlbnQgdmlhIGBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5YC4gVGhpcyBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkXG4gKiBlYWNoIHRpbWUgdGhlIGlmcmFtZSByZWNlaXZlcyBpbnRlcnNlY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcGFyZW50XG4gKiB3aW5kb3csIGUuZy4gdmlhIG1lc3NhZ2luZy5cbiAqIEByZXR1cm4ge2Z1bmN0aW9uKERPTVJlY3R8Q2xpZW50UmVjdCwgRE9NUmVjdHxDbGllbnRSZWN0KX1cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuX3NldHVwQ3Jvc3NPcmlnaW5VcGRhdGVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICghY3Jvc3NPcmlnaW5VcGRhdGVyKSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtET01SZWN0fENsaWVudFJlY3R9IGJvdW5kaW5nQ2xpZW50UmVjdFxuICAgICAqIEBwYXJhbSB7RE9NUmVjdHxDbGllbnRSZWN0fSBpbnRlcnNlY3Rpb25SZWN0XG4gICAgICovXG4gICAgY3Jvc3NPcmlnaW5VcGRhdGVyID0gZnVuY3Rpb24oYm91bmRpbmdDbGllbnRSZWN0LCBpbnRlcnNlY3Rpb25SZWN0KSB7XG4gICAgICBpZiAoIWJvdW5kaW5nQ2xpZW50UmVjdCB8fCAhaW50ZXJzZWN0aW9uUmVjdCkge1xuICAgICAgICBjcm9zc09yaWdpblJlY3QgPSBnZXRFbXB0eVJlY3QoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNyb3NzT3JpZ2luUmVjdCA9IGNvbnZlcnRGcm9tUGFyZW50UmVjdChib3VuZGluZ0NsaWVudFJlY3QsIGludGVyc2VjdGlvblJlY3QpO1xuICAgICAgfVxuICAgICAgcmVnaXN0cnkuZm9yRWFjaChmdW5jdGlvbihvYnNlcnZlcikge1xuICAgICAgICBvYnNlcnZlci5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zKCk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBjcm9zc09yaWdpblVwZGF0ZXI7XG59O1xuXG5cbi8qKlxuICogUmVzZXRzIHRoZSBjcm9zcy1vcmlnaW4gbW9kZS5cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIuX3Jlc2V0Q3Jvc3NPcmlnaW5VcGRhdGVyID0gZnVuY3Rpb24oKSB7XG4gIGNyb3NzT3JpZ2luVXBkYXRlciA9IG51bGw7XG4gIGNyb3NzT3JpZ2luUmVjdCA9IG51bGw7XG59O1xuXG5cbi8qKlxuICogU3RhcnRzIG9ic2VydmluZyBhIHRhcmdldCBlbGVtZW50IGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcyBiYXNlZCBvblxuICogdGhlIHRocmVzaG9sZHMgdmFsdWVzLlxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXQgVGhlIERPTSBlbGVtZW50IHRvIG9ic2VydmUuXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHZhciBpc1RhcmdldEFscmVhZHlPYnNlcnZlZCA9IHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cy5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS5lbGVtZW50ID09IHRhcmdldDtcbiAgfSk7XG5cbiAgaWYgKGlzVGFyZ2V0QWxyZWFkeU9ic2VydmVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCEodGFyZ2V0ICYmIHRhcmdldC5ub2RlVHlwZSA9PSAxKSkge1xuICAgIHRocm93IG5ldyBFcnJvcigndGFyZ2V0IG11c3QgYmUgYW4gRWxlbWVudCcpO1xuICB9XG5cbiAgdGhpcy5fcmVnaXN0ZXJJbnN0YW5jZSgpO1xuICB0aGlzLl9vYnNlcnZhdGlvblRhcmdldHMucHVzaCh7ZWxlbWVudDogdGFyZ2V0LCBlbnRyeTogbnVsbH0pO1xuICB0aGlzLl9tb25pdG9ySW50ZXJzZWN0aW9ucyh0YXJnZXQub3duZXJEb2N1bWVudCk7XG4gIHRoaXMuX2NoZWNrRm9ySW50ZXJzZWN0aW9ucygpO1xufTtcblxuXG4vKipcbiAqIFN0b3BzIG9ic2VydmluZyBhIHRhcmdldCBlbGVtZW50IGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcy5cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRoZSBET00gZWxlbWVudCB0byBvYnNlcnZlLlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUudW5vYnNlcnZlID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cyA9XG4gICAgICB0aGlzLl9vYnNlcnZhdGlvblRhcmdldHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uZWxlbWVudCAhPSB0YXJnZXQ7XG4gICAgICB9KTtcbiAgdGhpcy5fdW5tb25pdG9ySW50ZXJzZWN0aW9ucyh0YXJnZXQub3duZXJEb2N1bWVudCk7XG4gIGlmICh0aGlzLl9vYnNlcnZhdGlvblRhcmdldHMubGVuZ3RoID09IDApIHtcbiAgICB0aGlzLl91bnJlZ2lzdGVySW5zdGFuY2UoKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFN0b3BzIG9ic2VydmluZyBhbGwgdGFyZ2V0IGVsZW1lbnRzIGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcy5cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fb2JzZXJ2YXRpb25UYXJnZXRzID0gW107XG4gIHRoaXMuX3VubW9uaXRvckFsbEludGVyc2VjdGlvbnMoKTtcbiAgdGhpcy5fdW5yZWdpc3Rlckluc3RhbmNlKCk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBhbnkgcXVldWUgZW50cmllcyB0aGF0IGhhdmUgbm90IHlldCBiZWVuIHJlcG9ydGVkIHRvIHRoZVxuICogY2FsbGJhY2sgYW5kIGNsZWFycyB0aGUgcXVldWUuIFRoaXMgY2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCB0aGVcbiAqIGNhbGxiYWNrIHRvIG9idGFpbiB0aGUgYWJzb2x1dGUgbW9zdCB1cC10by1kYXRlIGludGVyc2VjdGlvbiBpbmZvcm1hdGlvbi5cbiAqIEByZXR1cm4ge0FycmF5fSBUaGUgY3VycmVudGx5IHF1ZXVlZCBlbnRyaWVzLlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUudGFrZVJlY29yZHMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlY29yZHMgPSB0aGlzLl9xdWV1ZWRFbnRyaWVzLnNsaWNlKCk7XG4gIHRoaXMuX3F1ZXVlZEVudHJpZXMgPSBbXTtcbiAgcmV0dXJuIHJlY29yZHM7XG59O1xuXG5cbi8qKlxuICogQWNjZXB0cyB0aGUgdGhyZXNob2xkIHZhbHVlIGZyb20gdGhlIHVzZXIgY29uZmlndXJhdGlvbiBvYmplY3QgYW5kXG4gKiByZXR1cm5zIGEgc29ydGVkIGFycmF5IG9mIHVuaXF1ZSB0aHJlc2hvbGQgdmFsdWVzLiBJZiBhIHZhbHVlIGlzIG5vdFxuICogYmV0d2VlbiAwIGFuZCAxIGFuZCBlcnJvciBpcyB0aHJvd24uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxudW1iZXI9fSBvcHRfdGhyZXNob2xkIEFuIG9wdGlvbmFsIHRocmVzaG9sZCB2YWx1ZSBvclxuICogICAgIGEgbGlzdCBvZiB0aHJlc2hvbGQgdmFsdWVzLCBkZWZhdWx0aW5nIHRvIFswXS5cbiAqIEByZXR1cm4ge0FycmF5fSBBIHNvcnRlZCBsaXN0IG9mIHVuaXF1ZSBhbmQgdmFsaWQgdGhyZXNob2xkIHZhbHVlcy5cbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9pbml0VGhyZXNob2xkcyA9IGZ1bmN0aW9uKG9wdF90aHJlc2hvbGQpIHtcbiAgdmFyIHRocmVzaG9sZCA9IG9wdF90aHJlc2hvbGQgfHwgWzBdO1xuICBpZiAoIUFycmF5LmlzQXJyYXkodGhyZXNob2xkKSkgdGhyZXNob2xkID0gW3RocmVzaG9sZF07XG5cbiAgcmV0dXJuIHRocmVzaG9sZC5zb3J0KCkuZmlsdGVyKGZ1bmN0aW9uKHQsIGksIGEpIHtcbiAgICBpZiAodHlwZW9mIHQgIT0gJ251bWJlcicgfHwgaXNOYU4odCkgfHwgdCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndGhyZXNob2xkIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxIGluY2x1c2l2ZWx5Jyk7XG4gICAgfVxuICAgIHJldHVybiB0ICE9PSBhW2kgLSAxXTtcbiAgfSk7XG59O1xuXG5cbi8qKlxuICogQWNjZXB0cyB0aGUgcm9vdE1hcmdpbiB2YWx1ZSBmcm9tIHRoZSB1c2VyIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gKiBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgZm91ciBtYXJnaW4gdmFsdWVzIGFzIGFuIG9iamVjdCBjb250YWluaW5nXG4gKiB0aGUgdmFsdWUgYW5kIHVuaXQgcHJvcGVydGllcy4gSWYgYW55IG9mIHRoZSB2YWx1ZXMgYXJlIG5vdCBwcm9wZXJseVxuICogZm9ybWF0dGVkIG9yIHVzZSBhIHVuaXQgb3RoZXIgdGhhbiBweCBvciAlLCBhbmQgZXJyb3IgaXMgdGhyb3duLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Jvb3RNYXJnaW4gQW4gb3B0aW9uYWwgcm9vdE1hcmdpbiB2YWx1ZSxcbiAqICAgICBkZWZhdWx0aW5nIHRvICcwcHgnLlxuICogQHJldHVybiB7QXJyYXk8T2JqZWN0Pn0gQW4gYXJyYXkgb2YgbWFyZ2luIG9iamVjdHMgd2l0aCB0aGUga2V5c1xuICogICAgIHZhbHVlIGFuZCB1bml0LlxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuX3BhcnNlUm9vdE1hcmdpbiA9IGZ1bmN0aW9uKG9wdF9yb290TWFyZ2luKSB7XG4gIHZhciBtYXJnaW5TdHJpbmcgPSBvcHRfcm9vdE1hcmdpbiB8fCAnMHB4JztcbiAgdmFyIG1hcmdpbnMgPSBtYXJnaW5TdHJpbmcuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24obWFyZ2luKSB7XG4gICAgdmFyIHBhcnRzID0gL14oLT9cXGQqXFwuP1xcZCspKHB4fCUpJC8uZXhlYyhtYXJnaW4pO1xuICAgIGlmICghcGFydHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncm9vdE1hcmdpbiBtdXN0IGJlIHNwZWNpZmllZCBpbiBwaXhlbHMgb3IgcGVyY2VudCcpO1xuICAgIH1cbiAgICByZXR1cm4ge3ZhbHVlOiBwYXJzZUZsb2F0KHBhcnRzWzFdKSwgdW5pdDogcGFydHNbMl19O1xuICB9KTtcblxuICAvLyBIYW5kbGVzIHNob3J0aGFuZC5cbiAgbWFyZ2luc1sxXSA9IG1hcmdpbnNbMV0gfHwgbWFyZ2luc1swXTtcbiAgbWFyZ2luc1syXSA9IG1hcmdpbnNbMl0gfHwgbWFyZ2luc1swXTtcbiAgbWFyZ2luc1szXSA9IG1hcmdpbnNbM10gfHwgbWFyZ2luc1sxXTtcblxuICByZXR1cm4gbWFyZ2lucztcbn07XG5cblxuLyoqXG4gKiBTdGFydHMgcG9sbGluZyBmb3IgaW50ZXJzZWN0aW9uIGNoYW5nZXMgaWYgdGhlIHBvbGxpbmcgaXMgbm90IGFscmVhZHlcbiAqIGhhcHBlbmluZywgYW5kIGlmIHRoZSBwYWdlJ3MgdmlzaWJpbGl0eSBzdGF0ZSBpcyB2aXNpYmxlLlxuICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9tb25pdG9ySW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uKGRvYykge1xuICB2YXIgd2luID0gZG9jLmRlZmF1bHRWaWV3O1xuICBpZiAoIXdpbikge1xuICAgIC8vIEFscmVhZHkgZGVzdHJveWVkLlxuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGhpcy5fbW9uaXRvcmluZ0RvY3VtZW50cy5pbmRleE9mKGRvYykgIT0gLTEpIHtcbiAgICAvLyBBbHJlYWR5IG1vbml0b3JpbmcuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gUHJpdmF0ZSBzdGF0ZSBmb3IgbW9uaXRvcmluZy5cbiAgdmFyIGNhbGxiYWNrID0gdGhpcy5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zO1xuICB2YXIgbW9uaXRvcmluZ0ludGVydmFsID0gbnVsbDtcbiAgdmFyIGRvbU9ic2VydmVyID0gbnVsbDtcblxuICAvLyBJZiBhIHBvbGwgaW50ZXJ2YWwgaXMgc2V0LCB1c2UgcG9sbGluZyBpbnN0ZWFkIG9mIGxpc3RlbmluZyB0b1xuICAvLyByZXNpemUgYW5kIHNjcm9sbCBldmVudHMgb3IgRE9NIG11dGF0aW9ucy5cbiAgaWYgKHRoaXMuUE9MTF9JTlRFUlZBTCkge1xuICAgIG1vbml0b3JpbmdJbnRlcnZhbCA9IHdpbi5zZXRJbnRlcnZhbChjYWxsYmFjaywgdGhpcy5QT0xMX0lOVEVSVkFMKTtcbiAgfSBlbHNlIHtcbiAgICBhZGRFdmVudCh3aW4sICdyZXNpemUnLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgYWRkRXZlbnQoZG9jLCAnc2Nyb2xsJywgY2FsbGJhY2ssIHRydWUpO1xuICAgIGlmICh0aGlzLlVTRV9NVVRBVElPTl9PQlNFUlZFUiAmJiAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luKSB7XG4gICAgICBkb21PYnNlcnZlciA9IG5ldyB3aW4uTXV0YXRpb25PYnNlcnZlcihjYWxsYmFjayk7XG4gICAgICBkb21PYnNlcnZlci5vYnNlcnZlKGRvYywge1xuICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXG4gICAgICAgIHN1YnRyZWU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuX21vbml0b3JpbmdEb2N1bWVudHMucHVzaChkb2MpO1xuICB0aGlzLl9tb25pdG9yaW5nVW5zdWJzY3JpYmVzLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgLy8gR2V0IHRoZSB3aW5kb3cgb2JqZWN0IGFnYWluLiBXaGVuIGEgZnJpZW5kbHkgaWZyYW1lIGlzIGRlc3Ryb3llZCwgaXRcbiAgICAvLyB3aWxsIGJlIG51bGwuXG4gICAgdmFyIHdpbiA9IGRvYy5kZWZhdWx0VmlldztcblxuICAgIGlmICh3aW4pIHtcbiAgICAgIGlmIChtb25pdG9yaW5nSW50ZXJ2YWwpIHtcbiAgICAgICAgd2luLmNsZWFySW50ZXJ2YWwobW9uaXRvcmluZ0ludGVydmFsKTtcbiAgICAgIH1cbiAgICAgIHJlbW92ZUV2ZW50KHdpbiwgJ3Jlc2l6ZScsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZW1vdmVFdmVudChkb2MsICdzY3JvbGwnLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgaWYgKGRvbU9ic2VydmVyKSB7XG4gICAgICBkb21PYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBBbHNvIG1vbml0b3IgdGhlIHBhcmVudC5cbiAgdmFyIHJvb3REb2MgPVxuICAgICh0aGlzLnJvb3QgJiYgKHRoaXMucm9vdC5vd25lckRvY3VtZW50IHx8IHRoaXMucm9vdCkpIHx8IGRvY3VtZW50O1xuICBpZiAoZG9jICE9IHJvb3REb2MpIHtcbiAgICB2YXIgZnJhbWUgPSBnZXRGcmFtZUVsZW1lbnQoZG9jKTtcbiAgICBpZiAoZnJhbWUpIHtcbiAgICAgIHRoaXMuX21vbml0b3JJbnRlcnNlY3Rpb25zKGZyYW1lLm93bmVyRG9jdW1lbnQpO1xuICAgIH1cbiAgfVxufTtcblxuXG4vKipcbiAqIFN0b3BzIHBvbGxpbmcgZm9yIGludGVyc2VjdGlvbiBjaGFuZ2VzLlxuICogQHBhcmFtIHshRG9jdW1lbnR9IGRvY1xuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl91bm1vbml0b3JJbnRlcnNlY3Rpb25zID0gZnVuY3Rpb24oZG9jKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuX21vbml0b3JpbmdEb2N1bWVudHMuaW5kZXhPZihkb2MpO1xuICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcm9vdERvYyA9XG4gICAgKHRoaXMucm9vdCAmJiAodGhpcy5yb290Lm93bmVyRG9jdW1lbnQgfHwgdGhpcy5yb290KSkgfHwgZG9jdW1lbnQ7XG5cbiAgLy8gQ2hlY2sgaWYgYW55IGRlcGVuZGVudCB0YXJnZXRzIGFyZSBzdGlsbCByZW1haW5pbmcuXG4gIHZhciBoYXNEZXBlbmRlbnRUYXJnZXRzID1cbiAgICAgIHRoaXMuX29ic2VydmF0aW9uVGFyZ2V0cy5zb21lKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIGl0ZW1Eb2MgPSBpdGVtLmVsZW1lbnQub3duZXJEb2N1bWVudDtcbiAgICAgICAgLy8gVGFyZ2V0IGlzIGluIHRoaXMgY29udGV4dC5cbiAgICAgICAgaWYgKGl0ZW1Eb2MgPT0gZG9jKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVGFyZ2V0IGlzIG5lc3RlZCBpbiB0aGlzIGNvbnRleHQuXG4gICAgICAgIHdoaWxlIChpdGVtRG9jICYmIGl0ZW1Eb2MgIT0gcm9vdERvYykge1xuICAgICAgICAgIHZhciBmcmFtZSA9IGdldEZyYW1lRWxlbWVudChpdGVtRG9jKTtcbiAgICAgICAgICBpdGVtRG9jID0gZnJhbWUgJiYgZnJhbWUub3duZXJEb2N1bWVudDtcbiAgICAgICAgICBpZiAoaXRlbURvYyA9PSBkb2MpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgaWYgKGhhc0RlcGVuZGVudFRhcmdldHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBVbnN1YnNjcmliZS5cbiAgdmFyIHVuc3Vic2NyaWJlID0gdGhpcy5fbW9uaXRvcmluZ1Vuc3Vic2NyaWJlc1tpbmRleF07XG4gIHRoaXMuX21vbml0b3JpbmdEb2N1bWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgdGhpcy5fbW9uaXRvcmluZ1Vuc3Vic2NyaWJlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB1bnN1YnNjcmliZSgpO1xuXG4gIC8vIEFsc28gdW5tb25pdG9yIHRoZSBwYXJlbnQuXG4gIGlmIChkb2MgIT0gcm9vdERvYykge1xuICAgIHZhciBmcmFtZSA9IGdldEZyYW1lRWxlbWVudChkb2MpO1xuICAgIGlmIChmcmFtZSkge1xuICAgICAgdGhpcy5fdW5tb25pdG9ySW50ZXJzZWN0aW9ucyhmcmFtZS5vd25lckRvY3VtZW50KTtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTdG9wcyBwb2xsaW5nIGZvciBpbnRlcnNlY3Rpb24gY2hhbmdlcy5cbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fdW5tb25pdG9yQWxsSW50ZXJzZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgdW5zdWJzY3JpYmVzID0gdGhpcy5fbW9uaXRvcmluZ1Vuc3Vic2NyaWJlcy5zbGljZSgwKTtcbiAgdGhpcy5fbW9uaXRvcmluZ0RvY3VtZW50cy5sZW5ndGggPSAwO1xuICB0aGlzLl9tb25pdG9yaW5nVW5zdWJzY3JpYmVzLmxlbmd0aCA9IDA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdW5zdWJzY3JpYmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdW5zdWJzY3JpYmVzW2ldKCk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBTY2FucyBlYWNoIG9ic2VydmF0aW9uIHRhcmdldCBmb3IgaW50ZXJzZWN0aW9uIGNoYW5nZXMgYW5kIGFkZHMgdGhlbVxuICogdG8gdGhlIGludGVybmFsIGVudHJpZXMgcXVldWUuIElmIG5ldyBlbnRyaWVzIGFyZSBmb3VuZCwgaXRcbiAqIHNjaGVkdWxlcyB0aGUgY2FsbGJhY2sgdG8gYmUgaW52b2tlZC5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fY2hlY2tGb3JJbnRlcnNlY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5yb290ICYmIGNyb3NzT3JpZ2luVXBkYXRlciAmJiAhY3Jvc3NPcmlnaW5SZWN0KSB7XG4gICAgLy8gQ3Jvc3Mgb3JpZ2luIG1vbml0b3JpbmcsIGJ1dCBubyBpbml0aWFsIGRhdGEgYXZhaWxhYmxlIHlldC5cbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgcm9vdElzSW5Eb20gPSB0aGlzLl9yb290SXNJbkRvbSgpO1xuICB2YXIgcm9vdFJlY3QgPSByb290SXNJbkRvbSA/IHRoaXMuX2dldFJvb3RSZWN0KCkgOiBnZXRFbXB0eVJlY3QoKTtcblxuICB0aGlzLl9vYnNlcnZhdGlvblRhcmdldHMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyIHRhcmdldCA9IGl0ZW0uZWxlbWVudDtcbiAgICB2YXIgdGFyZ2V0UmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdCh0YXJnZXQpO1xuICAgIHZhciByb290Q29udGFpbnNUYXJnZXQgPSB0aGlzLl9yb290Q29udGFpbnNUYXJnZXQodGFyZ2V0KTtcbiAgICB2YXIgb2xkRW50cnkgPSBpdGVtLmVudHJ5O1xuICAgIHZhciBpbnRlcnNlY3Rpb25SZWN0ID0gcm9vdElzSW5Eb20gJiYgcm9vdENvbnRhaW5zVGFyZ2V0ICYmXG4gICAgICAgIHRoaXMuX2NvbXB1dGVUYXJnZXRBbmRSb290SW50ZXJzZWN0aW9uKHRhcmdldCwgdGFyZ2V0UmVjdCwgcm9vdFJlY3QpO1xuXG4gICAgdmFyIHJvb3RCb3VuZHMgPSBudWxsO1xuICAgIGlmICghdGhpcy5fcm9vdENvbnRhaW5zVGFyZ2V0KHRhcmdldCkpIHtcbiAgICAgIHJvb3RCb3VuZHMgPSBnZXRFbXB0eVJlY3QoKTtcbiAgICB9IGVsc2UgaWYgKCFjcm9zc09yaWdpblVwZGF0ZXIgfHwgdGhpcy5yb290KSB7XG4gICAgICByb290Qm91bmRzID0gcm9vdFJlY3Q7XG4gICAgfVxuXG4gICAgdmFyIG5ld0VudHJ5ID0gaXRlbS5lbnRyeSA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5KHtcbiAgICAgIHRpbWU6IG5vdygpLFxuICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICBib3VuZGluZ0NsaWVudFJlY3Q6IHRhcmdldFJlY3QsXG4gICAgICByb290Qm91bmRzOiByb290Qm91bmRzLFxuICAgICAgaW50ZXJzZWN0aW9uUmVjdDogaW50ZXJzZWN0aW9uUmVjdFxuICAgIH0pO1xuXG4gICAgaWYgKCFvbGRFbnRyeSkge1xuICAgICAgdGhpcy5fcXVldWVkRW50cmllcy5wdXNoKG5ld0VudHJ5KTtcbiAgICB9IGVsc2UgaWYgKHJvb3RJc0luRG9tICYmIHJvb3RDb250YWluc1RhcmdldCkge1xuICAgICAgLy8gSWYgdGhlIG5ldyBlbnRyeSBpbnRlcnNlY3Rpb24gcmF0aW8gaGFzIGNyb3NzZWQgYW55IG9mIHRoZVxuICAgICAgLy8gdGhyZXNob2xkcywgYWRkIGEgbmV3IGVudHJ5LlxuICAgICAgaWYgKHRoaXMuX2hhc0Nyb3NzZWRUaHJlc2hvbGQob2xkRW50cnksIG5ld0VudHJ5KSkge1xuICAgICAgICB0aGlzLl9xdWV1ZWRFbnRyaWVzLnB1c2gobmV3RW50cnkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgcm9vdCBpcyBub3QgaW4gdGhlIERPTSBvciB0YXJnZXQgaXMgbm90IGNvbnRhaW5lZCB3aXRoaW5cbiAgICAgIC8vIHJvb3QgYnV0IHRoZSBwcmV2aW91cyBlbnRyeSBmb3IgdGhpcyB0YXJnZXQgaGFkIGFuIGludGVyc2VjdGlvbixcbiAgICAgIC8vIGFkZCBhIG5ldyByZWNvcmQgaW5kaWNhdGluZyByZW1vdmFsLlxuICAgICAgaWYgKG9sZEVudHJ5ICYmIG9sZEVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgIHRoaXMuX3F1ZXVlZEVudHJpZXMucHVzaChuZXdFbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB0aGlzKTtcblxuICBpZiAodGhpcy5fcXVldWVkRW50cmllcy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFjayh0aGlzLnRha2VSZWNvcmRzKCksIHRoaXMpO1xuICB9XG59O1xuXG5cbi8qKlxuICogQWNjZXB0cyBhIHRhcmdldCBhbmQgcm9vdCByZWN0IGNvbXB1dGVzIHRoZSBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGVuXG4gKiBmb2xsb3dpbmcgdGhlIGFsZ29yaXRobSBpbiB0aGUgc3BlYy5cbiAqIFRPRE8ocGhpbGlwd2FsdG9uKTogYXQgdGhpcyB0aW1lIGNsaXAtcGF0aCBpcyBub3QgY29uc2lkZXJlZC5cbiAqIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby9JbnRlcnNlY3Rpb25PYnNlcnZlci8jY2FsY3VsYXRlLWludGVyc2VjdGlvbi1yZWN0LWFsZ29cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRoZSB0YXJnZXQgRE9NIGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRSZWN0IFRoZSBib3VuZGluZyByZWN0IG9mIHRoZSB0YXJnZXQuXG4gKiBAcGFyYW0ge09iamVjdH0gcm9vdFJlY3QgVGhlIGJvdW5kaW5nIHJlY3Qgb2YgdGhlIHJvb3QgYWZ0ZXIgYmVpbmdcbiAqICAgICBleHBhbmRlZCBieSB0aGUgcm9vdE1hcmdpbiB2YWx1ZS5cbiAqIEByZXR1cm4gez9PYmplY3R9IFRoZSBmaW5hbCBpbnRlcnNlY3Rpb24gcmVjdCBvYmplY3Qgb3IgdW5kZWZpbmVkIGlmIG5vXG4gKiAgICAgaW50ZXJzZWN0aW9uIGlzIGZvdW5kLlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9jb21wdXRlVGFyZ2V0QW5kUm9vdEludGVyc2VjdGlvbiA9XG4gICAgZnVuY3Rpb24odGFyZ2V0LCB0YXJnZXRSZWN0LCByb290UmVjdCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBpc24ndCBkaXNwbGF5ZWQsIGFuIGludGVyc2VjdGlvbiBjYW4ndCBoYXBwZW4uXG4gIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQpLmRpc3BsYXkgPT0gJ25vbmUnKSByZXR1cm47XG5cbiAgdmFyIGludGVyc2VjdGlvblJlY3QgPSB0YXJnZXRSZWN0O1xuICB2YXIgcGFyZW50ID0gZ2V0UGFyZW50Tm9kZSh0YXJnZXQpO1xuICB2YXIgYXRSb290ID0gZmFsc2U7XG5cbiAgd2hpbGUgKCFhdFJvb3QgJiYgcGFyZW50KSB7XG4gICAgdmFyIHBhcmVudFJlY3QgPSBudWxsO1xuICAgIHZhciBwYXJlbnRDb21wdXRlZFN0eWxlID0gcGFyZW50Lm5vZGVUeXBlID09IDEgP1xuICAgICAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnQpIDoge307XG5cbiAgICAvLyBJZiB0aGUgcGFyZW50IGlzbid0IGRpc3BsYXllZCwgYW4gaW50ZXJzZWN0aW9uIGNhbid0IGhhcHBlbi5cbiAgICBpZiAocGFyZW50Q29tcHV0ZWRTdHlsZS5kaXNwbGF5ID09ICdub25lJykgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAocGFyZW50ID09IHRoaXMucm9vdCB8fCBwYXJlbnQubm9kZVR5cGUgPT0gLyogRE9DVU1FTlQgKi8gOSkge1xuICAgICAgYXRSb290ID0gdHJ1ZTtcbiAgICAgIGlmIChwYXJlbnQgPT0gdGhpcy5yb290IHx8IHBhcmVudCA9PSBkb2N1bWVudCkge1xuICAgICAgICBpZiAoY3Jvc3NPcmlnaW5VcGRhdGVyICYmICF0aGlzLnJvb3QpIHtcbiAgICAgICAgICBpZiAoIWNyb3NzT3JpZ2luUmVjdCB8fFxuICAgICAgICAgICAgICBjcm9zc09yaWdpblJlY3Qud2lkdGggPT0gMCAmJiBjcm9zc09yaWdpblJlY3QuaGVpZ2h0ID09IDApIHtcbiAgICAgICAgICAgIC8vIEEgMC1zaXplIGNyb3NzLW9yaWdpbiBpbnRlcnNlY3Rpb24gbWVhbnMgbm8taW50ZXJzZWN0aW9uLlxuICAgICAgICAgICAgcGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHBhcmVudFJlY3QgPSBudWxsO1xuICAgICAgICAgICAgaW50ZXJzZWN0aW9uUmVjdCA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudFJlY3QgPSBjcm9zc09yaWdpblJlY3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudFJlY3QgPSByb290UmVjdDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhIGZyYW1lIHRoYXQgY2FuIGJlIG5hdmlnYXRlZCB0by5cbiAgICAgICAgdmFyIGZyYW1lID0gZ2V0UGFyZW50Tm9kZShwYXJlbnQpO1xuICAgICAgICB2YXIgZnJhbWVSZWN0ID0gZnJhbWUgJiYgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGZyYW1lKTtcbiAgICAgICAgdmFyIGZyYW1lSW50ZXJzZWN0ID1cbiAgICAgICAgICAgIGZyYW1lICYmXG4gICAgICAgICAgICB0aGlzLl9jb21wdXRlVGFyZ2V0QW5kUm9vdEludGVyc2VjdGlvbihmcmFtZSwgZnJhbWVSZWN0LCByb290UmVjdCk7XG4gICAgICAgIGlmIChmcmFtZVJlY3QgJiYgZnJhbWVJbnRlcnNlY3QpIHtcbiAgICAgICAgICBwYXJlbnQgPSBmcmFtZTtcbiAgICAgICAgICBwYXJlbnRSZWN0ID0gY29udmVydEZyb21QYXJlbnRSZWN0KGZyYW1lUmVjdCwgZnJhbWVJbnRlcnNlY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmVudCA9IG51bGw7XG4gICAgICAgICAgaW50ZXJzZWN0aW9uUmVjdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGEgbm9uLXZpc2libGUgb3ZlcmZsb3csIGFuZCBpdCdzIG5vdCB0aGUgPGJvZHk+XG4gICAgICAvLyBvciA8aHRtbD4gZWxlbWVudCwgdXBkYXRlIHRoZSBpbnRlcnNlY3Rpb24gcmVjdC5cbiAgICAgIC8vIE5vdGU6IDxib2R5PiBhbmQgPGh0bWw+IGNhbm5vdCBiZSBjbGlwcGVkIHRvIGEgcmVjdCB0aGF0J3Mgbm90IGFsc29cbiAgICAgIC8vIHRoZSBkb2N1bWVudCByZWN0LCBzbyBubyBuZWVkIHRvIGNvbXB1dGUgYSBuZXcgaW50ZXJzZWN0aW9uLlxuICAgICAgdmFyIGRvYyA9IHBhcmVudC5vd25lckRvY3VtZW50O1xuICAgICAgaWYgKHBhcmVudCAhPSBkb2MuYm9keSAmJlxuICAgICAgICAgIHBhcmVudCAhPSBkb2MuZG9jdW1lbnRFbGVtZW50ICYmXG4gICAgICAgICAgcGFyZW50Q29tcHV0ZWRTdHlsZS5vdmVyZmxvdyAhPSAndmlzaWJsZScpIHtcbiAgICAgICAgcGFyZW50UmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdChwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIGVpdGhlciBvZiB0aGUgYWJvdmUgY29uZGl0aW9uYWxzIHNldCBhIG5ldyBwYXJlbnRSZWN0LFxuICAgIC8vIGNhbGN1bGF0ZSBuZXcgaW50ZXJzZWN0aW9uIGRhdGEuXG4gICAgaWYgKHBhcmVudFJlY3QpIHtcbiAgICAgIGludGVyc2VjdGlvblJlY3QgPSBjb21wdXRlUmVjdEludGVyc2VjdGlvbihwYXJlbnRSZWN0LCBpbnRlcnNlY3Rpb25SZWN0KTtcbiAgICB9XG4gICAgaWYgKCFpbnRlcnNlY3Rpb25SZWN0KSBicmVhaztcbiAgICBwYXJlbnQgPSBwYXJlbnQgJiYgZ2V0UGFyZW50Tm9kZShwYXJlbnQpO1xuICB9XG4gIHJldHVybiBpbnRlcnNlY3Rpb25SZWN0O1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJvb3QgcmVjdCBhZnRlciBiZWluZyBleHBhbmRlZCBieSB0aGUgcm9vdE1hcmdpbiB2YWx1ZS5cbiAqIEByZXR1cm4ge0NsaWVudFJlY3R9IFRoZSBleHBhbmRlZCByb290IHJlY3QuXG4gKiBAcHJpdmF0ZVxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuX2dldFJvb3RSZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciByb290UmVjdDtcbiAgaWYgKHRoaXMucm9vdCAmJiAhaXNEb2ModGhpcy5yb290KSkge1xuICAgIHJvb3RSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KHRoaXMucm9vdCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVXNlIDxodG1sPi88Ym9keT4gaW5zdGVhZCBvZiB3aW5kb3cgc2luY2Ugc2Nyb2xsIGJhcnMgYWZmZWN0IHNpemUuXG4gICAgdmFyIGRvYyA9IGlzRG9jKHRoaXMucm9vdCkgPyB0aGlzLnJvb3QgOiBkb2N1bWVudDtcbiAgICB2YXIgaHRtbCA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgdmFyIGJvZHkgPSBkb2MuYm9keTtcbiAgICByb290UmVjdCA9IHtcbiAgICAgIHRvcDogMCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICByaWdodDogaHRtbC5jbGllbnRXaWR0aCB8fCBib2R5LmNsaWVudFdpZHRoLFxuICAgICAgd2lkdGg6IGh0bWwuY2xpZW50V2lkdGggfHwgYm9keS5jbGllbnRXaWR0aCxcbiAgICAgIGJvdHRvbTogaHRtbC5jbGllbnRIZWlnaHQgfHwgYm9keS5jbGllbnRIZWlnaHQsXG4gICAgICBoZWlnaHQ6IGh0bWwuY2xpZW50SGVpZ2h0IHx8IGJvZHkuY2xpZW50SGVpZ2h0XG4gICAgfTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZXhwYW5kUmVjdEJ5Um9vdE1hcmdpbihyb290UmVjdCk7XG59O1xuXG5cbi8qKlxuICogQWNjZXB0cyBhIHJlY3QgYW5kIGV4cGFuZHMgaXQgYnkgdGhlIHJvb3RNYXJnaW4gdmFsdWUuXG4gKiBAcGFyYW0ge0RPTVJlY3R8Q2xpZW50UmVjdH0gcmVjdCBUaGUgcmVjdCBvYmplY3QgdG8gZXhwYW5kLlxuICogQHJldHVybiB7Q2xpZW50UmVjdH0gVGhlIGV4cGFuZGVkIHJlY3QuXG4gKiBAcHJpdmF0ZVxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuX2V4cGFuZFJlY3RCeVJvb3RNYXJnaW4gPSBmdW5jdGlvbihyZWN0KSB7XG4gIHZhciBtYXJnaW5zID0gdGhpcy5fcm9vdE1hcmdpblZhbHVlcy5tYXAoZnVuY3Rpb24obWFyZ2luLCBpKSB7XG4gICAgcmV0dXJuIG1hcmdpbi51bml0ID09ICdweCcgPyBtYXJnaW4udmFsdWUgOlxuICAgICAgICBtYXJnaW4udmFsdWUgKiAoaSAlIDIgPyByZWN0LndpZHRoIDogcmVjdC5oZWlnaHQpIC8gMTAwO1xuICB9KTtcbiAgdmFyIG5ld1JlY3QgPSB7XG4gICAgdG9wOiByZWN0LnRvcCAtIG1hcmdpbnNbMF0sXG4gICAgcmlnaHQ6IHJlY3QucmlnaHQgKyBtYXJnaW5zWzFdLFxuICAgIGJvdHRvbTogcmVjdC5ib3R0b20gKyBtYXJnaW5zWzJdLFxuICAgIGxlZnQ6IHJlY3QubGVmdCAtIG1hcmdpbnNbM11cbiAgfTtcbiAgbmV3UmVjdC53aWR0aCA9IG5ld1JlY3QucmlnaHQgLSBuZXdSZWN0LmxlZnQ7XG4gIG5ld1JlY3QuaGVpZ2h0ID0gbmV3UmVjdC5ib3R0b20gLSBuZXdSZWN0LnRvcDtcblxuICByZXR1cm4gbmV3UmVjdDtcbn07XG5cblxuLyoqXG4gKiBBY2NlcHRzIGFuIG9sZCBhbmQgbmV3IGVudHJ5IGFuZCByZXR1cm5zIHRydWUgaWYgYXQgbGVhc3Qgb25lIG9mIHRoZVxuICogdGhyZXNob2xkIHZhbHVlcyBoYXMgYmVlbiBjcm9zc2VkLlxuICogQHBhcmFtIHs/SW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeX0gb2xkRW50cnkgVGhlIHByZXZpb3VzIGVudHJ5IGZvciBhXG4gKiAgICBwYXJ0aWN1bGFyIHRhcmdldCBlbGVtZW50IG9yIG51bGwgaWYgbm8gcHJldmlvdXMgZW50cnkgZXhpc3RzLlxuICogQHBhcmFtIHtJbnRlcnNlY3Rpb25PYnNlcnZlckVudHJ5fSBuZXdFbnRyeSBUaGUgY3VycmVudCBlbnRyeSBmb3IgYVxuICogICAgcGFydGljdWxhciB0YXJnZXQgZWxlbWVudC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBhIGFueSB0aHJlc2hvbGQgaGFzIGJlZW4gY3Jvc3NlZC5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5faGFzQ3Jvc3NlZFRocmVzaG9sZCA9XG4gICAgZnVuY3Rpb24ob2xkRW50cnksIG5ld0VudHJ5KSB7XG5cbiAgLy8gVG8gbWFrZSBjb21wYXJpbmcgZWFzaWVyLCBhbiBlbnRyeSB0aGF0IGhhcyBhIHJhdGlvIG9mIDBcbiAgLy8gYnV0IGRvZXMgbm90IGFjdHVhbGx5IGludGVyc2VjdCBpcyBnaXZlbiBhIHZhbHVlIG9mIC0xXG4gIHZhciBvbGRSYXRpbyA9IG9sZEVudHJ5ICYmIG9sZEVudHJ5LmlzSW50ZXJzZWN0aW5nID9cbiAgICAgIG9sZEVudHJ5LmludGVyc2VjdGlvblJhdGlvIHx8IDAgOiAtMTtcbiAgdmFyIG5ld1JhdGlvID0gbmV3RW50cnkuaXNJbnRlcnNlY3RpbmcgP1xuICAgICAgbmV3RW50cnkuaW50ZXJzZWN0aW9uUmF0aW8gfHwgMCA6IC0xO1xuXG4gIC8vIElnbm9yZSB1bmNoYW5nZWQgcmF0aW9zXG4gIGlmIChvbGRSYXRpbyA9PT0gbmV3UmF0aW8pIHJldHVybjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGhyZXNob2xkcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0aHJlc2hvbGQgPSB0aGlzLnRocmVzaG9sZHNbaV07XG5cbiAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBhbiBlbnRyeSBtYXRjaGVzIGEgdGhyZXNob2xkIG9yIGlmIHRoZSBuZXcgcmF0aW9cbiAgICAvLyBhbmQgdGhlIG9sZCByYXRpbyBhcmUgb24gdGhlIG9wcG9zaXRlIHNpZGVzIG9mIGEgdGhyZXNob2xkLlxuICAgIGlmICh0aHJlc2hvbGQgPT0gb2xkUmF0aW8gfHwgdGhyZXNob2xkID09IG5ld1JhdGlvIHx8XG4gICAgICAgIHRocmVzaG9sZCA8IG9sZFJhdGlvICE9PSB0aHJlc2hvbGQgPCBuZXdSYXRpbykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcm9vdCBlbGVtZW50IGlzIGFuIGVsZW1lbnQgYW5kIGlzIGluIHRoZSBET00uXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSByb290IGVsZW1lbnQgaXMgYW4gZWxlbWVudCBhbmQgaXMgaW4gdGhlIERPTS5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fcm9vdElzSW5Eb20gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICF0aGlzLnJvb3QgfHwgY29udGFpbnNEZWVwKGRvY3VtZW50LCB0aGlzLnJvb3QpO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgY2hpbGQgb2Ygcm9vdC5cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFRoZSB0YXJnZXQgZWxlbWVudCB0byBjaGVjay5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgY2hpbGQgb2Ygcm9vdC5cbiAqIEBwcml2YXRlXG4gKi9cbkludGVyc2VjdGlvbk9ic2VydmVyLnByb3RvdHlwZS5fcm9vdENvbnRhaW5zVGFyZ2V0ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIHZhciByb290RG9jID1cbiAgICAodGhpcy5yb290ICYmICh0aGlzLnJvb3Qub3duZXJEb2N1bWVudCB8fCB0aGlzLnJvb3QpKSB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIChcbiAgICBjb250YWluc0RlZXAocm9vdERvYywgdGFyZ2V0KSAmJlxuICAgICghdGhpcy5yb290IHx8IHJvb3REb2MgPT0gdGFyZ2V0Lm93bmVyRG9jdW1lbnQpXG4gICk7XG59O1xuXG5cbi8qKlxuICogQWRkcyB0aGUgaW5zdGFuY2UgdG8gdGhlIGdsb2JhbCBJbnRlcnNlY3Rpb25PYnNlcnZlciByZWdpc3RyeSBpZiBpdCBpc24ndFxuICogYWxyZWFkeSBwcmVzZW50LlxuICogQHByaXZhdGVcbiAqL1xuSW50ZXJzZWN0aW9uT2JzZXJ2ZXIucHJvdG90eXBlLl9yZWdpc3Rlckluc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gIGlmIChyZWdpc3RyeS5pbmRleE9mKHRoaXMpIDwgMCkge1xuICAgIHJlZ2lzdHJ5LnB1c2godGhpcyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBpbnN0YW5jZSBmcm9tIHRoZSBnbG9iYWwgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgcmVnaXN0cnkuXG4gKiBAcHJpdmF0ZVxuICovXG5JbnRlcnNlY3Rpb25PYnNlcnZlci5wcm90b3R5cGUuX3VucmVnaXN0ZXJJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5kZXggPSByZWdpc3RyeS5pbmRleE9mKHRoaXMpO1xuICBpZiAoaW5kZXggIT0gLTEpIHJlZ2lzdHJ5LnNwbGljZShpbmRleCwgMSk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVzdWx0IG9mIHRoZSBwZXJmb3JtYW5jZS5ub3coKSBtZXRob2Qgb3IgbnVsbCBpbiBicm93c2Vyc1xuICogdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBBUEkuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBlbGFwc2VkIHRpbWUgc2luY2UgdGhlIHBhZ2Ugd2FzIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gd2luZG93LnBlcmZvcm1hbmNlICYmIHBlcmZvcm1hbmNlLm5vdyAmJiBwZXJmb3JtYW5jZS5ub3coKTtcbn1cblxuXG4vKipcbiAqIFRocm90dGxlcyBhIGZ1bmN0aW9uIGFuZCBkZWxheXMgaXRzIGV4ZWN1dGlvbiwgc28gaXQncyBvbmx5IGNhbGxlZCBhdCBtb3N0XG4gKiBvbmNlIHdpdGhpbiBhIGdpdmVuIHRpbWUgcGVyaW9kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IHRpbWVvdXQgVGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbXVzdCBwYXNzIGJlZm9yZSB0aGVcbiAqICAgICBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGFnYWluLlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZuLCB0aW1lb3V0KSB7XG4gIHZhciB0aW1lciA9IG51bGw7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aW1lcikge1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBmbigpO1xuICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9XG4gIH07XG59XG5cblxuLyoqXG4gKiBBZGRzIGFuIGV2ZW50IGhhbmRsZXIgdG8gYSBET00gbm9kZSBlbnN1cmluZyBjcm9zcy1icm93c2VyIGNvbXBhdGliaWxpdHkuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIERPTSBub2RlIHRvIGFkZCB0aGUgZXZlbnQgaGFuZGxlciB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBldmVudCBoYW5kbGVyIHRvIGFkZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0X3VzZUNhcHR1cmUgT3B0aW9uYWxseSBhZGRzIHRoZSBldmVuIHRvIHRoZSBjYXB0dXJlXG4gKiAgICAgcGhhc2UuIE5vdGU6IHRoaXMgb25seSB3b3JrcyBpbiBtb2Rlcm4gYnJvd3NlcnMuXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50KG5vZGUsIGV2ZW50LCBmbiwgb3B0X3VzZUNhcHR1cmUpIHtcbiAgaWYgKHR5cGVvZiBub2RlLmFkZEV2ZW50TGlzdGVuZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIG9wdF91c2VDYXB0dXJlIHx8IGZhbHNlKTtcbiAgfVxuICBlbHNlIGlmICh0eXBlb2Ygbm9kZS5hdHRhY2hFdmVudCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnQsIGZuKTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgZXZlbnQgaGFuZGxlciBmcm9tIGEgRE9NIG5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIERPTSBub2RlIHRvIHJlbW92ZSB0aGUgZXZlbnQgaGFuZGxlciBmcm9tLlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGV2ZW50IGhhbmRsZXIgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtib29sZWFufSBvcHRfdXNlQ2FwdHVyZSBJZiB0aGUgZXZlbnQgaGFuZGxlciB3YXMgYWRkZWQgd2l0aCB0aGlzXG4gKiAgICAgZmxhZyBzZXQgdG8gdHJ1ZSwgaXQgc2hvdWxkIGJlIHNldCB0byB0cnVlIGhlcmUgaW4gb3JkZXIgdG8gcmVtb3ZlIGl0LlxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudChub2RlLCBldmVudCwgZm4sIG9wdF91c2VDYXB0dXJlKSB7XG4gIGlmICh0eXBlb2Ygbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyID09ICdmdW5jdGlvbicpIHtcbiAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBvcHRfdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIG5vZGUuZGV0YWNoRXZlbnQgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG5vZGUuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50LCBmbik7XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludGVyc2VjdGlvbiBiZXR3ZWVuIHR3byByZWN0IG9iamVjdHMuXG4gKiBAcGFyYW0ge09iamVjdH0gcmVjdDEgVGhlIGZpcnN0IHJlY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gcmVjdDIgVGhlIHNlY29uZCByZWN0LlxuICogQHJldHVybiB7P09iamVjdHw/Q2xpZW50UmVjdH0gVGhlIGludGVyc2VjdGlvbiByZWN0IG9yIHVuZGVmaW5lZCBpZiBub1xuICogICAgIGludGVyc2VjdGlvbiBpcyBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVJlY3RJbnRlcnNlY3Rpb24ocmVjdDEsIHJlY3QyKSB7XG4gIHZhciB0b3AgPSBNYXRoLm1heChyZWN0MS50b3AsIHJlY3QyLnRvcCk7XG4gIHZhciBib3R0b20gPSBNYXRoLm1pbihyZWN0MS5ib3R0b20sIHJlY3QyLmJvdHRvbSk7XG4gIHZhciBsZWZ0ID0gTWF0aC5tYXgocmVjdDEubGVmdCwgcmVjdDIubGVmdCk7XG4gIHZhciByaWdodCA9IE1hdGgubWluKHJlY3QxLnJpZ2h0LCByZWN0Mi5yaWdodCk7XG4gIHZhciB3aWR0aCA9IHJpZ2h0IC0gbGVmdDtcbiAgdmFyIGhlaWdodCA9IGJvdHRvbSAtIHRvcDtcblxuICByZXR1cm4gKHdpZHRoID49IDAgJiYgaGVpZ2h0ID49IDApICYmIHtcbiAgICB0b3A6IHRvcCxcbiAgICBib3R0b206IGJvdHRvbSxcbiAgICBsZWZ0OiBsZWZ0LFxuICAgIHJpZ2h0OiByaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHRcbiAgfSB8fCBudWxsO1xufVxuXG5cbi8qKlxuICogU2hpbXMgdGhlIG5hdGl2ZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBJRS5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZWwgVGhlIGVsZW1lbnQgd2hvc2UgYm91bmRpbmcgcmVjdCB0byBnZXQuXG4gKiBAcmV0dXJuIHtET01SZWN0fENsaWVudFJlY3R9IFRoZSAocG9zc2libHkgc2hpbW1lZCkgcmVjdCBvZiB0aGUgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsKSB7XG4gIHZhciByZWN0O1xuXG4gIHRyeSB7XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBJZ25vcmUgV2luZG93cyA3IElFMTEgXCJVbnNwZWNpZmllZCBlcnJvclwiXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3czYy9JbnRlcnNlY3Rpb25PYnNlcnZlci9wdWxsLzIwNVxuICB9XG5cbiAgaWYgKCFyZWN0KSByZXR1cm4gZ2V0RW1wdHlSZWN0KCk7XG5cbiAgLy8gT2xkZXIgSUVcbiAgaWYgKCEocmVjdC53aWR0aCAmJiByZWN0LmhlaWdodCkpIHtcbiAgICByZWN0ID0ge1xuICAgICAgdG9wOiByZWN0LnRvcCxcbiAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0LFxuICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCxcbiAgICAgIHdpZHRoOiByZWN0LnJpZ2h0IC0gcmVjdC5sZWZ0LFxuICAgICAgaGVpZ2h0OiByZWN0LmJvdHRvbSAtIHJlY3QudG9wXG4gICAgfTtcbiAgfVxuICByZXR1cm4gcmVjdDtcbn1cblxuXG4vKipcbiAqIFJldHVybnMgYW4gZW1wdHkgcmVjdCBvYmplY3QuIEFuIGVtcHR5IHJlY3QgaXMgcmV0dXJuZWQgd2hlbiBhbiBlbGVtZW50XG4gKiBpcyBub3QgaW4gdGhlIERPTS5cbiAqIEByZXR1cm4ge0NsaWVudFJlY3R9IFRoZSBlbXB0eSByZWN0LlxuICovXG5mdW5jdGlvbiBnZXRFbXB0eVJlY3QoKSB7XG4gIHJldHVybiB7XG4gICAgdG9wOiAwLFxuICAgIGJvdHRvbTogMCxcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAwLFxuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMFxuICB9O1xufVxuXG5cbi8qKlxuICogRW5zdXJlIHRoYXQgdGhlIHJlc3VsdCBoYXMgYWxsIG9mIHRoZSBuZWNlc3NhcnkgZmllbGRzIG9mIHRoZSBET01SZWN0LlxuICogU3BlY2lmaWNhbGx5IHRoaXMgZW5zdXJlcyB0aGF0IGB4YCBhbmQgYHlgIGZpZWxkcyBhcmUgc2V0LlxuICpcbiAqIEBwYXJhbSB7P0RPTVJlY3R8P0NsaWVudFJlY3R9IHJlY3RcbiAqIEByZXR1cm4gez9ET01SZWN0fVxuICovXG5mdW5jdGlvbiBlbnN1cmVET01SZWN0KHJlY3QpIHtcbiAgLy8gQSBgRE9NUmVjdGAgb2JqZWN0IGhhcyBgeGAgYW5kIGB5YCBmaWVsZHMuXG4gIGlmICghcmVjdCB8fCAneCcgaW4gcmVjdCkge1xuICAgIHJldHVybiByZWN0O1xuICB9XG4gIC8vIEEgSUUncyBgQ2xpZW50UmVjdGAgdHlwZSBkb2VzIG5vdCBoYXZlIGB4YCBhbmQgYHlgLiBUaGUgc2FtZSBpcyB0aGUgY2FzZVxuICAvLyBmb3IgaW50ZXJuYWxseSBjYWxjdWxhdGVkIFJlY3Qgb2JqZWN0cy4gRm9yIHRoZSBwdXJwb3NlcyBvZlxuICAvLyBgSW50ZXJzZWN0aW9uT2JzZXJ2ZXJgLCBpdCdzIHN1ZmZpY2llbnQgdG8gc2ltcGx5IG1pcnJvciBgbGVmdGAgYW5kIGB0b3BgXG4gIC8vIGZvciB0aGVzZSBmaWVsZHMuXG4gIHJldHVybiB7XG4gICAgdG9wOiByZWN0LnRvcCxcbiAgICB5OiByZWN0LnRvcCxcbiAgICBib3R0b206IHJlY3QuYm90dG9tLFxuICAgIGxlZnQ6IHJlY3QubGVmdCxcbiAgICB4OiByZWN0LmxlZnQsXG4gICAgcmlnaHQ6IHJlY3QucmlnaHQsXG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodFxuICB9O1xufVxuXG5cbi8qKlxuICogSW52ZXJ0cyB0aGUgaW50ZXJzZWN0aW9uIGFuZCBib3VuZGluZyByZWN0IGZyb20gdGhlIHBhcmVudCAoZnJhbWUpIEJDUiB0b1xuICogdGhlIGxvY2FsIEJDUiBzcGFjZS5cbiAqIEBwYXJhbSB7RE9NUmVjdHxDbGllbnRSZWN0fSBwYXJlbnRCb3VuZGluZ1JlY3QgVGhlIHBhcmVudCdzIGJvdW5kIGNsaWVudCByZWN0LlxuICogQHBhcmFtIHtET01SZWN0fENsaWVudFJlY3R9IHBhcmVudEludGVyc2VjdGlvblJlY3QgVGhlIHBhcmVudCdzIG93biBpbnRlcnNlY3Rpb24gcmVjdC5cbiAqIEByZXR1cm4ge0NsaWVudFJlY3R9IFRoZSBsb2NhbCByb290IGJvdW5kaW5nIHJlY3QgZm9yIHRoZSBwYXJlbnQncyBjaGlsZHJlbi5cbiAqL1xuZnVuY3Rpb24gY29udmVydEZyb21QYXJlbnRSZWN0KHBhcmVudEJvdW5kaW5nUmVjdCwgcGFyZW50SW50ZXJzZWN0aW9uUmVjdCkge1xuICB2YXIgdG9wID0gcGFyZW50SW50ZXJzZWN0aW9uUmVjdC50b3AgLSBwYXJlbnRCb3VuZGluZ1JlY3QudG9wO1xuICB2YXIgbGVmdCA9IHBhcmVudEludGVyc2VjdGlvblJlY3QubGVmdCAtIHBhcmVudEJvdW5kaW5nUmVjdC5sZWZ0O1xuICByZXR1cm4ge1xuICAgIHRvcDogdG9wLFxuICAgIGxlZnQ6IGxlZnQsXG4gICAgaGVpZ2h0OiBwYXJlbnRJbnRlcnNlY3Rpb25SZWN0LmhlaWdodCxcbiAgICB3aWR0aDogcGFyZW50SW50ZXJzZWN0aW9uUmVjdC53aWR0aCxcbiAgICBib3R0b206IHRvcCArIHBhcmVudEludGVyc2VjdGlvblJlY3QuaGVpZ2h0LFxuICAgIHJpZ2h0OiBsZWZ0ICsgcGFyZW50SW50ZXJzZWN0aW9uUmVjdC53aWR0aFxuICB9O1xufVxuXG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiBhIHBhcmVudCBlbGVtZW50IGNvbnRhaW5zIGEgY2hpbGQgZWxlbWVudCAoaW5jbHVkaW5nIGluc2lkZVxuICogc2hhZG93IERPTSkuXG4gKiBAcGFyYW0ge05vZGV9IHBhcmVudCBUaGUgcGFyZW50IGVsZW1lbnQuXG4gKiBAcGFyYW0ge05vZGV9IGNoaWxkIFRoZSBjaGlsZCBlbGVtZW50LlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGFyZW50IG5vZGUgY29udGFpbnMgdGhlIGNoaWxkIG5vZGUuXG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zRGVlcChwYXJlbnQsIGNoaWxkKSB7XG4gIHZhciBub2RlID0gY2hpbGQ7XG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUgPT0gcGFyZW50KSByZXR1cm4gdHJ1ZTtcblxuICAgIG5vZGUgPSBnZXRQYXJlbnROb2RlKG5vZGUpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKipcbiAqIEdldHMgdGhlIHBhcmVudCBub2RlIG9mIGFuIGVsZW1lbnQgb3IgaXRzIGhvc3QgZWxlbWVudCBpZiB0aGUgcGFyZW50IG5vZGVcbiAqIGlzIGEgc2hhZG93IHJvb3QuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgVGhlIG5vZGUgd2hvc2UgcGFyZW50IHRvIGdldC5cbiAqIEByZXR1cm4ge05vZGV8bnVsbH0gVGhlIHBhcmVudCBub2RlIG9yIG51bGwgaWYgbm8gcGFyZW50IGV4aXN0cy5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFyZW50Tm9kZShub2RlKSB7XG4gIHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cbiAgaWYgKG5vZGUubm9kZVR5cGUgPT0gLyogRE9DVU1FTlQgKi8gOSAmJiBub2RlICE9IGRvY3VtZW50KSB7XG4gICAgLy8gSWYgdGhpcyBub2RlIGlzIGEgZG9jdW1lbnQgbm9kZSwgbG9vayBmb3IgdGhlIGVtYmVkZGluZyBmcmFtZS5cbiAgICByZXR1cm4gZ2V0RnJhbWVFbGVtZW50KG5vZGUpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHBhcmVudCBoYXMgZWxlbWVudCB0aGF0IGlzIGFzc2lnbmVkIHRocm91Z2ggc2hhZG93IHJvb3Qgc2xvdFxuICBpZiAocGFyZW50ICYmIHBhcmVudC5hc3NpZ25lZFNsb3QpIHtcbiAgICBwYXJlbnQgPSBwYXJlbnQuYXNzaWduZWRTbG90LnBhcmVudE5vZGVcbiAgfVxuXG4gIGlmIChwYXJlbnQgJiYgcGFyZW50Lm5vZGVUeXBlID09IDExICYmIHBhcmVudC5ob3N0KSB7XG4gICAgLy8gSWYgdGhlIHBhcmVudCBpcyBhIHNoYWRvdyByb290LCByZXR1cm4gdGhlIGhvc3QgZWxlbWVudC5cbiAgICByZXR1cm4gcGFyZW50Lmhvc3Q7XG4gIH1cblxuICByZXR1cm4gcGFyZW50O1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBgbm9kZWAgaXMgYSBEb2N1bWVudC5cbiAqIEBwYXJhbSB7IU5vZGV9IG5vZGVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RvYyhub2RlKSB7XG4gIHJldHVybiBub2RlICYmIG5vZGUubm9kZVR5cGUgPT09IDk7XG59XG5cblxuLy8gRXhwb3NlcyB0aGUgY29uc3RydWN0b3JzIGdsb2JhbGx5Llxud2luZG93LkludGVyc2VjdGlvbk9ic2VydmVyID0gSW50ZXJzZWN0aW9uT2JzZXJ2ZXI7XG53aW5kb3cuSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSA9IEludGVyc2VjdGlvbk9ic2VydmVyRW50cnk7XG5cbn0oKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzU2hpbTtcbmlmICghT2JqZWN0LmtleXMpIHtcblx0Ly8gbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZXMtc2hpbXMvZXM1LXNoaW1cblx0dmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cdHZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cdHZhciBpc0FyZ3MgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ2xvYmFsLXJlcXVpcmVcblx0dmFyIGlzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cdHZhciBoYXNEb250RW51bUJ1ZyA9ICFpc0VudW1lcmFibGUuY2FsbCh7IHRvU3RyaW5nOiBudWxsIH0sICd0b1N0cmluZycpO1xuXHR2YXIgaGFzUHJvdG9FbnVtQnVnID0gaXNFbnVtZXJhYmxlLmNhbGwoZnVuY3Rpb24gKCkge30sICdwcm90b3R5cGUnKTtcblx0dmFyIGRvbnRFbnVtcyA9IFtcblx0XHQndG9TdHJpbmcnLFxuXHRcdCd0b0xvY2FsZVN0cmluZycsXG5cdFx0J3ZhbHVlT2YnLFxuXHRcdCdoYXNPd25Qcm9wZXJ0eScsXG5cdFx0J2lzUHJvdG90eXBlT2YnLFxuXHRcdCdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG5cdFx0J2NvbnN0cnVjdG9yJ1xuXHRdO1xuXHR2YXIgZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUgPSBmdW5jdGlvbiAobykge1xuXHRcdHZhciBjdG9yID0gby5jb25zdHJ1Y3Rvcjtcblx0XHRyZXR1cm4gY3RvciAmJiBjdG9yLnByb3RvdHlwZSA9PT0gbztcblx0fTtcblx0dmFyIGV4Y2x1ZGVkS2V5cyA9IHtcblx0XHQkYXBwbGljYXRpb25DYWNoZTogdHJ1ZSxcblx0XHQkY29uc29sZTogdHJ1ZSxcblx0XHQkZXh0ZXJuYWw6IHRydWUsXG5cdFx0JGZyYW1lOiB0cnVlLFxuXHRcdCRmcmFtZUVsZW1lbnQ6IHRydWUsXG5cdFx0JGZyYW1lczogdHJ1ZSxcblx0XHQkaW5uZXJIZWlnaHQ6IHRydWUsXG5cdFx0JGlubmVyV2lkdGg6IHRydWUsXG5cdFx0JG9ubW96ZnVsbHNjcmVlbmNoYW5nZTogdHJ1ZSxcblx0XHQkb25tb3pmdWxsc2NyZWVuZXJyb3I6IHRydWUsXG5cdFx0JG91dGVySGVpZ2h0OiB0cnVlLFxuXHRcdCRvdXRlcldpZHRoOiB0cnVlLFxuXHRcdCRwYWdlWE9mZnNldDogdHJ1ZSxcblx0XHQkcGFnZVlPZmZzZXQ6IHRydWUsXG5cdFx0JHBhcmVudDogdHJ1ZSxcblx0XHQkc2Nyb2xsTGVmdDogdHJ1ZSxcblx0XHQkc2Nyb2xsVG9wOiB0cnVlLFxuXHRcdCRzY3JvbGxYOiB0cnVlLFxuXHRcdCRzY3JvbGxZOiB0cnVlLFxuXHRcdCRzZWxmOiB0cnVlLFxuXHRcdCR3ZWJraXRJbmRleGVkREI6IHRydWUsXG5cdFx0JHdlYmtpdFN0b3JhZ2VJbmZvOiB0cnVlLFxuXHRcdCR3aW5kb3c6IHRydWVcblx0fTtcblx0dmFyIGhhc0F1dG9tYXRpb25FcXVhbGl0eUJ1ZyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0LyogZ2xvYmFsIHdpbmRvdyAqL1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRmb3IgKHZhciBrIGluIHdpbmRvdykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCFleGNsdWRlZEtleXNbJyQnICsga10gJiYgaGFzLmNhbGwod2luZG93LCBrKSAmJiB3aW5kb3dba10gIT09IG51bGwgJiYgdHlwZW9mIHdpbmRvd1trXSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0ZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUod2luZG93W2tdKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSgpKTtcblx0dmFyIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlSWZOb3RCdWdneSA9IGZ1bmN0aW9uIChvKSB7XG5cdFx0LyogZ2xvYmFsIHdpbmRvdyAqL1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhaGFzQXV0b21hdGlvbkVxdWFsaXR5QnVnKSB7XG5cdFx0XHRyZXR1cm4gZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUobyk7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGUobyk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fTtcblxuXHRrZXlzU2hpbSA9IGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG5cdFx0dmFyIGlzT2JqZWN0ID0gb2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnO1xuXHRcdHZhciBpc0Z1bmN0aW9uID0gdG9TdHIuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXHRcdHZhciBpc0FyZ3VtZW50cyA9IGlzQXJncyhvYmplY3QpO1xuXHRcdHZhciBpc1N0cmluZyA9IGlzT2JqZWN0ICYmIHRvU3RyLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cdFx0dmFyIHRoZUtleXMgPSBbXTtcblxuXHRcdGlmICghaXNPYmplY3QgJiYgIWlzRnVuY3Rpb24gJiYgIWlzQXJndW1lbnRzKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3Qua2V5cyBjYWxsZWQgb24gYSBub24tb2JqZWN0Jyk7XG5cdFx0fVxuXG5cdFx0dmFyIHNraXBQcm90byA9IGhhc1Byb3RvRW51bUJ1ZyAmJiBpc0Z1bmN0aW9uO1xuXHRcdGlmIChpc1N0cmluZyAmJiBvYmplY3QubGVuZ3RoID4gMCAmJiAhaGFzLmNhbGwob2JqZWN0LCAwKSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBvYmplY3QubGVuZ3RoOyArK2kpIHtcblx0XHRcdFx0dGhlS2V5cy5wdXNoKFN0cmluZyhpKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGlzQXJndW1lbnRzICYmIG9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IG9iamVjdC5sZW5ndGg7ICsraikge1xuXHRcdFx0XHR0aGVLZXlzLnB1c2goU3RyaW5nKGopKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Zm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcblx0XHRcdFx0aWYgKCEoc2tpcFByb3RvICYmIG5hbWUgPT09ICdwcm90b3R5cGUnKSAmJiBoYXMuY2FsbChvYmplY3QsIG5hbWUpKSB7XG5cdFx0XHRcdFx0dGhlS2V5cy5wdXNoKFN0cmluZyhuYW1lKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaGFzRG9udEVudW1CdWcpIHtcblx0XHRcdHZhciBza2lwQ29uc3RydWN0b3IgPSBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZUlmTm90QnVnZ3kob2JqZWN0KTtcblxuXHRcdFx0Zm9yICh2YXIgayA9IDA7IGsgPCBkb250RW51bXMubGVuZ3RoOyArK2spIHtcblx0XHRcdFx0aWYgKCEoc2tpcENvbnN0cnVjdG9yICYmIGRvbnRFbnVtc1trXSA9PT0gJ2NvbnN0cnVjdG9yJykgJiYgaGFzLmNhbGwob2JqZWN0LCBkb250RW51bXNba10pKSB7XG5cdFx0XHRcdFx0dGhlS2V5cy5wdXNoKGRvbnRFbnVtc1trXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoZUtleXM7XG5cdH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGtleXNTaGltO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgaXNBcmdzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpO1xuXG52YXIgb3JpZ0tleXMgPSBPYmplY3Qua2V5cztcbnZhciBrZXlzU2hpbSA9IG9yaWdLZXlzID8gZnVuY3Rpb24ga2V5cyhvKSB7IHJldHVybiBvcmlnS2V5cyhvKTsgfSA6IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxudmFyIG9yaWdpbmFsS2V5cyA9IE9iamVjdC5rZXlzO1xuXG5rZXlzU2hpbS5zaGltID0gZnVuY3Rpb24gc2hpbU9iamVjdEtleXMoKSB7XG5cdGlmIChPYmplY3Qua2V5cykge1xuXHRcdHZhciBrZXlzV29ya3NXaXRoQXJndW1lbnRzID0gKGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vIFNhZmFyaSA1LjAgYnVnXG5cdFx0XHR2YXIgYXJncyA9IE9iamVjdC5rZXlzKGFyZ3VtZW50cyk7XG5cdFx0XHRyZXR1cm4gYXJncyAmJiBhcmdzLmxlbmd0aCA9PT0gYXJndW1lbnRzLmxlbmd0aDtcblx0XHR9KDEsIDIpKTtcblx0XHRpZiAoIWtleXNXb3Jrc1dpdGhBcmd1bWVudHMpIHtcblx0XHRcdE9iamVjdC5rZXlzID0gZnVuY3Rpb24ga2V5cyhvYmplY3QpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBmdW5jLW5hbWUtbWF0Y2hpbmdcblx0XHRcdFx0aWYgKGlzQXJncyhvYmplY3QpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9yaWdpbmFsS2V5cyhzbGljZS5jYWxsKG9iamVjdCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvcmlnaW5hbEtleXMob2JqZWN0KTtcblx0XHRcdH07XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdE9iamVjdC5rZXlzID0ga2V5c1NoaW07XG5cdH1cblx0cmV0dXJuIE9iamVjdC5rZXlzIHx8IGtleXNTaGltO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzU2hpbTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHR2YXIgc3RyID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG5cdHZhciBpc0FyZ3MgPSBzdHIgPT09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXHRpZiAoIWlzQXJncykge1xuXHRcdGlzQXJncyA9IHN0ciAhPT0gJ1tvYmplY3QgQXJyYXldJyAmJlxuXHRcdFx0dmFsdWUgIT09IG51bGwgJiZcblx0XHRcdHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcblx0XHRcdHR5cGVvZiB2YWx1ZS5sZW5ndGggPT09ICdudW1iZXInICYmXG5cdFx0XHR2YWx1ZS5sZW5ndGggPj0gMCAmJlxuXHRcdFx0dG9TdHIuY2FsbCh2YWx1ZS5jYWxsZWUpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuXHR9XG5cdHJldHVybiBpc0FyZ3M7XG59O1xuIiwiQXJyYXkucHJvdG90eXBlLmZsYXR8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsXCJmbGF0XCIse2NvbmZpZ3VyYWJsZTohMCx2YWx1ZTpmdW5jdGlvbiByKCl7dmFyIHQ9aXNOYU4oYXJndW1lbnRzWzBdKT8xOk51bWJlcihhcmd1bWVudHNbMF0pO3JldHVybiB0P0FycmF5LnByb3RvdHlwZS5yZWR1Y2UuY2FsbCh0aGlzLGZ1bmN0aW9uKGEsZSl7cmV0dXJuIEFycmF5LmlzQXJyYXkoZSk/YS5wdXNoLmFwcGx5KGEsci5jYWxsKGUsdC0xKSk6YS5wdXNoKGUpLGF9LFtdKTpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzKX0sd3JpdGFibGU6ITB9KSxBcnJheS5wcm90b3R5cGUuZmxhdE1hcHx8T2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSxcImZsYXRNYXBcIix7Y29uZmlndXJhYmxlOiEwLHZhbHVlOmZ1bmN0aW9uKHIpe3JldHVybiBBcnJheS5wcm90b3R5cGUubWFwLmFwcGx5KHRoaXMsYXJndW1lbnRzKS5mbGF0KCl9LHdyaXRhYmxlOiEwfSlcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIGludGVyc2VjdGlvbi1vYnNlcnZlciwgYXJyYXktZmxhdC1wb2x5ZmlsbCBhbmQgZ2xvYmFsdGhpcyB3ZXJlIGFkZGVkIHRvIHN1cHBvcnQgaU9TIDExIGRldmljZXMgKGlQYWQgbWluaSA0LCBpUGFkIGFpciAyLCBldGMpIHNwZWNpZmljYWxseSBmb3IgdGhlIGxpYnJhcnkgdjMgd2Vic2l0ZSBsYXVuY2hcbnJlcXVpcmUoJ2ludGVyc2VjdGlvbi1vYnNlcnZlcicpO1xucmVxdWlyZSgnYXJyYXktZmxhdC1wb2x5ZmlsbCcpO1xuY29uc3QgZ2xvYmFsVGhpc0ZuID0gcmVxdWlyZSgnZ2xvYmFsdGhpcycpO1xuXG5pZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgd2luZG93Lmdsb2JhbFRoaXMgPSBnbG9iYWxUaGlzRm4oKTtcbn0iLCJjb25zb2xlLmxvZygnSGVsbG8gZnJvbSBVQ0RsaWIgQXdhcmRzIScpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9