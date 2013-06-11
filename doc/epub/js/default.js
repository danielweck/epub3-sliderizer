// REQUIRES:
// screenfull.js
// classList.js

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

var querySelector$ = (HTMLElement.prototype.querySelector$ = function(selector)
{
	return this.querySelector(selector);
}).bind(document);

var querySelectorAll$ = (HTMLElement.prototype.querySelectorAll$ = function(selector)
{
	return this.querySelectorAll(selector);
}).bind(document);

querySelectorForEach = function(nodeList, funct)
{
	Array.prototype.forEach.call(nodeList, funct);
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

var Epub3Sliderizer = {
	epubReadingSystem: null,
	readium: false,
	prev: "",
	next: "",
	toc: "../nav.xhtml",
	reverse: false,
	thisFilename: null,
	thisHash: null,
	incrementals: null,
	increment: -1,
	bodyRoot: null
};

// ----------

Epub3Sliderizer.gotoToc = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	if (this.toc == "") 
	{
		return;
	}
	
	window.location = this.toc;
}

// ----------

Epub3Sliderizer.gotoPrevious = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	if (this.prev == "") 
	{
		return;
	}
	
	window.location = this.prev;
}

// ----------

Epub3Sliderizer.gotoNext = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	if (this.next == "") 
	{
		return;
	}
	
	window.location = this.next;
}

// ----------

Epub3Sliderizer.onKeyDown = function(keyDownEvent)
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	// Filter out keyboard shortcuts
	if (keyDownEvent.altKey
	|| keyDownEvent.ctrlKey
	|| keyDownEvent.metaKey
	|| keyDownEvent.shiftKey)
	{
		return;
	}

	if (keyDownEvent.keyCode == 37 // left arrow
	//|| keyDownEvent.keyCode == 38 // up arrow
	|| keyDownEvent.keyCode == 33 // page up
	)
	{
		keyDownEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyDownEvent.keyCode == 39 // right arrow
	//|| keyDownEvent.keyCode == 40 // down arrow
	|| keyDownEvent.keyCode == 34 // page down
	)
	{
		keyDownEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyDownEvent.keyCode == 40) // down arrow
	{
		keyDownEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyDownEvent.keyCode == 38) // up arrow
	{
		keyDownEvent.preventDefault();
		this.nextIncremental(true);
	}
	else if (keyDownEvent.keyCode == 35) // end
	{
		keyDownEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyDownEvent.keyCode == 36) // home
	{
		keyDownEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyDownEvent.keyCode == 32) // space
	{
		keyDownEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyDownEvent.keyCode == 77) // m
	{
		if (this.prev != "")
		{
			keyDownEvent.preventDefault();
			this.gotoToc();
		}
	}
	/*
	else if (keyDownEvent.keyCode == 13) // RETURN / ENTER
	{
		keyDownEvent.preventDefault();	
		this.gotoToc();
	}
	*/
	else if (keyDownEvent.keyCode == 70) // F
	{
		if (typeof screenfull != 'undefined')
		{
			keyDownEvent.preventDefault();
			screenfull.toggle();
		}
	}
	else if (keyDownEvent.keyCode == 27) // ESC
	{
		if (typeof screenfull != 'undefined')
		{
			keyDownEvent.preventDefault();
			screenfull.exit();
		}
	}
}

// ----------

Epub3Sliderizer.initTouch = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}

	var startX, moveX;
	var startY, moveY;
	var tracking = false;

	function onTouchStart(touchEvent)
	{
		// touchEvent.preventDefault();
		tracking = true;
		
		startX = touchEvent.changedTouches[0].pageX;
		startY = touchEvent.changedTouches[0].pageY;
	}

	function onTouchMove(touchEvent)
	{
		if (!tracking)
		{
			return;
		}
	
		moveX = touchEvent.changedTouches[0].pageX;
		moveY = touchEvent.changedTouches[0].pageY;

		var THRESHOLD = 100;
	
		if (startX - moveX > THRESHOLD)
		{
			tracking = false;
		
			this.gotoNext();
		}
		else if (startX - moveX < -THRESHOLD)
		{
			tracking = false;
		
			this.gotoPrevious();
		}
		else if (startY - moveY > THRESHOLD)
		{
			tracking = false;

			this.nextIncremental(true);
		}
		else if (startY - moveY < -THRESHOLD)
		{
			tracking = false;

			this.nextIncremental(false);
		}
	}

	document.body.addEventListener("touchstart", onTouchStart.bind(this), false);
	document.body.addEventListener("touchmove", onTouchMove.bind(this), false);
}

// ----------

Epub3Sliderizer.resetOnResizeTransform = function()
{
	if (this.epubReadingSystem == null && !this.readium)
	{
		return;
	}

	document.body.style.MozTransform = null;
	document.body.style.WebkitTransform = null;
	document.body.style.OTransform = null;
	document.body.style.msTransform = null;
	document.body.style.transform = null;
}

// ----------

// ratio 1.29:1
// 1290 x 1000
// 1900 x 1470
// 2048 x 1536 (Retina)
// 2400 x 1860

Epub3Sliderizer.onResize = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}

	/*
	if (document.body.classList.contains("epb3sldrzr-NOTES"))
	{
		return;
	}
	*/

	var transformOrigin = "0px 0px";

	document.body.style.MozTransformOrigin = transformOrigin;
	document.body.style.WebkitTransformOrigin = transformOrigin;
	document.body.style.OTransformOrigin = transformOrigin;
	document.body.style.msTransformOrigin = transformOrigin;
	document.body.style.transformOrigin = transformOrigin;

	var sx = document.body.clientWidth / window.innerWidth;
	var sy = document.body.clientHeight / window.innerHeight;
	var ratio = 1.0 / Math.max(sx, sy);

	var newWidth = document.body.clientWidth * ratio;
	var offsetX = 0;
	if (window.innerWidth > newWidth)
	{
		offsetX = (window.innerWidth - newWidth) / 2;
	}
	offsetX = Math.round( offsetX * 1000 ) / 1000;

	var newHeight = document.body.clientHeight * ratio;
	var offsetY = 0;
	if (window.innerHeight > newHeight)
	{
		offsetY = (window.innerHeight - newHeight) / 2;
	}
	offsetY = Math.round( offsetY * 1000 ) / 1000;


	var transform = "translate(" + offsetX + "px," + offsetY + "px)" + " " + "scale(" + ratio + ")" ;

	document.body.style.MozTransform = transform;
	document.body.style.WebkitTransform = transform;
	document.body.style.OTransform = transform;
	document.body.style.msTransform = transform;
	document.body.style.transform = transform;
}

// ----------

Epub3Sliderizer.onOrientationChange = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}

	/*
	if (document.body.classList.contains("epb3sldrzr-NOTES"))
	{
		return;
	}
	*/

	var viewport = querySelector$("html > head > meta[name=viewport]");
	if (typeof viewport != 'undefined')
	{
		var sx = document.body.clientWidth / window.innerWidth;
		var sy = document.body.clientHeight / window.innerHeight;
		var ratio = 1.0 / Math.max(sx, sy);
	
		var adjustedWidth = document.body.clientWidth * ratio;
		var adjustedHeight = document.body.clientHeight * ratio;

		var rounded = Math.round( ratio * 1000000.0 ) / 1000000.0;

		viewport.setAttribute('content',
			'width=' + (Math.round( adjustedWidth * 1000000.0 ) / 1000000.0)
			+ ',height=' + (Math.round( adjustedHeight * 1000000.0 ) / 1000000.0 - 300)
			+ ',user-scalable=yes'
			+ ',initial-scale='
			+ rounded
			+ ',minimum-scale='
			+ rounded
			+ ',maximum-scale=2'
			);
	}

	this.onResize();
}

// ----------

Epub3Sliderizer.initReverse = function()
{
	console.log("window.location: " + window.location);
	
	var i = window.location.href.lastIndexOf('/');
	var thisFilename = null;
	var len = window.location.href.length;
	if (i >= 0 && i < len-1)
	{
		thisFilename = window.location.href.substring(i+1, len);
	}
	var hash = null;
	i = thisFilename.indexOf('#');
	if (i >= 0)
	{
		if (i < thisFilename.length-1)
		{
			hash = thisFilename.substring(i+1, thisFilename.length);
		}
		thisFilename = thisFilename.substring(0, i);
	}
	
	this.thisFilename = thisFilename;
	this.thisHash = hash;
	
	console.log("THIS: " + thisFilename);
	console.log("HASH: " + hash);

	function getRank(fileName)
	{
		var rank = 0;
		
		if (fileName == null)
		{
			return rank;
		}
		
		var unit = 1;
		for (var i = fileName.length-1; i >= 0; i--)
		{
			var c = fileName[i];
			var val = 0;
			var nan = false;
			
			if (c == '0')
			{
				val = 0;
			}
			else if (c == '1')
			{
				val = 1;
			}
			else if (c == '2')
			{
				val = 2;
			}
			else if (c == '3')
			{
				val = 3;
			}
			else if (c == '4')
			{
				val = 4;
			}
			else if (c == '5')
			{
				val = 5;
			}
			else if (c == '6')
			{
				val = 6;
			}
			else if (c == '7')
			{
				val = 7;
			}
			else if (c == '8')
			{
				val = 8;
			}
			else if (c == '9')
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

	var thisRank = getRank(thisFilename);
	var prevRank = getRank(hash);
	
	console.log("RANK this: " + thisRank);
	console.log("RANK prev: " + prevRank);
	
	if (prevRank >= thisRank)
	{
		this.reverse = true;
		//document.body.classList.add("epb3sldrzr-reverse");
	}
}

// ----------

Epub3Sliderizer.initLinks = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	//	var links = Array.prototype.slice.call(querySelectorAll$("html > head > link"));
	//	if (typeof links != 'undefined')
	//	{		
	//		for (var i = 0; i < links.length; i++) { links[i] }

	var that = this;

	querySelectorForEach(
		querySelectorAll$("html > head > link"),
		function(link)
		{
			if (typeof link.attributes == 'undefined'
				|| link.attributes.length <= 0
				|| typeof link.attributes['href'] == 'undefined'
			)
			{
				return;
			}

			var rel = link.attributes['rel'];
			if (typeof rel != 'undefined')
			{
				if (rel.nodeValue === "prev")
				{
					that.prev = link.attributes['href'].nodeValue;
				}
				else if (rel.nodeValue === "next")
				{
					that.next = link.attributes['href'].nodeValue;
				}
			}
		}
	);
	
	if (this.next != "")
	{
		if (this.thisFilename != null)
		{
			this.next = this.next + "#" + this.thisFilename;
		}
		
		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-next";
		a.title = "Next slide";	
		a.href = "javascript:Epub3Sliderizer.gotoNext();";
		a.innerHTML = "&#9658;";

		this.bodyRoot.insertBefore(a, this.bodyRoot.children[0]);
	}

	if (this.prev != "")
	{
		if (this.thisFilename != null)
		{
			this.prev = this.prev + "#" + this.thisFilename;
		}
		
		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-previous";
		a.title = "Previous slide";	
		a.href = "javascript:Epub3Sliderizer.gotoPrevious();";
		a.innerHTML = "&#9668;";

		this.bodyRoot.insertBefore(a, this.bodyRoot.children[0]);



		var aa = document.createElement('a');
		aa.id = "epb3sldrzr-link-toc";
		aa.title = "Menu slide";
		aa.href = "javascript:Epub3Sliderizer.gotoToc();";
		aa.innerHTML = "&#9733;";

		this.bodyRoot.insertBefore(aa, this.bodyRoot.children[0]);
	}
}


// ----------

Epub3Sliderizer.reAnimateElement = function(elem)
{	
	var elm = elem;
	var newOne = elm.cloneNode(true);
	elm.parentNode.replaceChild(newOne, elm);
}

// ----------

Epub3Sliderizer.reAnimateAll = function(element)
{
	querySelectorForEach(
		element.querySelectorAll$(".animated"),
		function(elem)
		{
			reAnimateElement(elem);
		}
	);
}

// ----------

Epub3Sliderizer.invalidateIncremental = function(enableAuto)
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	if (this.increment < 0 || this.increment > (this.incrementals.length - 1))
	{
		this.increment = -1;
	
		querySelectorForEach(
			this.incrementals,
			function(elem)
			{
				elem.parentNode.removeAttribute("incremental-active");
				elem.removeAttribute("aria-selected");
			}
		);
		
		return;
	}
	
	var i = -1;
	var that = this;
	querySelectorForEach(
		this.incrementals,
		function(elem)
		{
			i++;
			
			if (i < that.increment)
			{
				elem.parentNode.setAttribute("incremental-active", "true");
				elem.removeAttribute("aria-selected");
			}
			else if (i > that.increment)
			{
				if (enableAuto && (i == that.increment + 1))
				{
					//console.log(elem.parentNode.classList.toString());
				
					if (elem.classList.contains("auto")
						||
						elem.parentNode.classList.contains("auto"))
						{
						var auto = i;
						setTimeout(function()
						{
							if (auto == that.increment + 1)
							{
								that.increment += 1;
								that.invalidateIncremental(true);
							}
						}, 500);
					}
				}
				
				var found = false;
				for (var j = 0; j < elem.parentNode.childNodes.length; j++)
				{
					if (elem.parentNode.childNodes[j] == that.incrementals[that.increment])
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
			}
			else if (i == that.increment)
			{
				elem.parentNode.setAttribute("incremental-active", "true");
				elem.setAttribute("aria-selected", "true");
				
				that.reAnimateAll(elem);
			}
		}
	);
}

// ----------

Epub3Sliderizer.lastIncremental = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	this.increment = this.incrementals.length - 1;
	
	this.invalidateIncremental(false);
}

// ----------

Epub3Sliderizer.firstIncremental = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	this.increment = 0;
	
	this.invalidateIncremental(true);
}

// ----------

Epub3Sliderizer.nextIncremental = function(backward)
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	if (backward && this.increment <= 0)
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
	
	this.invalidateIncremental(!backward);
}

// ----------

Epub3Sliderizer.initAnimations = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	var that = this;
	
	querySelectorForEach(
		document.body.querySelectorAll$(".epb3sldrzr-animated"),
		function(elem)
		{
			elem.classList.remove("epb3sldrzr-animated");

			elem.classList.add("animated"); // STOPPED BY DEFAULT IN CSS (animation-iteration-count: 0) ...
				
			elem.classList.add("epb3sldrzr-animateStart"); // ... THEN, ANIMATES (animation-iteration-count: N)
			
			var firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			var opera = (typeof window.opera != "undefined") || navigator.userAgent.toLowerCase().indexOf(' opr/') >= 0;
			if (firefox || opera)
			{
				that.reAnimateElement(elem);
			}
		}
	);
}

// ----------

Epub3Sliderizer.initSlideTransition = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}

	if (!this.reverse)
	{
		this.bodyRoot.classList.add("fadeInRightBig");// bounceInRight
	}
	else
	{
		this.bodyRoot.classList.add("fadeInLeftBig");// bounceInLeft
	}
	//this.bodyRoot.classList.add("epb3sldrzr-animated");
	
	this.bodyRoot.style.visibility = "visible";
	
	//this.bodyRoot.classList.remove("epb3sldrzr-animated");
	this.bodyRoot.classList.add("animated");
	this.bodyRoot.classList.add("epb3sldrzr-animateStart");
	
	//this.reAnimateElement(this.bodyRoot);
}

// ----------

Epub3Sliderizer.initMediaOverlays = function()
{
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	querySelectorForEach(
		this.bodyRoot.querySelectorAll$("#epb3sldrzr-content .epb3sldrzr-epubMediaOverlayActive"),
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
	if (this.epubReadingSystem != null || this.readium)
	{
		return;
	}
	
	this.incrementals = this.bodyRoot.querySelectorAll$("#epb3sldrzr-content .incremental > *");

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

Epub3Sliderizer.init = function()
{
	console.log("Epub3Sliderizer");
	console.log(window.navigator.userAgent);

	this.readium = typeof window.parent.Readium != 'undefined';

	if (typeof navigator.epubReadingSystem != 'undefined')
	{
		this.epubReadingSystem = navigator.epubReadingSystem;
	}

	if (this.epubReadingSystem != null)
	{
		console.log(this.epubReadingSystem.name);
		console.log(this.epubReadingSystem.version);
	}
	else if (this.readium)
	{
		//console.log(window.parent);
		//console.log(window.parent.Readium);
	}

	if (this.epubReadingSystem != null || this.readium)
	{
		this.resetOnResizeTransform();

		document.body.classList.add("epb3sldrzr-epubReadingSystem");

		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-epubReadingSystem";
		a.title = "EPUB Reading System info";
		
		if (this.epubReadingSystem == null)
		{
			a.href = "javascript:window.alert('Readium')";
			a.innerHTML = "Readium";
		}
		else
		{
			a.href = "javascript:window.alert(window.Epub3Sliderizer.epubReadingSystem.name + '_' + window.Epub3Sliderizer.epubReadingSystem.version)";
			a.innerHTML = this.epubReadingSystem.name + '_' + this.epubReadingSystem.version;
		}

		document.body.insertBefore(a, document.body.children[0]);
		
		this.bodyRoot.style.visibility = "visible";
	}

	if (this.epubReadingSystem == null && !this.readium)
	{
		this.initReverse();

		this.initLinks();

		window.onkeydown = this.onKeyDown.bind(this);
		this.initTouch();

		if (typeof window.orientation != 'undefined')
		{
			window.onorientationchange = this.onOrientationChange.bind(this);
			this.onOrientationChange();
		}
		else
		{
			window.onresize = this.onResize.bind(this);
			this.onResize();
		}

		this.initMediaOverlays();

		this.initSlideTransition();
		
		var that = this;
		setTimeout(function()
		{
			that.initIncrementals();
			that.initAnimations();
		}, 500);
	}
}

// ----------

function readyDelayed()
{
	Epub3Sliderizer.init();
}

// ----------

function readyFirst()
{
	Epub3Sliderizer.bodyRoot = querySelector$("#epb3sldrzr-body"); //document.body
	
	Epub3Sliderizer.onResize();
}

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