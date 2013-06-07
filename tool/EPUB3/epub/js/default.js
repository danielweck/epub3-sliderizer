/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2012-11-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

(function (view) {

"use strict";

if (!('HTMLElement' in view) && !('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.className)
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.className = this.toString();
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, forse) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			forse !== true && "remove"
		:
			forse !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}




////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////


(function(window, document) {
	'use strict';

	var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element, // IE6 throws without typeof check

		fn = (function() {
			var val, valLength;
			var fnMap = [
				[
					'requestFullscreen',
					'exitFullscreen',
					'fullscreenElement',
					'fullscreenEnabled',
					'fullscreenchange',
					'fullscreenerror'
				],
				// new WebKit
				[
					'webkitRequestFullscreen',
					'webkitExitFullscreen',
					'webkitFullscreenElement',
					'webkitFullscreenEnabled',
					'webkitfullscreenchange',
					'webkitfullscreenerror'

				],
				// old WebKit (Safari 5.1)
				[
					'webkitRequestFullScreen',
					'webkitCancelFullScreen',
					'webkitCurrentFullScreenElement',
					'webkitCancelFullScreen',
					'webkitfullscreenchange',
					'webkitfullscreenerror'

				],
				[
					'mozRequestFullScreen',
					'mozCancelFullScreen',
					'mozFullScreenElement',
					'mozFullScreenEnabled',
					'mozfullscreenchange',
					'mozfullscreenerror'
				]
			];
			var i = 0;
			var l = fnMap.length;
			var ret = {};

			for (; i < l; i++) {
				val = fnMap[i];
				if (val && val[1] in document) {
					for (i = 0, valLength = val.length; i < valLength; i++) {
						ret[fnMap[0][i]] = val[i];
					}
					return ret;
				}
			}
			return false;
		})(),

		screenfull = {
			request: function(elem) {
				var request = fn.requestFullscreen;

				elem = elem || document.documentElement;

				// Work around Safari 5.1 bug: reports support for
				// keyboard in fullscreen even though it doesn't.
				// Browser sniffing, since the alternative with
				// setTimeout is even worse
				if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
					elem[request]();
				} else {
					elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
				}
			},
			exit: function() {
				document[fn.exitFullscreen]();
			},
			toggle: function( elem ) {
				if (this.isFullscreen) {
					this.exit();
				} else {
					this.request(elem);
				}
			},
			onchange: function() {},
			onerror: function() {}
		};

	if (!fn) {
		return window.screenfull = false;
	}

	Object.defineProperties(screenfull, {
		isFullscreen: {
			get: function() {
				return !!document[fn.fullscreenElement];
			}
		},
		element: {
			enumerable: true,
			get: function() {
				return document[fn.fullscreenElement];
			}
		},
		enabled: {
			enumerable: true,
			get: function() {
				// Coerce to boolean in case of old WebKit
				return !!document[fn.fullscreenEnabled];
			}
		}
	});

	document.addEventListener(fn.fullscreenchange, function(e) {
		screenfull.onchange.call(screenfull, e);
	});

	document.addEventListener(fn.fullscreenerror, function(e) {
		screenfull.onerror.call(screenfull, e);
	});

	window.screenfull = screenfull;

})(window, document);


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {

    // closest thing possible to the ECMAScript 5 internal IsCallable
    // function 
    if (typeof this !== "function")
    throw new TypeError(
      "Function.prototype.bind - what is trying to be fBound is not callable"
    );

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply( this instanceof fNOP ? this : oThis || window,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

var $ = (HTMLElement.prototype.$ = function(aQuery) {
  return this.querySelector(aQuery);
}).bind(document);

var $$ = (HTMLElement.prototype.$$ = function(aQuery) {
  return this.querySelectorAll(aQuery);
}).bind(document);

$$.forEach = function(nodeList, fun) {
  Array.prototype.forEach.call(nodeList, fun);
}


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

var Daniel = {
	epubReadingSystem: null,
	readium: true,
	prev: "",
	next: "",
	toc: "../nav.xhtml"
};

Daniel.gotoToc = function()
{
	if (this.toc == "") 
	{
		return;
	}
	
	window.location = this.toc;
}

Daniel.gotoPrevious = function()
{
	if (this.prev == "") 
	{
		return;
	}
	
	window.location = this.prev;
}

Daniel.gotoNext = function()
{
	if (this.next == "") 
	{
		return;
	}
	
	window.location = this.next;
}

Daniel.onkeydown = function(aEvent) {

	if (this.epubReadingSystem != null)
	{
		return;
	}
	
  // Don't intercept keyboard shortcuts
  if (aEvent.altKey
    || aEvent.ctrlKey
    || aEvent.metaKey
    || aEvent.shiftKey) {
    return;
  }

//console.log(aEvent.keyCode);

  if ( aEvent.keyCode == 37 // left arrow
    || aEvent.keyCode == 38 // up arrow
    || aEvent.keyCode == 33 // page up
  ) {
    aEvent.preventDefault();

	this.gotoPrevious();
  }
  else if ( aEvent.keyCode == 39 // right arrow
    || aEvent.keyCode == 40 // down arrow
    || aEvent.keyCode == 34 // page down
  ) {
    aEvent.preventDefault();

	this.gotoNext();
  }
  else if (aEvent.keyCode == 35) { // end
    aEvent.preventDefault();

	this.gotoNext();
  }
  else if (aEvent.keyCode == 36) { // home
    aEvent.preventDefault();

	this.gotoPrevious();
  }
  else if (aEvent.keyCode == 70) { // f
    aEvent.preventDefault();
	
	if (typeof screenfull != 'undefined') {
		screenfull.toggle();
	}
  }
  else if (aEvent.keyCode == 32) { // space
		aEvent.preventDefault();
		
		this.gotoNext();
	}
  else if (aEvent.keyCode == 77) { // m
		aEvent.preventDefault();
		
		if (this.prev != "")
{
	this.gotoToc();
}
	}
/*	else if (aEvent.keyCode == 13) { // RETURN / ENTER
		aEvent.preventDefault();
		
		this.gotoToc();
	}*/
	else if (aEvent.keyCode == 27) { // ESC
		aEvent.preventDefault();
	
		if (typeof screenfull != 'undefined') {
			screenfull.exit();
		}
	}
}

Daniel.initTouch = function() {


if (this.epubReadingSystem != null)
{
	return;
}

  var orgX, newX;
  var tracking = false;


  function start(aEvent)
  {
//    aEvent.preventDefault();
    tracking = true;
    orgX = aEvent.changedTouches[0].pageX;
  }

  function move(aEvent)
  {
    if (!tracking) return;
	
    newX = aEvent.changedTouches[0].pageX;
	
    if (orgX - newX > 100)
	{
      tracking = false;
	  
      this.gotoNext();
	  
    }
	else if (orgX - newX < -100)
	{
        tracking = false;
		
        this.gotoPrevious();
    }
  }

  var db = document.body;
  db.addEventListener("touchstart", start.bind(this), false);
  db.addEventListener("touchmove", move.bind(this), false);


}


Daniel.onresize_resetTransform = function() {

	if (this.epubReadingSystem == null)
	{
		return;
	}
	
	var db = document.body;

db.style.MozTransform = null;
db.style.WebkitTransform = null;
db.style.OTransform = null;
db.style.msTransform = null;
db.style.transform = null;

}


// Retina: 2048 x 1536
// ratio 1.29:1
// meta name="viewport" content="width=1290,height=1000"
// meta name="viewport" content="width=1900,height=1470"
// meta name="viewport" content="width=2400,height=1860"
// target-densitydpi=device-dpi, user-scalable=no, initial-scale=1, minimum-scale=1, maximum-scale=1

Daniel.onresize = function() {

	if (this.epubReadingSystem != null)
	{
		return;
	}
	
	var db = document.body;

	var sx = db.clientWidth / window.innerWidth;
	var sy = db.clientHeight / window.innerHeight;
	var ratio = 1.0 / Math.max(sx, sy);

//document.documentElement.className = "resized";

	var transformOrigin = "0px 0px";

db.style.MozTransformOrigin = transformOrigin;
db.style.WebkitTransformOrigin = transformOrigin;
db.style.OTransformOrigin = transformOrigin;
db.style.msTransformOrigin = transformOrigin;
db.style.transformOrigin = transformOrigin;


var newWidth = db.clientWidth * ratio;
var offsetX = 0;
if (window.innerWidth > newWidth)
{
	offsetX = (window.innerWidth - newWidth) / 2;
}
offsetX = Math.round( offsetX * 1000 ) / 1000;

var newHeight = db.clientHeight * ratio;
var offsetY = 0;
if (window.innerHeight > newHeight)
{
	offsetY = (window.innerHeight - newHeight) / 2;
}
offsetY = Math.round( offsetY * 1000 ) / 1000;


var transform = "translate(" + offsetX + "px," + offsetY + "px)" + " " + "scale(" + ratio + ")" ;

db.style.MozTransform = transform;
db.style.WebkitTransform = transform;
db.style.OTransform = transform;
db.style.msTransform = transform;
db.style.transform = transform;

}

Daniel.onorientationchange = function() {

if (this.epubReadingSystem != null)
{
	return;
}


var viewport = $("meta[name=viewport]");
if (typeof viewport != 'undefined')
{
	/*
	viewport.parentNode.removeChild(viewport);

	alert("removed.");
	
	viewport = $("meta[name=viewport]");
	if (viewport!=null)
	{
alert("NOT REMOVED? "+ viewport);
	}
	*/

	var db = document.body;

		//alert(window.innerWidth + 'x' + window.innerHeight);
		//alert(db.clientWidth + 'x' + db.clientHeight);

	var sx = db.clientWidth / window.innerWidth;
	var sy = db.clientHeight / window.innerHeight;
	var ratio = 1.0 / Math.max(sx, sy);
	
	var adjustedWidth = db.clientWidth * ratio;
	var adjustedHeight = db.clientHeight * ratio;

	var rounded = Math.round( ratio * 1000000.0 ) / 1000000.0;
	//alert(ratio + "  -  " + rounded);
	//rounded = 1.0;
		
		//alert(sx + "  -  " + sy);
		
	//alert(window.innerWidth + "-" + adjustedWidth + "/" + window.innerHeight + "-" + adjustedHeight);

//		viewport.setAttribute('content', 'width=device-width, user-scalable=no, initial-scale=1, minimum-scale=1, maximum-scale=1'); //, target-densitydpi=device-dpi

/*
if (/iPhone/.test(navigator.userAgent) || /iPad/.test(navigator.userAgent)) {
//if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i))
{
	viewport.setAttribute('content','width=device-width, minimum-scale=1.0, maximum-scale=1.0');
	
    document.body.addEventListener('gesturestart', function() {

		...

    }, false);
  }
}
*/

viewport.setAttribute('content',
'width=' + (Math.round( adjustedWidth * 1000000.0 ) / 1000000.0)
+ ',height=' + (Math.round( adjustedHeight * 1000000.0 ) / 1000000.0 - 300) +
',user-scalable=yes'+',initial-scale='+rounded+',minimum-scale='+rounded+',maximum-scale=2');

/*	
		//if (window.innerWidth > adjustedWidth)
		if (sx > sy)
		{
			viewport.setAttribute('content', 'height=' + window.innerHeight +',initial-scale='+rounded);
		}
		else {
			viewport.setAttribute('content', 'width=' + window.innerWidth +',initial-scale='+rounded);
		}
*/
	
		//var heightAdjusted = window.innerHeight; // - 400;
		//sy = db.clientHeight / heightAdjusted;
		//ratio = 1/Math.max(sx, sy);

		/*
		var ratioX = window.innerWidth / db.clientWidth;
		var ratioY = window.innerHeight / db.clientHeight;

				var width = window.innerWidth;
				var height = window.innerHeight;*/
				//
				
//				alert(window.innerWidth + 'x' + window.innerHeight + ' // ' + width + 'x' + height + ' // ' + ratioX + 'x' + ratioY);
		


/*		
		
		viewport.setAttribute('content', 'width='+width+',height='+height+',initial-scale='+rounded);
//		viewport.setAttribute('content', 'width=device-width');
*/

}


this.onresize();

}


Daniel.init = function() {
	
//this.initTouch();

if (this.epubReadingSystem != null)
{
	    var a = document.createElement('a');
				a.id="epubReadingSystemLink";
				a.title="EPUB Reading System info";
	    a.href = "javascript:window.alert(window.Daniel.epubReadingSystem.name + '_' + window.Daniel.epubReadingSystem.version)";
//	    a.href = "javascript:window.parent.alert('daniel')";
//	    a.className = 'previous';
	    a.innerHTML = Daniel.epubReadingSystem.name + '_' + Daniel.epubReadingSystem.version;

	    document.body.insertBefore(a, document.body.children[0]);
}
else
{
var links = Array.prototype.slice.call($$("head > link"));
if (typeof links != 'undefined')
{		
for (var i = 0; i < links.length; i++)
{
	if (typeof links[i].attributes == 'undefined' || links[i].attributes.length <= 0 || typeof links[i].attributes['href'] == 'undefined')
	{
		continue;
	}
	
	var rel = links[i].attributes['rel'];
	
	if (typeof rel != 'undefined')
	{
		if (rel.nodeValue === "prev")
		{
			this.prev = links[i].attributes['href'].nodeValue;
		}
		else if (rel.nodeValue === "next")
		{
			this.next = links[i].attributes['href'].nodeValue;
		}
	}
}


if (this.next != "")
{
    var a = document.createElement('a');
			a.id="nextLink";
				a.title="Next slide";
				
    a.href = this.next;
//    a.className = 'next';
    a.innerHTML = "&#9658;";
	
    document.body.insertBefore(a, document.body.children[0]);
}

if (this.prev != "")
{
    var a = document.createElement('a');
			a.id="prevLink";
				a.title="Previous slide";
				
    a.href = this.prev;
//    a.className = 'previous';
    a.innerHTML = "&#9668;";
	
    document.body.insertBefore(a, document.body.children[0]);
	


	var aa = document.createElement('a');
	aa.id="tocLink";
				aa.title="Menu slide";
				
	aa.href = this.toc;
//	aa.className = 'toc';
	aa.innerHTML = "&#9733;";

	document.body.insertBefore(aa, document.body.children[0]);

	
}

}
}

}

function ready() {
	
	console.log(window.navigator.userAgent);
	
	
	
	Daniel.readium = typeof window.parent.Readium != 'undefined';

	if (typeof navigator.epubReadingSystem != 'undefined')
{
	Daniel.epubReadingSystem = navigator.epubReadingSystem;
}

//	alert("epubReadingSystem: "+ Daniel.epubReadingSystem);
	if (Daniel.epubReadingSystem != null)
	{
			console.log(Daniel.epubReadingSystem.name);
			console.log(Daniel.epubReadingSystem.version);
	
//			document.body.className = "epubReadingSystem";
						document.body.classList.add("epubReadingSystem");
		}

	
  Daniel.init();


    
  if (Daniel.epubReadingSystem == null)
  {
  window.onkeydown = Daniel.onkeydown.bind(Daniel);

  if (typeof window.orientation != 'undefined')
  {
  window.onorientationchange = Daniel.onorientationchange.bind(Daniel);
	  Daniel.onorientationchange();
  }
  else
  {
	    window.onresize = Daniel.onresize.bind(Daniel);
	  Daniel.onresize();
  }
  
	
//			var elems = Array.prototype.slice.call($$("img[class]"));
			$$.forEach(
				$$("img[class]"),
				function(elem)
				{	
					if (elem.classList.contains("animatedz"))
					{
						elem.classList.remove("animatedz");

						elem.classList.add("animated"); // HIDES BY DEFAULT
						
						elem.classList.add("animateStart"); // THEN ANIMATES
					}
				}
			);
			$$.forEach(
				$$("span[class]"),
				function(elem)
				{	
					if (elem.classList.contains("-epub-media-overlay-activex"))
					{
						elem.classList.remove("-epub-media-overlay-activex");

						elem.classList.add("-epub-media-overlay-active");
					}
				}
			);


  
} else{
	Daniel.onresize_resetTransform();
}


}

function readyFirst()
{
		  Daniel.onresize();
}

window.onload = readyFirst;

// Note: the epubReadingSystem object may not be ready when directly using the
// window.onload callback function (from within an (X)HTML5 EPUB3 content document's Javascript code)
// To address this issue, the recommended code is:
// -----
//function ready() { console.log(navigator.epubReadingSystem); };
// 
// // With jQuery:
// $(document).ready(function () { setTimeout(ready, 200); });
// 
// // With the window "load" event:
// window.addEventListener("load", function () { setTimeout(ready, 200); }, false);
// 
// // With the modern document "DOMContentLoaded" event:
document.addEventListener("DOMContentLoaded", function(e) { setTimeout(ready, 200); }, false);