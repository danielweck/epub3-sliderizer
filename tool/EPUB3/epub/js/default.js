"use strict";

// REQUIRES:
// screenfull.js
// classList.js
// hammer.js + fakemultitouch + showtouches
// jquery.js
// jquery.mousewheel.js
// jquery.blockUI.js

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// ----------
// IE 9 F12

if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function getUrlQueryParam(name)
{
	var urlQueryParams = window.urlQueryParams
	|| (function()
	{
		var urlQueryParams_ = {};
		
		var regexp = /\??([^=^&^\?]+)(?:=([^&]*))?&?/gi;
		
		var match;
		while (match = regexp.exec(window.location.search))
		{
			if (!match || match.length < 3)
			{
				break;
			}
			
			urlQueryParams_[decodeURIComponent(match[1])] = match[2] === "" ? null : decodeURIComponent(match[2]);
		}
		
		return window.urlQueryParams = urlQueryParams_;
	})();
	
	if (typeof urlQueryParams[name] === "undefined")
	{
		return null;
	}
	else
	{
		var value = urlQueryParams[name];
		
		return value === null ? "" : value;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
// https://github.com/documentcloud/underscore/blob/master/underscore.js
//
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate)
{
	var result;
	var timeout = null;
	
	return function()
	{
		var context = this, args = arguments;
		var later = function()
		{
			timeout = null;
			if (!immediate)
			{
				result = func.apply(context, args);
			}
		};
		
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow)
		{
			result = func.apply(context, args);
		}
		return result;
	};
}
//
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time.
function throttle(func, wait, immediate)
{
	var context, args, result;
	var timeout = null;
	var previous = 0;
	var later = function()
	{
		previous = new Date;
		timeout = null;
		result = func.apply(context, args);
	};
    
	return function()
	{
		var now = new Date;
		if (!previous && immediate === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		
		if (remaining <= 0)
		{
			clearTimeout(timeout);
			timeout = null;
			previous = now;
			result = func.apply(context, args);
		}
		else if (!timeout)
		{
			timeout = setTimeout(later, remaining);
		}
		
		return result;
	};
}
  
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

if (!Function.prototype.bind)
{
	Function.prototype.bind = function (oThis)
	{
		if (typeof this !== "function")
		{
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}
 
		var aArgs =
			Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function ()
			{
				return fToBind.apply(
					//this instanceof fNOP && oThis ? this : oThis,
					this instanceof fNOP ? this : oThis || window,
					aArgs.concat(Array.prototype.slice.call(arguments))
					);
			};
 
			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
 
			return fBound;
	};
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function STACK_TRACE(obj)
{
	if (obj)
	{
		console.log(obj);
	}
	
	try
	{
		throw new Error("STACK TRACE DEBUG");
	}
	catch(ex)
	{
		console.log(ex.stack);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

var querySelectorZ = (HTMLElement.prototype.querySelectorZ = function(selector)
{
	return this.querySelector(selector);
}).bind(document);

var querySelectorAllZ = (HTMLElement.prototype.querySelectorAllZ = function(selector)
{
	return this.querySelectorAll(selector);
}).bind(document);

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function (sKey) {
    return unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");

    return true;
  },
  removeItem: function (sKey, sPath) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = unescape(aKeys[nIdx]); }
    return aKeys;
  }
};

function getCookie(name)
{
	return docCookies.getItem(name);
}

function setCookie(name, value)
{	
	if (docCookies.hasItem(name))
	{
		docCookies.removeItem(name, "");
		docCookies.removeItem(name, "/");
	}

	var date = new Date();
	date.setDate(date.getDate() + 365);
	
	docCookies.setItem(name, value, date.toUTCString(), "/");
}

//####################################################################################################
//####################################################################################################

(function(undefined) {

var UNDEF = typeof undefined;

function isDefinedAndNotNull(obj)
{
	return typeof obj !== UNDEF && obj !== null;
}

var Epub3Sliderizer = {
	onResizeThrottled: null,
	epubReadingSystem: null,
	readium: false,
	kobo: false, //DELAYED !! typeof window.KOBO_TAG !== UNDEF, //typeof window.nextKoboSpan !== UNDEF || 
	ibooks: false,
	playbooks: false,
	azardi: navigator.userAgent.toLowerCase().indexOf('azardi') > -1,
	staticMode: false,
	authorMode: false,
	basicMode: false,
	epubMode: false,
	prev: "",
	next: "",
	toc: "../nav.xhtml",
	epub: "",
	reverse: false,
	thisFilename: null,
	from: null,
	hash: null,
	incrementals: null,
	increment: -1,
	bodyRoot: null,
	transforms: new Array(),
	totalZoom: 1,
	pauseEvents: false,
	defaultFontSize: null,
	reflow: false,
	cookieFontSize: "Epub3Sliderizer_FontSize",
	cookieReflow: "Epub3Sliderizer_Reflow",
	firefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
	android: navigator.userAgent.toLowerCase().indexOf('android') > -1,
	opera: isDefinedAndNotNull(window.opera) || navigator.userAgent.toLowerCase().indexOf(' opr/') >= 0,
	IE: navigator.userAgent.indexOf('MSIE') >= 0 && navigator.userAgent.toLowerCase().indexOf('opera') < 0,
	mobile: navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile)/)
	// && navigator.userAgent.match(/AppleWebKit/)
};

// ----------

Epub3Sliderizer.updateFontSize = function(size)
{
	document.body.style.fontSize = Math.round(size) + "px";
    setCookie(this.cookieFontSize, document.body.style.fontSize);
}

// ----------

Epub3Sliderizer.resetFontSize = function()
{
	this.updateFontSize(this.defaultFontSize);
}

// ----------

Epub3Sliderizer.decreaseFontSize = function()
{
	if (this.defaultFontSize)
	{
		var fontSizeIncrease = 5.0;

		var size = Math.round(parseFloat(document.body.style.fontSize));
		
		var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;

		fontSizeIncreaseFactor --;
		
		if (fontSizeIncreaseFactor < 0)
		{
			fontSizeIncreaseFactor = 0;
		}

		this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
	}	
}

// ----------

Epub3Sliderizer.increaseFontSize = function()
{	
	if (this.defaultFontSize)
	{
		var fontSizeIncrease = 5.0;

		var size = Math.round(parseFloat(document.body.style.fontSize));
		
		var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;

		fontSizeIncreaseFactor ++;
		
		if (fontSizeIncreaseFactor > 9)
		{
			fontSizeIncreaseFactor = 9;
		}

		this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
	}
}

// ----------

Epub3Sliderizer.toggleControlsPanel = function()
{
	var controls = document.getElementById("epb3sldrzr-controls");

	if (!controls.style.display || controls.style.display === "none")
	{
		controls.style.display = "block";

		/*
		setTimeout(function()
		{
			controls.style.display = "none";
		}, 5000);
		*/
	}
	else
	{
		controls.style.display = "none";
		
		/*
		setTimeout(function()
		{
			controls.style.display = "none";
		}, 600);
		*/
	}
}

// ----------

Epub3Sliderizer.AUTHORize = function(selector)
{
	if (!isDefinedAndNotNull($))
	{
		return;
	}

	alert("AUTHOR MODE");
	
	var elems = $(selector);
	elems.addClass("ui-widget-content");
	elems.addClass("epb3sldrzr-author");
	
	// Mhmmm? ...
	elems.addClass("epb3sldrzr-author-INIT");


	if (isDefinedAndNotNull($(window).draggable))
	{
		elems.draggable();
	}

	if (isDefinedAndNotNull($(window).resizable))
	{
		elems.resizable();
	}

	/*
	if (isDefinedAndNotNull($(window).selectable))
	{
		elems.selectable();
	}
	*/
}

// ----------

Epub3Sliderizer.isEpubReadingSystem = function()
{
	return this.epubReadingSystem !== null || this.readium || this.kobo || this.ibooks || this.playbooks || this.azardi;
}

// ----------

Epub3Sliderizer.urlParams = function(includeNewFrom)
{
	var params = "?";
	
	if (this.staticMode)
	{
		params += "static&"
	}
	if (this.authorMode)
	{
		params += "author&"
	}
	if (this.basicMode)
	{
		params += "basic&"
	}
	if (this.epubMode)
	{
		params += "epub&"
	}

	if (includeNewFrom && this.thisFilename !== null)
	{
		var noext = this.thisFilename;
		var i = noext.indexOf('.');
		if (i >= 0)
		{
			noext = noext.substring(0, i);
		}
		
		params += ("from=" + encodeURIComponent(noext) + "&");
	}
	
	return params;
}

// ----------

Epub3Sliderizer.reloadSlide = function(mode)
{	
	if (!this.thisFilename || this.thisFilename === "")
	{
		return;
	}
	
	window.location = this.thisFilename + "?" + mode + "&" + (this.from !== null ? "from=" + encodeURIComponent(this.from) + "&" : "");
}

// ----------

Epub3Sliderizer.gotoToc = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	if (this.toc === "") 
	{
		return;
	}
	
	window.location = this.toc + this.urlParams(true);
}

// ----------

Epub3Sliderizer.gotoNext_ = function()
{
	if (this.reflow && this.mobile)
	{
		this.nextIncremental(false);
	}
	else
	{
		this.gotoNext();
	}
}

// ----------

Epub3Sliderizer.gotoPrevious_ = function()
{
	if (this.reflow && this.mobile)
	{
		this.nextIncremental(true);
	}
	else
	{
		this.gotoPrevious();
	}
}

// ----------

Epub3Sliderizer.gotoPrevious = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	if (this.prev === "") 
	{
		return;
	}
	
	window.location = this.prev + this.urlParams(true);
}

// ----------

Epub3Sliderizer.gotoNext = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	if (this.next === "") 
	{
		return;
	}
	
	window.location = this.next + this.urlParams(true);
}

// ----------

Epub3Sliderizer.transition = function(on, milliseconds)
{
	if (on)
	{
		if (!this.basicMode && !this.opera)
		{
			var transition = "all "+milliseconds+"ms ease-in-out";
			this.bodyRoot.style.MozTransition = transition;
			this.bodyRoot.style.WebkitTransition = transition;
			this.bodyRoot.style.OTransition = transition;
			this.bodyRoot.style.msTransition = transition;
			this.bodyRoot.style.transition = transition;
		}
	}
	else
	{
		var that = this;
		setTimeout(function()
		{
			that.bodyRoot.style.MozTransition = null;
			that.bodyRoot.style.WebkitTransition = null;
			that.bodyRoot.style.OTransition = null;
			that.bodyRoot.style.msTransition = null;
			that.bodyRoot.style.transition = null;
		}, milliseconds + 10);
	}
}

// ----------

Epub3Sliderizer.pan = function(x, y)
{
	this.transition(true, 500);
	
	this.transforms.push({
		rotation: 0,
		zoom: 1,
		left: 0,
		top: 0,
		transX: x,
		transY: y
	});

	this.onResize();

	this.transition(false, 500);
}

// ----------

Epub3Sliderizer.resetTransforms = function()
{
	if (this.transforms)
	{
		this.transforms.length = 0;
	}
	else
	{
		this.transforms = new Array();
	}
}

// ----------

Epub3Sliderizer.toggleZoom = function(x, y)
{
	this.transition(true, 500);

	if (this.totalZoom !== 1)
	{
		this.resetResize();
	}
	else
	{
		this.totalZoom = 2;

		this.resetTransforms();
		this.transforms.push({
			rotation: 0,
			zoom: this.totalZoom,
			left: x,
			top: y,
			transX: 0,
			transY: 0
		});

		this.onResize();
	}

	this.transition(false, 500);
}


// ----------

Epub3Sliderizer.zoomTo = function(element)
{
	if (this.totalZoom !== 1)
	{
		this.transition(true, 500);
		
		this.resetResize();
		
		this.transition(false, 500);
		return;
	}
	
	if (element === null || !isDefinedAndNotNull(element.getBoundingClientRect))
	{
		alert(element !== null ? "UNDEFINED" : "NULL");
		
		return;
	}
	
	var border = element.style.border;
	element.style.border = "4px solid #ff00ff";
	
	var rect = element.getBoundingClientRect();
	var rectX = rect.left + this.bodyRoot.scrollLeft;
	var rectY = rect.top + this.bodyRoot.scrollTop;
	var rectFit = this.getRectFit(rect.width, rect.height, false);
	
	var rectBody = this.bodyRoot.getBoundingClientRect();
//	var bodyFit = this.getElementFit(rectBody.width, rectBody.height, true);

	var rotation = 0;
	var zoom = rectFit.ratio;
	var left = Math.round(rectX + rect.width / 2); // - rectBody.left;
	var top = Math.round(rectY + rect.height / 2); // - rectBody.top;
	var transX = -(left - window.innerWidth / 2);
	var transY = -(top - window.innerHeight / 2);

	this.totalZoom = zoom;
	
	this.transition(true, 500);

	this.resetTransforms();
	this.transforms.push({
		rotation: rotation,
		zoom: zoom,
		left: left,
		top: top,
		transX: transX,
		transY: transY
	});

	this.onResize();

	this.transition(false, 500);
	
	setTimeout(function()
	{
		element.style.border = border;
	}, 500);
}

// ----------

Epub3Sliderizer.toggleReflow = function()
{
	if (this.defaultFontSize)
	{
		var fontSizeIncrease = 5.0;

		var size = Math.round(parseFloat(document.body.style.fontSize));
		
		var fontSizeIncreaseFactor = (size - this.defaultFontSize) / fontSizeIncrease;
	
		this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
	}
	
	if (this.reflow)
	{	
		this.reflow = false;
		document.body.classList.remove("reflow");

		var viewport = querySelectorZ("head > meta[name=viewport]");
		if (viewport !== null)
		{
			viewport.removeAttribute("content");
			viewport.setAttribute('content', this.viewportBackup);
		}
		
		this.onResize();
	}
	else
	{
		this.reflow = true;
		document.body.classList.add("reflow");
		
		this.resetOnResizeTransform();

		var viewport = querySelectorZ("head > meta[name=viewport]");
		if (viewport !== null)
		{
			this.viewportBackup = viewport.getAttribute("content");
			
			viewport.removeAttribute("content");
			viewport.setAttribute('content',
				'width=device-width'
				+ ',user-scalable=yes'
				/*
				+ ',initial-scale='
				+ '1'
				+ ',minimum-scale='
				+ '0.5'
				+ ',maximum-scale=4'
				*/
				);
		}
	}

	/* INFINITE LOOP!
	setTimeout(function()
	{
		window.location.reload(true);
	}, 100);
	*/
	
	setCookie(this.cookieReflow, this.reflow ? "TRUE" : "FALSE");
}

// ----------

//http://www.sceneonthe.net/unicode.htm
//http://www.w3.org/2002/09/tests/keys.html
Epub3Sliderizer.onKeyboard = function(keyboardEvent)
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	
	// Filter out keyboard shortcuts
	if (keyboardEvent.altKey
	|| keyboardEvent.ctrlKey
	|| keyboardEvent.metaKey
	|| keyboardEvent.shiftKey)
	{
		return;
	}


	var fontSizeIncrease = 5;

	if (!this.reflow && keyboardEvent.keyCode === 90) // Z
	{
		keyboardEvent.preventDefault();
		var rectBody = this.bodyRoot.getBoundingClientRect();
		this.toggleZoom(rectBody.left,rectBody.top);
	}
	else if (!this.reflow && keyboardEvent.keyCode === 27) // ESC
	{
		if (this.totalZoom !== 1)
		{
			keyboardEvent.preventDefault();
			this.toggleZoom(0,0);
		}
	}
	else if (keyboardEvent.keyCode === 67) // C
	{
		keyboardEvent.preventDefault();
		this.toggleControlsPanel();
	}
	else if (keyboardEvent.keyCode === 82) // R
	{
		keyboardEvent.preventDefault();
		this.toggleReflow();
	}
	else if (keyboardEvent.keyCode >= 48 && keyboardEvent.keyCode <= 57) // 0,1,2,3..,9
	{
		if (this.defaultFontSize)
		{
			keyboardEvent.preventDefault();
			
			var fontSizeIncreaseFactor = keyboardEvent.keyCode-48;
			
			this.updateFontSize(this.defaultFontSize + fontSizeIncrease*fontSizeIncreaseFactor);
		}
	}
	/*
	else if (keyboardEvent.keyCode === 13) // RETURN / ENTER
	{
		keyboardEvent.preventDefault();	
	}
	*/
	/*
	else if (keyboardEvent.keyCode === 70) // F
	{
		if (isDefinedAndNotNull(screenfull))
		{
			keyboardEvent.preventDefault();
			screenfull.toggle();
		}
	}
	else if (keyboardEvent.keyCode === 27) // ESC
	{
		if (isDefinedAndNotNull(screenfull))
		{
			keyboardEvent.preventDefault();
			screenfull.exit();
		}
	}
	*/
	else if (!this.reflow && this.totalZoom !== 1)
	{
		var offset = 100;
	
		if (keyboardEvent.keyCode === 37 // left arrow
		)
		{
			keyboardEvent.preventDefault();
			this.pan(offset, 0);
		}
		else if (keyboardEvent.keyCode === 39 // right arrow
		)
		{
			keyboardEvent.preventDefault();
			this.pan(-offset, 0);
		}
		else if (keyboardEvent.keyCode === 38 // up arrow
			|| keyboardEvent.keyCode === 33 // page up
		)
		{
			keyboardEvent.preventDefault();
			this.pan(0, offset);
		}
		else if (keyboardEvent.keyCode === 40 // down arrow
			|| keyboardEvent.keyCode === 34 // page down
		)
		{
			keyboardEvent.preventDefault();
			this.pan(0, -offset);
		}
	}
	else if (keyboardEvent.keyCode === 37 // left arrow
	//|| keyboardEvent.keyCode === 38 // up arrow
	|| keyboardEvent.keyCode === 33 // page up
	)
	{
		keyboardEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyboardEvent.keyCode === 39 // right arrow
	//|| keyboardEvent.keyCode === 40 // down arrow
	|| keyboardEvent.keyCode === 34 // page down
	)
	{
		keyboardEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyboardEvent.keyCode === 40) // down arrow
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyboardEvent.keyCode === 38) // up arrow
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(true);
	}
	else if (keyboardEvent.keyCode === 35) // end
	{
		keyboardEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyboardEvent.keyCode === 36) // home
	{
		keyboardEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyboardEvent.keyCode === 32) // space
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyboardEvent.keyCode === 77) // m
	{
		if (this.prev !== "")
		{
			keyboardEvent.preventDefault();
			this.gotoToc();
		}
	}
}

// ----------

Epub3Sliderizer.initTouch = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	if (!isDefinedAndNotNull(Hammer))
	{
		return;
	}
	
	var that = this;

	
	var scrolling = false;
	
	function onSwipeLeft(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (this.totalZoom !== 1)
		{
			return;
		}
		
		this.gotoNext();
	}
	
	function onSwipeRight(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (this.totalZoom !== 1)
		{
			return;
		}
		
		this.gotoPrevious();
	}
	
	function onSwipeUp(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (this.totalZoom !== 1)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		//hammerEvent.gesture.preventDefault();
		
		this.nextIncremental(true);
	}
	
	function onSwipeDown(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (this.totalZoom !== 1)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		//hammerEvent.gesture.preventDefault();
		
		this.nextIncremental(false);
	}
	
	
	/*
	var totalDragX = 0;
	var totalDragY = 0;

	var rotationStart = 0;
	var totalRotation = 0;
	*/
	
	var zoomStart = 1;
	var dragXStart = 0;
	var dragYStart = 0;
	
	function resetTransform()
	{
		that.bodyRoot.style.opacity = "1";
		
		var b = that.totalZoom <= 1 || that.totalZoom >= 18;
		
		if (b)
		{
			/*
			totalRotation = 0;
			totalDragX = 0;
			totalDragY = 0;
			*/
			
			that.resetResize();
		}
		
		return b;
	}
	
	var firstTransform = true;
	
	function onTransform(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		
		if (hammerEvent.gesture)
		{
			this.totalZoom = zoomStart * hammerEvent.gesture.scale;
			//totalRotation = rotationStart + hammerEvent.gesture.rotation;

			if (this.totalZoom <= 1 || !resetTransform())
			{
				if (!firstTransform)
				{
					this.transforms.pop();
				}
				firstTransform = false;
				
				this.transforms.push({
					rotation: hammerEvent.gesture.rotation,
					zoom: hammerEvent.gesture.scale,
					left: hammerEvent.gesture.center.pageX,
					top: hammerEvent.gesture.center.pageY,
					transX: (hammerEvent.gesture.center.pageX - dragXStart) * hammerEvent.gesture.scale,
					transY: (hammerEvent.gesture.center.pageY - dragYStart) * hammerEvent.gesture.scale
				});

				if (this.totalZoom < 1)
				{
//					this.bodyRoot.style.opacity = this.totalZoom;
				}
				
				this.onResizeThrottled();
//				this.onResize();
			}
		}
	}
	
	function onTransformEnd(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}

		if (this.totalZoom <= 1)
		{
			this.transition(true, 500);
		
			resetTransform();
			
			this.transition(false, 500);
		}
	}
	
	function onTransformStart(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		
		firstTransform = true;
		
		if (hammerEvent.gesture)
		{
			zoomStart = this.totalZoom;
			
			dragXStart = hammerEvent.gesture.center.pageX;
			dragYStart = hammerEvent.gesture.center.pageY;
			
			/*
			rotationStart = totalRotation;
			*/
			
			hammerEvent.gesture.preventDefault();
		}
		else
		{
			zoomStart = 1;
			
			dragXStart = 0;
			dragYStart = 0;
			
			/*
			rotationStart = 0;
			*/
		}
	}
	
	var firstDrag = true;
	
	function onDragEnd(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		
		var that = this;
		
		if (this.totalZoom === 1)
		{
			setTimeout(function()
			{
				that.transition(true, 500);
		
				resetTransform();
			
				that.transition(false, 500);
			}, 100);
		}
	}
	
	function onDrag(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (scrolling)
		{
			return;
		}
		
		if (hammerEvent.gesture)
		{			
			if (this.totalZoom === 1 && this.basicMode)
			{
				return;
			}
			
			var xOffset = hammerEvent.gesture.center.pageX - dragXStart;

			var opacity = 1;
			if (this.totalZoom === 1)
			{
				var off = Math.abs(xOffset);
				if (off < 60)
				{
					// to allow swipe up/down
					return;
				}
				
				opacity = 1 - (off / window.innerWidth); //this.bodyRoot.clientWidth
				
//				this.bodyRoot.style.opacity = opacity;
			}
			
			//$("h1#epb3sldrzr-title").html(this.totalZoom + " - " + opacity);
			
			if (!firstDrag)
			{
				this.transforms.pop();
			}
			firstDrag = false;
			
			this.transforms.push({
				rotation: 0,
				zoom: 1, //opacity,
				left: hammerEvent.gesture.center.pageX,
				top: hammerEvent.gesture.center.pageY,
				transX: xOffset,
				transY: this.totalZoom === 1 ? 0 : hammerEvent.gesture.center.pageY - dragYStart
			});

			this.onResizeThrottled();
			//this.onResize();
		}
	}
	
	function onDragStart(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		firstDrag = true;
		
		if (hammerEvent.gesture)
		{
			dragXStart = hammerEvent.gesture.center.pageX;
			dragYStart = hammerEvent.gesture.center.pageY;
			
			hammerEvent.gesture.preventDefault();
		}
		else
		{
			dragXStart = 0;
			dragYStart = 0;
		}
		
		scrolling = false;

		if (this.totalZoom !== 1)
		{
			return;
		}

		var scroll = document.getElementById("epb3sldrzr-root");
		
		var target = hammerEvent.target;
		while (target)
		{
			if(target === scroll)
			{
				if (scroll.offsetHeight < scroll.scrollHeight)
				{
					if (scroll.scrollTop <= 0
							&& hammerEvent.gesture && hammerEvent.gesture.direction === "down")
					{
						;
					}
					else if (scroll.scrollTop >= (scroll.scrollHeight - scroll.offsetHeight)
							&& hammerEvent.gesture && hammerEvent.gesture.direction === "up")
					{
						;
					}
					else
					{
						scrolling = true;
						if (hammerEvent.gesture)
						{
							//hammerEvent.gesture.stopPropagation();
						}
						return;
					}
				}
			}
			target = target.parentNode;
		}
	}
	
	this.hammer.on("dragstart",
		onDragStart.bind(this)
	);
	
	this.hammer.on("dragend",
		onDragEnd.bind(this)
	);
	
	this.hammer.on("drag",
		onDrag.bind(this)
	);
	
	this.hammer.on("transformstart",
		onTransformStart.bind(this)
	);
	
	this.hammer.on("transformend",
		onTransformEnd.bind(this)
	);
	
	this.hammer.on("transform",
		onTransform.bind(this)
	);
	
	this.hammer.on("swipeleft",
		onSwipeLeft.bind(this)
	);
	
	this.hammer.on("swiperight",
		onSwipeRight.bind(this)
	);
	
	this.hammer.on("swipeup",
		onSwipeUp.bind(this)
	);
	
	this.hammer.on("swipedown",
		onSwipeDown.bind(this)
	);

	function onDoubleTap(hammerEvent)
	{
		if (this.reflow)
		{
			return;
		}
		
		if (hammerEvent.gesture)
		{	
			hammerEvent.gesture.preventDefault();
			hammerEvent.gesture.stopPropagation();

			if (this.totalZoom !== 1)
			{
				this.transition(true, 500);
				
				this.resetResize();
				
				this.transition(false, 500);
				//this.toggleZoom(hammerEvent.gesture.center.pageX, hammerEvent.gesture.center.pageY);
			}
			else
			{
				var done = false;

				var target = hammerEvent.target;
				while (target)
				{
					if (target === this.bodyRoot)
					{
						break;
					}
					
					var name = target.nodeName.toLowerCase();
					if (name === "p" || name === "img" || name === "video" || name === "svg" || name === "td" || name === "div" || name === "h1" || name === "h2" || name === "h3" || name === "h4" || name === "li" || name === "ul" || name === "ol")
					{
						done = true;
						this.zoomTo(target);
						break;
					}
			
					target = target.parentNode;
				}
		
				if (!done)
				{
					this.toggleZoom(hammerEvent.gesture.center.pageX, hammerEvent.gesture.center.pageY);
				}
			}
		}
	}

	function onTap(hammerEvent)
	{
		if (hammerEvent.gesture)
		{
			var controls = document.getElementById("epb3sldrzr-controls");
			
			var target = hammerEvent.target;
			while (target)
			{
				if (target === controls)
				{
					return;
				}
				target = target.parentNode;
			}
		}

		this.toggleControlsPanel();
	}
	
	
	/*
	function onHold(hammerEvent)
	{
		if (hammerEvent.gesture)
		{
		}
		
	}
	
	this.hammer.on("hold",
		onHold.bind(this)
	);
	*/

	
	
	
	
	
	
	
	
	
	var hammer = Hammer(document.documentElement,
		{
			prevent_default: true,
			css_hacks: false
		});
	
	hammer.on("doubletap",
		onDoubleTap.bind(this)
	);

	hammer.on("tap",
		onTap.bind(this)
	);
	
	
	
	
	document.addEventListener('touchstart', function(e)
	{
		if (that.reflow)
		{
			return;
		}
		
		var t2 = e.timeStamp;
		var t1 = document.documentElement.getAttribute('data-touchStart') || t2;
		var dt = t2 - t1;
		var fingers = e.touches.length;
		document.documentElement.setAttribute('data-touchStart', t2);
		
		if (!dt || dt > 500 || fingers > 1)
		{
			/*
			console.log("===");
			console.log(that.left);
			console.log(that.top);
			*/
			return;
		}
		
		e.preventDefault();
	}, true );
}

// ----------

Epub3Sliderizer.resetOnResizeTransform = function()
{
	if (!this.reflow && !this.isEpubReadingSystem())
	{
		return;
	}

	this.totalZoom = 1;
	this.resetTransforms();
	
	this.bodyRoot.style.MozTransformOrigin = null;
	this.bodyRoot.style.WebkitTransformOrigin = null;
	this.bodyRoot.style.OTransformOrigin = null;
	this.bodyRoot.style.msTransformOrigin = null;
	this.bodyRoot.style.transformOrigin = null;

	this.bodyRoot.style.MozTransform = null;
	this.bodyRoot.style.WebkitTransform = null;
	this.bodyRoot.style.OTransform = null;
	this.bodyRoot.style.msTransform = null;
	this.bodyRoot.style.transform = null;
}


Epub3Sliderizer.resetResize = function()
{
	this.totalZoom = 1;
	this.resetTransforms();
	
	this.onResizeThrottled();
	//this.onResize();
}

// ----------

Epub3Sliderizer.getElementFit = function(element, fitWidth)
{
	return this.getRectFit(element.clientWidth, element.clientHeight, fitWidth);
}

// ----------

Epub3Sliderizer.getRectFit = function(w, h, fitWidth)
{
	var sx = w / window.innerWidth;
	var sy = h / window.innerHeight;
	var ratio = fitWidth ? 1.0 / sx : 1.0 / Math.max(sx, sy);

	var newWidth = w * ratio;
	var offsetX = 0;
	if (window.innerWidth > newWidth)
	{
		offsetX = (window.innerWidth - newWidth) / 2;
	}
	offsetX = Math.round( offsetX * 1000.0 ) / 1000.0;
	offsetX = Math.round(offsetX);

	var newHeight = h * ratio;
	var offsetY = 0;
	if (window.innerHeight > newHeight)
	{
		offsetY = (window.innerHeight - newHeight) / 2;
	}
	offsetY = Math.round( offsetY * 1000.0 ) / 1000.0;
	offsetY = Math.round(offsetY);

	return { "ratio": ratio, "offsetX": offsetX, "offsetY": offsetY };
}

// ----------

// ratio 1.29:1
// 1290 x 1000
// 1900 x 1470
// 2048 x 1536 (Retina)
// 2400 x 1860

Epub3Sliderizer.onResize = function()
{
	if (this.isEpubReadingSystem() || this.reflow)
	{
		return;
	}

	var transformOrigin = "0px 0px";
	
	this.bodyRoot.style.MozTransformOrigin = transformOrigin;
	this.bodyRoot.style.WebkitTransformOrigin = transformOrigin;
	this.bodyRoot.style.OTransformOrigin = transformOrigin;
	this.bodyRoot.style.msTransformOrigin = transformOrigin;
	this.bodyRoot.style.transformOrigin = transformOrigin;
	
	var bodyFit = this.getElementFit(this.bodyRoot, this.fitWidth);
	var ratio = bodyFit.ratio;
	var offsetX = bodyFit.offsetX;
	var offsetY = bodyFit.offsetY;
	
	var is3D = this.opera || this.firefox || this.mobile || this.IE ? false : true; // this leaves WebKit with 3D ...
	
	is3D = false;
	
	var transformCSS = "";
	
	for (var i = this.transforms.length-1; i >= 0; i--)
	{
		var transform = this.transforms[i];
		
		if (transform.rotation !== 0)
		{
			transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";
		
			transformCSS += " rotate"+(is3D?"3d":"")+"(" + (is3D? "0,0,1,":"") + transform.rotation + "deg) ";
			
			transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";
		}

		transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.transX + "px," + transform.transY + "px"+(is3D?", 0":"")+") ";

		if (transform.zoom !== 1)
		{
			transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";
			
			transformCSS += " scale"+(is3D?"3d":"")+"(" + transform.zoom + (is3D? "," + transform.zoom + ",1":"") + ") ";

			transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";
		}
	}
	
	transformCSS += " translate"+(is3D?"3d":"")+"(" + offsetX  + "px," + offsetY + "px"+(is3D?", 0":"")+") "
	
	transformCSS += " scale"+(is3D?"3d":"")+"(" + ratio + (is3D? "," + ratio + ",1":"") + ") ";
	
	
	this.bodyRoot.style.MozTransform = transformCSS;
	this.bodyRoot.style.WebkitTransform = transformCSS;
	this.bodyRoot.style.OTransform = transformCSS;
	this.bodyRoot.style.msTransform = transformCSS;
	this.bodyRoot.style.transform = transformCSS;
}

// ----------

Epub3Sliderizer.onOrientationChange = function()
{
	if (this.isEpubReadingSystem() || this.reflow)
	{
		return;
	}

	var viewport = querySelectorZ("head > meta[name=viewport]");
	if (viewport !== null)
	{
		var sx = this.bodyRoot.clientWidth / window.innerWidth;
		var sy = this.bodyRoot.clientHeight / window.innerHeight;
		var ratio = 1.0 / Math.max(sx, sy);

		var adjustedWidth = this.bodyRoot.clientWidth * ratio;
		var adjustedHeight = this.bodyRoot.clientHeight * ratio;

		var rounded = Math.round( ratio * 1000000.0 ) / 1000000.0;

		var width = Math.round( Math.round( adjustedWidth * 1000000.0 ) / 1000000.0 );
		
		var height = Math.round( Math.round( adjustedHeight * 1000000.0 ) / 1000000.0
		// - (this.staticMode ? 0 : 300)
	 	);

		var content = viewport.getAttribute('content');
		console.log(content);
					
//		content = 'width=' + width + ',height=' + height;
//		console.log(content);

		if (content.indexOf('user-scalable') < 0)
		{
			console.log("VIEWPORT");

			viewport.removeAttribute("content");
			viewport.setAttribute('content',
				content
				+ ',user-scalable=no'
				+ ',initial-scale='
				+ '1' //rounded
				+ ',minimum-scale='
				+ '1' //rounded
				+ ',maximum-scale=1' //2
				);
		}
	}

	var that = this;
	setTimeout(function()
	{
		that.resetResize();
	}, 20);
}

// ----------

Epub3Sliderizer.initReverse = function()
{
	if (this.thisFilename === null || this.thisFilename === "")
	{
		this.reverse = false;
		return;
	}

	function getRank(fileName)
	{
		var rank = 0;
		
		if (fileName === null || fileName === "")
		{
			return rank;
		}
		
		var unit = 1;
		for (var i = fileName.length-1; i >= 0; i--)
		{
			var c = fileName[i];
			var val = 0;
			var nan = false;
			
			if (c === '0')
			{
				val = 0;
			}
			else if (c === '1')
			{
				val = 1;
			}
			else if (c === '2')
			{
				val = 2;
			}
			else if (c === '3')
			{
				val = 3;
			}
			else if (c === '4')
			{
				val = 4;
			}
			else if (c === '5')
			{
				val = 5;
			}
			else if (c === '6')
			{
				val = 6;
			}
			else if (c === '7')
			{
				val = 7;
			}
			else if (c === '8')
			{
				val = 8;
			}
			else if (c === '9')
			{
				val = 9;
			}
			else
			{
				nan = true;
			}
			
			if (!nan)
			{
				rank += unit * val;
				unit *= 10;
			}
		}
		
		return rank;
	}

	var thisRank = getRank(this.thisFilename);
	var prevRank = this.from === null ? 0 : getRank(this.from);
	
	/*
	console.log("RANK this: " + thisRank);
	console.log("RANK prev: " + prevRank);
	*/
	
	if (prevRank >= thisRank)
	{
		this.reverse = true;
		//document.body.classList.add("epb3sldrzr-reverse");
	}
}

// ----------

Epub3Sliderizer.initLinks = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	var that = this;

	var nav = document.getElementById("epb3sldrzr-NavDoc");
	if (nav !== null)
	{
		this.toc = "html/" + this.toc;

		Array.prototype.forEach.call(
			querySelectorAllZ("#epb3sldrzr-content a"),
			function(link)
			{
				if (link.attributes.length <= 0
					|| !isDefinedAndNotNull(link.attributes['href'])
				)
				{
					return;
				}

				var href = link.getAttribute('href');
				
				var updatedHref = href + that.urlParams(false);

				link.setAttribute("href", updatedHref);
			}
		);
	}
	
	//	var links = Array.prototype.slice.call(querySelectorAllZ("head > link"));
	//	if (links !== null)
	//	{		
	//		for (var i = 0; i < links.length; i++) { links[i] }


	Array.prototype.forEach.call(
		querySelectorAllZ("head > link"),
		function(link)
		{
			if (link.attributes.length <= 0
				|| !isDefinedAndNotNull(link.attributes['href'])
				|| !isDefinedAndNotNull(link.attributes['rel'])
			)
			{
				return;
			}

			var href = link.attributes['href'].nodeValue;
			var rel = link.attributes['rel'].nodeValue;
			if (rel === "prev")
			{
				that.prev = href;
			}
			else if (rel === "next")
			{
				that.next = href;
			}
			else if (rel === "epub")
			{
				that.epub = href;
			}
		}
	);


	var controls = document.getElementById("epb3sldrzr-controls");
		
	var anchor = controls; //this.bodyRoot


	var aa = document.createElement('a');
	aa.id = "epb3sldrzr-link-toc";
	aa.title = "Slide menu";
	aa.href = "javascript:Epub3Sliderizer.gotoToc();";

	if (anchor.children.length === 0)
	{
		anchor.appendChild(aa);
	}
	else
	{
		anchor.insertBefore(aa, anchor.children[0]);
	}

	if (this.prev !== "")
	{
		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-previous";
		a.title = "Previous slide";	
		a.href = "javascript:Epub3Sliderizer.gotoPrevious_();";

		anchor.insertBefore(a, anchor.children[0]);
	}
	
		
	if (this.next !== "")
	{
		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-next";
		a.title = "Next slide";
		a.href = "javascript:Epub3Sliderizer.gotoNext_();";

		anchor.insertBefore(a, anchor.children[0]);
	}

		
		
		
	if (this.epub !== "")
	{
		var nav = document.getElementById("epb3sldrzr-NavDoc");
		if (nav !== null)
		{
			var a = document.createElement('a');
			a.id = "epb3sldrzr-link-epub";
			a.title = "Download EPUB file";
			a.href = this.epub;

			this.bodyRoot.insertBefore(a, this.bodyRoot.children[0]);
		}
	}
}


// ----------

Epub3Sliderizer.reAnimateElement = function(elem)
{	
	var elm = elem;
	var newOne = elm.cloneNode(true);
	elm.parentNode.replaceChild(newOne, elm);
	
	if (elm === this.bodyRoot)
	{
		this.bodyRoot = newOne;
	}
	else
	{
		for (var i = 0; i < this.incrementals.length; i++)
		{
			if (elm === this.incrementals[i])
			{
				this.incrementals[i] = newOne;
				break;
			}
		}
	}
}

// ----------

Epub3Sliderizer.reAnimateAll = function(element)
{
	var list = new Array();
	
	var that = this;
	
	Array.prototype.forEach.call(
		element.querySelectorAllZ(".animated"),
		function(elem)
		{
			list.push(elem);
			that.reAnimateElement(elem);
		}
	);

	Array.prototype.forEach.call(
		element.querySelectorAllZ(".epb3sldrzr-animated"),
		function(elem)
		{
			if (list.indexOf(elem) < 0)
			{
				that.reAnimateElement(elem);
			}
		}
	);
}

// ----------

Epub3Sliderizer.invalidateIncremental = function(enableAuto, reanimate, auto)
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	if (this.increment < 0 || this.increment > (this.incrementals.length - 1))
	{
		this.increment = -1;
		
		Array.prototype.forEach.call(
			this.incrementals,
			function(elem)
			{
				elem.parentNode.removeAttribute("incremental-active");
				elem.removeAttribute("aria-selected");
				elem.removeAttribute("aria-activedescendant");
			}
		);
		
		return;
	}

	var scroll = document.getElementById("epb3sldrzr-root");
	
	var fontSize = Math.round(parseFloat(document.body.style.fontSize));
	
	var i = -1;
	var that = this;
	Array.prototype.forEach.call(
		this.incrementals,
		function(elem)
		{
			i++;
	
			if (i < that.increment)
			{
				elem.parentNode.setAttribute("incremental-active", "true");
				elem.removeAttribute("aria-selected");
				elem.setAttribute("aria-activedescendant", "true");
			}
			else if (i > that.increment)
			{
				var found = false;
				for (var j = 0; j < elem.parentNode.childNodes.length; j++)
				{
					if (elem.parentNode.childNodes[j] === that.incrementals[that.increment])
					{
						found = true;
						break;
					}
				}
				if (!found)
				{
					elem.parentNode.removeAttribute("incremental-active");
				}
				else
				{
					elem.parentNode.setAttribute("incremental-active", "true");
				}
				
				elem.removeAttribute("aria-selected");
				elem.removeAttribute("aria-activedescendant");
				
				
				if (enableAuto && (i === that.increment + 1)
					&& (auto
						|| elem.classList.contains("auto")
						|| (that.increment === 0 && elem.parentNode.classList.contains("auto")))
				)
				{
					var delay = elem.parentNode.getAttribute('data-incremental-delay') || 500;
	
					var current = i;
					setTimeout(function()
					{
						if (current === that.increment + 1)
						{
							that.increment += 1;
							that.invalidateIncremental(enableAuto, reanimate, true);
						}
					}, delay);
				}
			}
			else if (i === that.increment)
			{				
				elem.parentNode.setAttribute("incremental-active", "true");
				elem.setAttribute("aria-selected", "true");
				elem.removeAttribute("aria-activedescendant");

				
				if (fontSize === that.defaultFontSize)
				{
					var topAlign = false;
					var center = false;

					var target = elem;
					while (target)
					{
						if(target === scroll) // || target === document.body || target === document.documentElement)
						{
							if (target.offsetHeight < target.scrollHeight)
							{
								var toScroll = elem.offsetTop - target.offsetTop;
							
								if (topAlign)
								{
									target.scrollTop = toScroll;
								}
								else
								{
									toScroll = toScroll - (target.offsetHeight - elem.offsetHeight) / (center ? 2 : 1);

									if (toScroll > 0)
									{
										target.scrollTop = toScroll;
									}
								}

								break;
							}
						}

						target = target.parentNode;
					}
				
					/*
					if (isDefinedAndNotNull(elem.scrollIntoView))
					{
						elem.scrollIntoView(false);
					
						setTimeout(function()
						{
						}, 0);
					}
					*/
				}
			
				if (reanimate)
				{
					that.reAnimateAll(elem);
				}
			}
		}
	);
}

// ----------

Epub3Sliderizer.lastIncremental = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	this.increment = this.incrementals.length - 1;

	this.invalidateIncremental(false, false, false);
}

// ----------

Epub3Sliderizer.firstIncremental = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	this.increment = 0;
	
	this.invalidateIncremental(true, false, false);
}

// ----------

Epub3Sliderizer.nextIncremental = function(backward)
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	if (backward && this.increment < 0)
	{
		this.gotoPrevious();
		return;
	}
	
	if (!backward && this.increment >= (this.incrementals.length - 1))
	{
		this.gotoNext();
		return;
	}

	this.increment = (backward ? (this.increment - 1) : (this.increment + 1));
	
	this.invalidateIncremental(!backward, !backward, false);
}

// ----------

Epub3Sliderizer.initAnimations = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	var that = this;
	
	Array.prototype.forEach.call(
		this.bodyRoot.querySelectorAllZ(".epb3sldrzr-animated"),
		function(elem)
		{
//			elem.classList.remove("epb3sldrzr-animated");

//			elem.classList.add("animated"); // STOPPED BY DEFAULT IN CSS (animation-iteration-count: 0) ...
				
			elem.classList.add("epb3sldrzr-animateStart"); // ... THEN, ANIMATES (animation-iteration-count: N)
			
			if (that.bodyRoot !== elem && (that.opera || that.firefox || that.IE))
			{
				that.reAnimateElement(elem);
			}
		}
	);
}

// ----------

Epub3Sliderizer.initSlideTransition = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	var animate = !this.opera; //&& !this.IE;
	if (animate
		&& !this.mobile
	)
	{
		if (!this.reverse)
		{
			//this.bodyRoot.classList.add("enterInRight");
			this.bodyRoot.classList.add("fadeIn");
		}
		else
		{
			//this.bodyRoot.classList.add("enterInLeft");
			this.bodyRoot.classList.add("fadeIn");
		}
	
		this.bodyRoot.classList.add("epb3sldrzr-animated");
	//	this.bodyRoot.classList.add("animated");
		this.bodyRoot.classList.add("epb3sldrzr-animateStart");
		


		if (this.firefox || this.opera)
		{
	//		this.reAnimateElement(this.bodyRoot);
		}
	}
	else
	{
		this.bodyRoot.style.visibility = "visible";
	}
}

// ----------

Epub3Sliderizer.initMediaOverlays = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	Array.prototype.forEach.call(
		this.bodyRoot.querySelectorAllZ(".epb3sldrzr-epubMediaOverlayActive"),
		function(elem)
		{
			elem.classList.remove("epb3sldrzr-epubMediaOverlayActive");
			
			elem.classList.add("-epub-media-overlay-active");
		}
	);
}

// ----------

Epub3Sliderizer.initIncrementals = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}
	
	this.incrementals = this.bodyRoot.querySelectorAllZ(".incremental > *");

	if (this.reverse)
	{
		this.lastIncremental();
	}
	else
	{
		this.firstIncremental();
	}
}


// ----------

Epub3Sliderizer.initLocation = function()
{
	if (!isDefinedAndNotNull(window.location)
	|| !isDefinedAndNotNull(window.location.href))
	{
		return;
	}

	console.log("window.location: " + window.location);
	console.log("window.location.href: " + window.location.href);
	console.log("window.location.search: " + window.location.search);

	var i = window.location.href.lastIndexOf('/');

	var from = null;
	var hash = null;
	var thisFilename = null;

	var len = window.location.href.length;

	if (i >= 0 && i < len-1)
	{
		thisFilename = window.location.href.substring(i+1, len);
	}

	if (thisFilename === null)
	{
		this.thisFilename = thisFilename;
		this.from = from;
		this.hash = hash;
		return;
	}

	i = thisFilename.indexOf('#');
	if (i < 0)
	{
		i = 9999;
	}
	else
	{
		if (i < thisFilename.length-1)
		{
			hash = thisFilename.substring(i+1, thisFilename.length);
		}
	}
	
	var ii = thisFilename.indexOf('?');
	if (ii < 0)
	{
		ii = 9999;
	}

	var iii = thisFilename.indexOf('&');
	if (iii < 0)
	{
		iii = 9999;
	}

	i = Math.min(i, Math.min(ii, iii));

	if (i >= 0 && i < 9999)
	{
		thisFilename = thisFilename.substring(0, i);
	}

	this.thisFilename = thisFilename;
	
	this.hash = hash;
	if (this.hash !== null && this.hash === "")
	{
		this.hash = null;
	}
	
	this.from = getUrlQueryParam("from");
	if (this.from !== null && this.from === "")
	{
		this.from = null;
	}

	console.log("THIS: " + this.thisFilename);
	console.log("FROM: " + this.from);
	console.log("HASH: " + this.hash);
}

// ----------

Epub3Sliderizer.init = function()
{
	console.log("Epub3Sliderizer");
	console.log(window.navigator.userAgent);	

	this.initLocation();

	var fakeEpubReadingSystem = false;

	if (isDefinedAndNotNull(navigator.epubReadingSystem))
	{
		this.epubReadingSystem = navigator.epubReadingSystem;
	}
	else
	{	
		if (!this.basicMode && !this.staticMode && !this.authorMode && this.epubMode)
		//if (window.location.href.indexOf("static") >= 0)
		{
			fakeEpubReadingSystem = true;
			this.epubReadingSystem = {name: "FAKE epub reader", version: "0.0.1"};
		}
	}
	
	if (this.epubReadingSystem !== null)
	{
		console.log(this.epubReadingSystem.name);
		console.log(this.epubReadingSystem.version);
	}
	
	this.kobo = isDefinedAndNotNull(window.KOBO_TAG); // window.nextKoboSpan
	
	/*
	TOO SLOW! :(
	(despite CSS HW acceleration)
	
	var scroll = document.getElementById("epb3sldrzr-root");

	if (scroll.offsetHeight < scroll.scrollHeight)
	{
		var iScroll = new IScroll(scroll, { fadeScrollbar: false, bounce: false, preventDefault: false, useTransition: true, useTransform: false });
	}
	*/

	/*
	var aa_ = document.createElement('a');
	aa_.id = "epb3sldrzr-link-firebug";
	aa_.title = "Firebug";
	aa_.href = "javascript:(function(F,i,r,e,b,u,g,L,I,T,E){if(F.getElementById(b))return;E=F[i+'NS']&&F.documentElement.namespaceURI;E=E?F[i+'NS'](E,'script'):F[i]('script');E[r]('id',b);E[r]('src',I+g+T);E[r](b,u);(F[e]('head')[0]||F[e]('body')[0]).appendChild(E);E=new%20Image;E[r]('src','../js/firebug-lite.js');})(document,'createElement','setAttribute','getElementsByTagName','FirebugLite','4','firebug-lite.js','releases/lite/latest/skin/xp/sprite.png','https://getfirebug.com/','#startOpened,enableTrace');";
	aa_.innerHTML = "FIREBUG";
	aa_.style.position= "absolute";
	aa_.style.top="0px";
	aa_.style.left="0px";
	aa_.style.zIndex="1000";

	this.bodyRoot.insertBefore(aa_, this.bodyRoot.children[0]);
	*/

	if (this.isEpubReadingSystem())
	{
		if (!fakeEpubReadingSystem)
		{
			this.resetOnResizeTransform();
		}

		document.body.classList.add("epb3sldrzr-epubReadingSystem");

		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-epubReadingSystem";
		a.title = "EPUB Reading System info";
		
		if (this.epubReadingSystem === null)
		{
			if (this.readium)
			{
				a.href = "javascript:window.alert('Readium')";
				a.innerHTML = "Readium";
			}
			else if (this.kobo)
			{
				a.href = "javascript:window.alert('Kobo')";
				a.innerHTML = "Kobo";
			}
			else if (this.ibooks)
			{
				a.href = "javascript:window.alert('iBooks')";
				a.innerHTML = "iBooks";
			}
			else if (this.playbooks)
			{
				a.href = "javascript:window.alert('Google Play Books')";
				a.innerHTML = "Google Play Books";
			}
			else if (this.azardi)
			{
				a.href = "javascript:window.alert('Azardi')";
				a.innerHTML = "Azardi";
			}
			else
			{
				a.href = "javascript:window.alert('??')";
				a.innerHTML = "??";
			}
		}
		else
		{
			a.href = "javascript:window.alert(window.Epub3Sliderizer.epubReadingSystem.name + '_' + window.Epub3Sliderizer.epubReadingSystem.version)";
			a.innerHTML = this.epubReadingSystem.name + '_' + this.epubReadingSystem.version;
		}

		var controls = document.getElementById("epb3sldrzr-controls");
		var anchor = controls; //this.bodyRoot
		
		if (anchor.children.length === 0)
		{
			anchor.appendChild(a);
		}
		else
		{
			anchor.insertBefore(a, anchor.children[0]);
		}

		this.bodyRoot.style.visibility = "visible";
	}
	else if (this.staticMode || this.authorMode)
	{
		//console.log("STATIC (iframe)");
		
		document.body.classList.add("epb3sldrzr-epubReadingSystem");
		
		if (isDefinedAndNotNull(window.orientation))
		{
			this.onOrientationChange();
		}
		else
		{
			this.resetResize();
		}
		
		this.bodyRoot.style.visibility = "visible";

		if (this.authorMode)
	    {
			this.AUTHORize(".epb3sldrzr-author");
		}
	}
	else
	{
		if (this.basicMode)
		{
			document.body.classList.add("epb3sldrzr-epubReadingSystem");
		}
		
		this.initReverse();
		
		this.initLinks();
		
		//this.toggleControlsPanel();

		window.onkeyup = this.onKeyboard.bind(this);
	
		if (isDefinedAndNotNull(Hammer))
		{
			if (!this.mobile)
			{
				if (false && isDefinedAndNotNull(Hammer.plugins.showTouches))
				{
					Hammer.plugins.showTouches();
				}
				if (isDefinedAndNotNull(Hammer.plugins.fakeMultitouch))
				{
					Hammer.plugins.fakeMultitouch();
				}
			}
	
			delete Hammer.defaults.stop_browser_behavior.userSelect;
	
			this.hammer = Hammer(this.bodyRoot,
				{
					prevent_default: false,
					css_hacks: false,
					swipe_velocity: 1
				});
		}
	
		this.initTouch();
	
		if (isDefinedAndNotNull(window.orientation))
		{
			window.onorientationchange = this.onOrientationChange.bind(this);
			this.onOrientationChange();
		}
		else
		{
			window.onresize = this.resetResize.bind(this);
			this.resetResize();
		}

		var reflow = getCookie(Epub3Sliderizer.cookieReflow);
		console.log("reflow (COOKIE): " + reflow);
		
		if (reflow !== null && reflow === "TRUE")
		{
			this.toggleReflow();
		}

		this.initMediaOverlays();

		if (!this.basicMode)
		{
			if (this.reflow)
			{
				this.bodyRoot.style.visibility = "visible";
			}
			else
			{
				this.initSlideTransition();
			}

			var that = this;
			setTimeout(function()
			{
				that.initIncrementals();
				that.initAnimations();
			}, 500);
		}
		else
		{
			this.initIncrementals();
			this.bodyRoot.style.visibility = "visible";
		}
		
		if (isDefinedAndNotNull($))
		{

		//$(document).ready(function()
		//{

		if (isDefinedAndNotNull($(window).mousewheel))
		{
			return;
		}

		if (!navigator.userAgent.match(/Macintosh/))
		{
			return;
		}

		var that = this;
		
		$(window).mousewheel(function (event, delta, deltaX, deltaY)
		{
			if (that.reflow)
			{
				return;
			}
			
			deltaY = -deltaY;
	
			var parents = $(event.target).parents();
	
			var canScrollLeft = false;
			var canScrollRight = false;
	
			var canScrollUp = false;
			var canScrollDown = false;
			
			var scrollableX = false;
			var scrollableY = false;
	
			var func = function()
			{
				var elem = $(this)[0];

				scrollableX = scrollableX || elem.scrollLeft !== 0;
				scrollableY = scrollableY || elem.scrollTop !== 0;

				canScrollLeft = canScrollLeft || deltaX < 0 && (elem.scrollLeft + deltaX) > 0;
		
				canScrollUp = canScrollUp || deltaY < 0 && (elem.scrollTop + deltaY) > 0;
		
				canScrollRight = canScrollRight || deltaX > 0 && (elem.scrollLeft + deltaX) < (elem.scrollWidth - elem.offsetWidth);
		
				canScrollDown = canScrollDown || deltaY > 0 && (elem.scrollTop + deltaY) < (elem.scrollHeight - elem.offsetHeight);
			};
	
			$(event.target).each(func);
			parents.each(func);
	
			var hasScroll = canScrollLeft || canScrollUp || canScrollRight || canScrollDown;
	
			if (!hasScroll)
			{
				event.preventDefault();
				event.stopPropagation();
			}

			/*
			console.log("deltaX: "+deltaX);
			console.log("deltaY: "+deltaY);
	
			console.log("canScrollLeft: "+canScrollLeft);
			console.log("canScrollRight: "+canScrollRight);
	
			console.log("canScrollUp: "+canScrollUp);
			console.log("canScrollDown: "+canScrollDown);
			*/
	
	
			var left = deltaX < 0 && deltaX < deltaY;
			var right = deltaX > 0 && deltaX > deltaY;
			var up = deltaY < 0 && deltaY < deltaX;
			var down = deltaY > 0 && deltaY > deltaX;
	
			if (that.totalZoom === 1)
			{
				if (false && // Interferes! :(
					(
						scrollableX && (up || down)
						|| scrollableY && (left || right)
						|| !scrollableY && !scrollableX
					)
					&&
					(Math.abs(deltaX) > 40 || Math.abs(deltaY) > 40)
				)
				{
					if (!that.pauseEvents)
					{
						that.pauseEvents = true;
						setTimeout(function()
						{
							that.pauseEvents = false;
						}, 1000);
					
						if (left)
						{
							that.gotoPrevious();
						}
						else if (right)
						{
							that.gotoNext();
						}
						else if (up)
						{
							that.nextIncremental(true);
						}
						else if (down)
						{
							that.nextIncremental(false);
						}
					}
				}
			}
			else
			{
				//TODO: pan
			}
		});

		//});

		}
	}
}

// ----------

function readyDelayed()
{
	if (Epub3Sliderizer.staticMode || Epub3Sliderizer.basicMode || Epub3Sliderizer.ibooks || Epub3Sliderizer.readium || Epub3Sliderizer.playbooks)
	{
		return;
	}

	Epub3Sliderizer.init();
}

// ----------

function readyFirst()
{
	/*
	var obj = window;
	var str = "";
	for (var prop in obj) {
	  if (true || obj.hasOwnProperty(prop)) {
		  if (prop.toLowerCase().indexOf("kobo") >= 0
		  	|| prop.toLowerCase().indexOf("ibooks") >= 0
		  	|| prop.toLowerCase().indexOf("google") >= 0
		  	|| prop.toLowerCase().indexOf("edition") >= 0
		  	|| prop.toLowerCase().indexOf("book") >= 0
		  	|| prop.toLowerCase().indexOf("page") >= 0
			|| prop.toLowerCase().indexOf("epub") >= 0
			|| prop.toLowerCase().indexOf("azardi") >= 0
			|| prop.toLowerCase().indexOf("igp") >= 0
		)
		  {
			  str += ("\n" + prop);
		  }
	  }
	}
	alert(str);
	*/
	
	
	Epub3Sliderizer.onResizeThrottled = throttle(Epub3Sliderizer.onResize, 100, false).bind(Epub3Sliderizer);
	
	
	Epub3Sliderizer.bodyRoot = document.getElementById("epb3sldrzr-body");
	
	var controls = document.createElement('div');
	controls.id = "epb3sldrzr-controls";	
	Epub3Sliderizer.bodyRoot.insertBefore(controls, Epub3Sliderizer.bodyRoot.children[0]);

	var aa = document.createElement('a');
	aa.id = "epb3sldrzr-link-textsize-plus";
	aa.title = "Increase font size";
	aa.href = "javascript:Epub3Sliderizer.increaseFontSize();";
	if (controls.children.length === 0)
	{
		controls.appendChild(aa);
	}
	else
	{
		controls.insertBefore(aa, controls.children[0]);
	}

	var az = document.createElement('a');
	az.id = "epb3sldrzr-link-textsize-reset";
	az.title = "Reset font size";
	az.href = "javascript:Epub3Sliderizer.resetFontSize();";
	if (controls.children.length === 0)
	{
		controls.appendChild(az);
	}
	else
	{
		controls.insertBefore(az, controls.children[0]);
	}

	var aaa = document.createElement('a');
	aaa.id = "epb3sldrzr-link-textsize-minus";
	aaa.title = "Descrease font size";
	aaa.href = "javascript:Epub3Sliderizer.decreaseFontSize();";
	if (controls.children.length === 0)
	{
		controls.appendChild(aaa);
	}
	else
	{
		controls.insertBefore(aaa, controls.children[0]);
	}
	

	var a = document.createElement('a');
	a.id = "epb3sldrzr-link-reflow";
	a.title = "Toggle reflow";
	a.href = "javascript:Epub3Sliderizer.toggleReflow();";
	if (controls.children.length === 0)
	{
		controls.appendChild(a);
	}
	else
	{
		controls.insertBefore(a, controls.children[0]);
	}
	
	
	if (document.defaultView && document.defaultView.getComputedStyle)
	{
		var style = document.defaultView.getComputedStyle(document.body,null);
		if (style)
		{
			var fontSize = style.getPropertyValue("font-size");
			
			if (fontSize && fontSize !== "")
			{
				console.log("fontSize (COMPUTED): " + fontSize);

				var size = Math.round(parseFloat(fontSize));
				Epub3Sliderizer.defaultFontSize = size;
				
				document.body.style.fontSize = fontSize;
//				console.log(document.body.style.fontSize);
				
				fontSize = getCookie(Epub3Sliderizer.cookieFontSize);
				console.log("fontSize (COOKIE): " + fontSize);
				
				if (fontSize !== null && fontSize !== "")
				{
					document.body.style.fontSize = fontSize;
				}
				else
				{
				    setCookie(Epub3Sliderizer.cookieFontSize, document.body.style.fontSize);
				}
			}
		}
	}

	Epub3Sliderizer.readium = isDefinedAndNotNull(window.parent.Readium);
	Epub3Sliderizer.ibooks = isDefinedAndNotNull(window.iBooks);
	Epub3Sliderizer.playbooks = isDefinedAndNotNull(window.editions);

	if (Epub3Sliderizer.opera)
	{
		document.body.classList.add("opera");
	}
	if (Epub3Sliderizer.firefox)
	{
		document.body.classList.add("firefox");
	}

	if (Epub3Sliderizer.IE)
	{
		document.body.classList.add("IE");
		
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) !== null)
		{
			var ver = parseFloat( RegExp.$1 );
			if (ver <= 9.0)
			{
				document.body.classList.add("IE9");
			}
		}
	}
	if (Epub3Sliderizer.mobile)
	{
		document.body.classList.add("mobile");
	}
	
	if (getUrlQueryParam("epub") !== null)
	{
		Epub3Sliderizer.epubMode = true;
	}
	
	if (getUrlQueryParam("static") !== null)
	{
		Epub3Sliderizer.staticMode = true;
		document.body.classList.add("static");
	}
	else if (getUrlQueryParam("author") !== null)
	{
		Epub3Sliderizer.authorMode = true;
		document.body.classList.add("author");
	}
	else if (Epub3Sliderizer.android ||
		(getUrlQueryParam("basic") !== null)
	)
	{
		Epub3Sliderizer.basicMode = true;
		document.body.classList.add("basic");
	}

	if (Epub3Sliderizer.staticMode)
	{
		window.setTimeout(
			function()
			{
				Epub3Sliderizer.init();

				if (isDefinedAndNotNull($))
				{
					//$.blockUI.defaults.css = { cursor: "default" };
					$.blockUI.defaults.overlayCSS.opacity = 0;
					$.blockUI.defaults.overlayCSS.cursor = "default";
					$.blockUI({ message: null, css: { border: "none", cursor: "default" } });
				}
			}
			, 0);
	}
	else if (Epub3Sliderizer.basicMode)
	{
		Epub3Sliderizer.init();
	}
	else
	{
		if (Epub3Sliderizer.ibooks || Epub3Sliderizer.readium || Epub3Sliderizer.playbooks)
		{
			Epub3Sliderizer.init();
		}
		else
		{
			Epub3Sliderizer.resetResize();
		}
	}
}


window.Epub3Sliderizer = Epub3Sliderizer;
	

// ----------

//window.onload = readyFirst;
document.addEventListener("DOMContentLoaded", function(e) { readyFirst(); }, false);

// ----------

// Note: the epubReadingSystem object may not be ready when directly using the
// window.onload callback function (from within an (X)HTML5 EPUB3 content document's Javascript code)
// To address this issue, the recommended code is:
// -----
//function readyDelayed() { console.log(navigator.epubReadingSystem); };
// 
// // With jQuery:
// $(document).ready(function () { setTimeout(readyDelayed, 200); });
// 
// // With the window "load" event:
// window.addEventListener("load", function () { setTimeout(readyDelayed, 200); }, false);
// 
// // With the modern document "DOMContentLoaded" event:
document.addEventListener("DOMContentLoaded", function(e) { setTimeout(readyDelayed, 200); }, false);

})();

//####################################################################################################
//####################################################################################################
