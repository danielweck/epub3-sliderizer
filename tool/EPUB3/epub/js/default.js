// REQUIRES:
// screenfull.js
// classList.js
// hammer.js + fakemultitouch + showtouches
// jquery.js
// jquery.mousewheel.js
// jquery.blockUI.js

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

var Epub3Sliderizer = {
	epubReadingSystem: null,
	readium: false,
	kobo: false, //DELAYED !! typeof window.KOBO_TAG != 'undefined', //typeof window.nextKoboSpan != 'undefined' || 
	ibooks: false,
	staticMode: false,
	authorMode: false,
	prev: "",
	next: "",
	toc: "../nav.xhtml",
	epub: "",
	reverse: false,
	thisFilename: null,
	thisHash: null,
	incrementals: null,
	increment: -1,
	bodyRoot: null,
	transforms: new Array(),
	totalZoom: 1,
	pauseEvents: false,
	firefox: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
	opera: (typeof window.opera != "undefined") || navigator.userAgent.toLowerCase().indexOf(' opr/') >= 0,
	mobile: navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Mobile)/)
	// && navigator.userAgent.match(/AppleWebKit/)
};

// ----------

Epub3Sliderizer.AUTHORize = function(selector)
{
	if (typeof $ == "undefined")
	{
		return;
	}

	var elems = $(selector);
	elems.addClass("ui-widget-content");
	elems.addClass("epb3sldrzr-author");
	
	// Mhmmm? ...
	elems.addClass("epb3sldrzr-author-INIT");


	if (typeof $(window).draggable != "undefined")
	{
		elems.draggable();
	}

	if (typeof $(window).resizable != "undefined")
	{
		elems.resizable();
	}

	/*
	if (typeof $(window).selectable != "undefined")
	{
		elems.selectable();
	}
	*/
}

// ----------

Epub3Sliderizer.isEpubReadingSystem = function()
{
	return this.epubReadingSystem != null || this.readium || this.kobo || this.ibooks;
}

// ----------

Epub3Sliderizer.gotoToc = function()
{
	if (this.isEpubReadingSystem())
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
	if (this.isEpubReadingSystem())
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
	if (this.isEpubReadingSystem())
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

Epub3Sliderizer.transition = function(on)
{
	var milliseconds = 500;
	
	if (on)
	{
		var transition = "all "+milliseconds+"ms ease-in-out";
		document.body.style.MozTransition = transition;
		document.body.style.WebkitTransition = transition;
		document.body.style.OTransition = transition;
		document.body.style.msTransition = transition;
		document.body.style.transition = transition;
	}
	else
	{
		setTimeout(function()
		{
			document.body.style.MozTransition = null;
			document.body.style.WebkitTransition = null;
			document.body.style.OTransition = null;
			document.body.style.msTransition = null;
			document.body.style.transition = null;
		}, milliseconds + 10);
	}
}

// ----------

Epub3Sliderizer.pan = function(x, y)
{
	this.transition(true);
	
	this.transforms.push({
		rotation: 0,
		zoom: 1,
		left: 0,
		top: 0,
		transX: x,
		transY: y
	});

	this.onResize();

	this.transition(false);
}

// ----------

Epub3Sliderizer.toggleZoom = function(x, y)
{
	this.transition(true);

	if (this.totalZoom != 1)
	{
		this.resetResize();
	}
	else
	{
		this.totalZoom = 2;

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

	this.transition(false);
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

	if (keyboardEvent.keyCode == 90) // Z
	{
		this.toggleZoom(0,0);
	}
	else if (keyboardEvent.keyCode == 27) // ESC
	{
		if (this.totalZoom != 1)
		{
			this.toggleZoom(0,0);
		}
	}
	/*
	else if (keyboardEvent.keyCode == 13) // RETURN / ENTER
	{
		keyboardEvent.preventDefault();	
	}
	*/
	/*
	else if (keyboardEvent.keyCode == 70) // F
	{
		if (typeof screenfull != 'undefined')
		{
			keyboardEvent.preventDefault();
			screenfull.toggle();
		}
	}
	else if (keyboardEvent.keyCode == 27) // ESC
	{
		if (typeof screenfull != 'undefined')
		{
			keyboardEvent.preventDefault();
			screenfull.exit();
		}
	}
	*/
	else if (this.totalZoom != 1)
	{
		var offset = 100;
	
		if (keyboardEvent.keyCode == 37 // left arrow
		)
		{
			keyboardEvent.preventDefault();
			this.pan(offset, 0);
		}
		else if (keyboardEvent.keyCode == 39 // right arrow
		)
		{
			keyboardEvent.preventDefault();
			this.pan(-offset, 0);
		}
		else if (keyboardEvent.keyCode == 38 // up arrow
			|| keyboardEvent.keyCode == 33 // page up
		)
		{
			keyboardEvent.preventDefault();
			this.pan(0, offset);
		}
		else if (keyboardEvent.keyCode == 40 // down arrow
			|| keyboardEvent.keyCode == 34 // page down
		)
		{
			keyboardEvent.preventDefault();
			this.pan(0, -offset);
		}
	}
	else if (keyboardEvent.keyCode == 37 // left arrow
	//|| keyboardEvent.keyCode == 38 // up arrow
	|| keyboardEvent.keyCode == 33 // page up
	)
	{
		keyboardEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyboardEvent.keyCode == 39 // right arrow
	//|| keyboardEvent.keyCode == 40 // down arrow
	|| keyboardEvent.keyCode == 34 // page down
	)
	{
		keyboardEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyboardEvent.keyCode == 40) // down arrow
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyboardEvent.keyCode == 38) // up arrow
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(true);
	}
	else if (keyboardEvent.keyCode == 35) // end
	{
		keyboardEvent.preventDefault();
		this.gotoNext();
	}
	else if (keyboardEvent.keyCode == 36) // home
	{
		keyboardEvent.preventDefault();
		this.gotoPrevious();
	}
	else if (keyboardEvent.keyCode == 32) // space
	{
		keyboardEvent.preventDefault();
		this.nextIncremental(false);
	}
	else if (keyboardEvent.keyCode == 77) // m
	{
		if (this.prev != "")
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
	
	if (typeof Hammer == "undefined")
	{
		return;
	}
	
	var that = this;
	
	var scrolling = false;
	
	function onSwipeLeft(hammerEvent)
	{
		if (this.totalZoom != 1)
		{
			return;
		}
		
		this.gotoNext();
	}
	
	function onSwipeRight(hammerEvent)
	{
		if (this.totalZoom != 1)
		{
			return;
		}
		
		this.gotoPrevious();
	}
	
	function onSwipeUp(hammerEvent)
	{
		if (this.totalZoom != 1)
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
		if (this.totalZoom != 1)
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
		document.body.style.opacity = "1";
		
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
					transX: (hammerEvent.gesture.center.pageX*hammerEvent.gesture.scale - dragXStart*hammerEvent.gesture.scale),
					transY: (hammerEvent.gesture.center.pageY*hammerEvent.gesture.scale - dragYStart*hammerEvent.gesture.scale)
				});

				if (this.totalZoom < 1)
				{
					document.body.style.opacity = this.totalZoom;
				}
				
				this.onResize();
			}
		}
	}
	
	function onTransformEnd(hammerEvent)
	{
		if (scrolling)
		{
			return;
		}
		
		if (this.totalZoom <= 1)
		{
			this.transition(true);
		
			resetTransform();
			
			this.transition(false);
		}
	}
	
	function onTransformStart(hammerEvent)
	{
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
		if (scrolling)
		{
			return;
		}
		
		if (this.totalZoom == 1)
		{
			this.transition(true);
		
			resetTransform();
			
			this.transition(false);
		}
	}
	
	function onDrag(hammerEvent)
	{
		if (scrolling)
		{
			return;
		}
		
		if (hammerEvent.gesture)
		{
			if (!firstDrag)
			{
				this.transforms.pop();
			}
			firstDrag = false;
			
			var xOffset = hammerEvent.gesture.center.pageX - dragXStart;

			var opacity = 1;
			if (this.totalZoom == 1)
			{
				var off = Math.abs(xOffset);
				opacity = 1 - (off / window.innerWidth); //document.body.clientWidth
				
				document.body.style.opacity = opacity;
			}
			
			//$("h1#epb3sldrzr-title").html(this.totalZoom + " - " + opacity);
			
			this.transforms.push({
				rotation: 0,
				zoom: 1, //opacity,
				left: hammerEvent.gesture.center.pageX,
				top: hammerEvent.gesture.center.pageY,
				transX: xOffset,
				transY: this.totalZoom == 1 ? 0 : hammerEvent.gesture.center.pageY - dragYStart
			});

			this.onResize();
		}
	}
	
	function onDragStart(hammerEvent)
	{
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

		if (this.totalZoom != 1)
		{
			return;
		}

		var scroll = querySelectorZ("div#epb3sldrzr-root");
		if (typeof scroll == "undefined" || scroll == null)
		{
			scroll = querySelectorZ("div#epb3sldrzr-root-NOTES");
		}
		
		var target = hammerEvent.target;
		while (target)
		{
			if(target == scroll)
			{
				if (scroll.offsetHeight < scroll.scrollHeight)
				{
					if (scroll.scrollTop <= 0
							&& hammerEvent.gesture && hammerEvent.gesture.direction == "down")
					{
						;
					}
					else if (scroll.scrollTop >= (scroll.scrollHeight - scroll.offsetHeight)
							&& hammerEvent.gesture && hammerEvent.gesture.direction == "up")
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
		if (hammerEvent.gesture)
		{
			hammerEvent.gesture.preventDefault();
			hammerEvent.gesture.stopPropagation();
		}

		this.toggleZoom(hammerEvent.gesture.center.pageX, hammerEvent.gesture.center.pageY);

		/*
		var that = this;
		setTimeout(function()
		{
			if (typeof window.orientation != 'undefined')
			{
				that.onOrientationChange();
			}
			else
			{
				that.onResize();
			}
		}, 20);
		*/
	}
	
	var hammer = Hammer(document.documentElement,
		{
			prevent_default: true,
			css_hacks: false
		});
	
	hammer.on("doubletap",
		onDoubleTap.bind(this)
	);
	
	/*
	function onHold(hammerEvent)
	{
	}
	
	hammer.on("hold",
		onHold.bind(this)
	);
	*/
	
	/*
	function onTap(hammerEvent)
	{
		console.log("TAP");
	}
	
	hammer.on("tap",
		onTap.bind(this)
	);
	*/
	
	document.addEventListener('touchstart', function(e)
	{
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
	if (!this.isEpubReadingSystem())
	{
		return;
	}

	document.body.style.MozTransformOrigin = null;
	document.body.style.WebkitTransformOrigin = null;
	document.body.style.OTransformOrigin = null;
	document.body.style.msTransformOrigin = null;
	document.body.style.transformOrigin = null;

	document.body.style.MozTransform = null;
	document.body.style.WebkitTransform = null;
	document.body.style.OTransform = null;
	document.body.style.msTransform = null;
	document.body.style.transform = null;
}


Epub3Sliderizer.resetResize = function()
{
	this.totalZoom = 1;
	this.transforms = new Array();
	
	this.onResize();
}

// ----------

// ratio 1.29:1
// 1290 x 1000
// 1900 x 1470
// 2048 x 1536 (Retina)
// 2400 x 1860

Epub3Sliderizer.onResize = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	/*
	if (document.body.classList.contains("epb3sldrzr-NOTES"))
	{
		return;
	}
	*/

	/*
	console.log("*** 1");	
	console.log(document.body.clientWidth);
	console.log(document.body.clientHeight);
	console.log("--- 2");	
	console.log(window.innerWidth);
	console.log(window.innerHeight);
	console.log("--- 3");
	*/

	/*
	console.log("window.innerWidth: "  + window.innerWidth);
	console.log("window.innerHeight: "  + window.innerHeight);
	*/
	
	var sx = document.body.clientWidth / window.innerWidth;
	var sy = document.body.clientHeight / window.innerHeight;
	var ratio = 1.0 / Math.max(sx, sy);

	var newWidth = document.body.clientWidth * ratio;
	var offsetX = 0;
	if (window.innerWidth > newWidth)
	{
		offsetX = (window.innerWidth - newWidth) / 2;
	}
	offsetX = Math.round( offsetX * 1000.0 ) / 1000.0;
	offsetX = Math.round(offsetX);

	var newHeight = document.body.clientHeight * ratio;
	var offsetY = 0;
	if (window.innerHeight > newHeight)
	{
		offsetY = (window.innerHeight - newHeight) / 2;
	}
	offsetY = Math.round( offsetY * 1000.0 ) / 1000.0;
	offsetY = Math.round(offsetY);

	var transformOrigin = "0px 0px";
	
	document.body.style.MozTransformOrigin = transformOrigin;
	document.body.style.WebkitTransformOrigin = transformOrigin;
	document.body.style.OTransformOrigin = transformOrigin;
	document.body.style.msTransformOrigin = transformOrigin;
	document.body.style.transformOrigin = transformOrigin;
	
	
	var is3D = this.opera ? false : true;
	
	var transformCSS = "";
	
	for (var i = this.transforms.length-1; i >= 0; i--)
	{
		var transform = this.transforms[i];

		transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";
		
		if (transform.rotation != 0)
		{
			transformCSS += " rotate"+(is3D?"3d":"")+"(" + (is3D? "0,0,1,":"") + transform.rotation + "deg) ";
		}

		transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";
		


		transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.transX + "px," + transform.transY + "px"+(is3D?", 0":"")+") ";



		transformCSS += " translate"+(is3D?"3d":"")+"(" + transform.left + "px," + transform.top + "px"+(is3D?", 0":"")+") ";

		if (transform.zoom != 1)
		{
			transformCSS += " scale"+(is3D?"3d":"")+"(" + transform.zoom + (is3D? "," + transform.zoom + ",1":"") + ") ";
		}		

		transformCSS += " translate"+(is3D?"3d":"")+"(" + -transform.left + "px," + -transform.top + "px"+(is3D?", 0":"")+") ";

	}
	
	
	transformCSS += " translate"+(is3D?"3d":"")+"(" + offsetX  + "px," + offsetY + "px"+(is3D?", 0":"")+") "
	
	transformCSS += " scale"+(is3D?"3d":"")+"(" + ratio + (is3D? "," + ratio + ",1":"") + ") ";
	
	
	document.body.style.MozTransform = transformCSS;
	document.body.style.WebkitTransform = transformCSS;
	document.body.style.OTransform = transformCSS;
	document.body.style.msTransform = transformCSS;
	document.body.style.transform = transformCSS;
}

// ----------

Epub3Sliderizer.onOrientationChange = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	var viewport = querySelectorZ("html > head > meta[name=viewport]");
	if (typeof viewport != 'undefined')
	{
		var sx = document.body.clientWidth / window.innerWidth;
		var sy = document.body.clientHeight / window.innerHeight;
		var ratio = 1.0 / Math.max(sx, sy);

		var adjustedWidth = document.body.clientWidth * ratio;
		var adjustedHeight = document.body.clientHeight * ratio;

		var rounded = Math.round( ratio * 1000000.0 ) / 1000000.0;

		var width = Math.round( Math.round( adjustedWidth * 1000000.0 ) / 1000000.0 );
		
		var height = Math.round( Math.round( adjustedHeight * 1000000.0 ) / 1000000.0
		// - (this.staticMode ? 0 : 300)
	 	);


		/*
		console.log("### a");	
		console.log(document.body.clientWidth);
		console.log(document.body.clientHeight);
		console.log("--- b");	
		console.log(window.innerWidth);
		console.log(window.innerHeight);
		console.log("=== c");	
		console.log(width);
		console.log(height);
		*/

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
	console.log("window.location: " + window.location);
	
	var i = window.location.href.lastIndexOf('/');

	var thisFilename = null;
	var len = window.location.href.length;

	if (i >= 0 && i < len-1)
	{
		thisFilename = window.location.href.substring(i+1, len);
	}

	if (thisFilename == null)
	{
		this.thisFilename = thisFilename;
		this.thisHash = hash;
		return;
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

	var nav = querySelectorZ("html#epb3sldrzr-NavDoc");
	if (typeof nav != "undefined" && nav != null && nav)
	{
		this.toc = "html/" + this.toc;
	}
	
	//	var links = Array.prototype.slice.call(querySelectorAllZ("html > head > link"));
	//	if (typeof links != 'undefined')
	//	{		
	//		for (var i = 0; i < links.length; i++) { links[i] }

	var that = this;

	Array.prototype.forEach.call(
		querySelectorAllZ("html > head > link"),
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
				else if (rel.nodeValue === "epub")
				{
					that.epub = link.attributes['href'].nodeValue;
				}
			}
		}
	);
	

	var aa = document.createElement('a');
	aa.id = "epb3sldrzr-link-toc";
	aa.title = "Slide menu";
//		a.onMouseOver = "func('Slide menu')";
	aa.href = "javascript:Epub3Sliderizer.gotoToc();";
	//aa.innerHTML = "<span style=\"display:none;\">Slide menu</span>&#9733;";

	this.bodyRoot.insertBefore(aa, this.bodyRoot.children[0]);
		
	if (this.epub != "")
	{
		var nav = querySelectorZ("html#epb3sldrzr-NavDoc");
		if (typeof nav != "undefined" && nav != null && nav)
		{
			var a = document.createElement('a');
			a.id = "epb3sldrzr-link-epub";
			a.title = "Download EPUB file";
	//		a.onMouseOver = "func('EPUB download')";
			a.href = this.epub;
			//a.innerHTML = "<span style=\"display:none;\">EPUB download</span>&#9658;";

			this.bodyRoot.insertBefore(a, this.bodyRoot.children[0]);
		}
	}	
	
	if (this.next != "")
	{
		if (this.thisFilename != null)
		{
			this.next = this.next + "#" + this.thisFilename;
		}
		
		var a = document.createElement('a');
		a.id = "epb3sldrzr-link-next";
		a.title = "Next slide";
//		a.onMouseOver = "func('Next slide')";
		a.href = "javascript:Epub3Sliderizer.gotoNext();";
		//a.innerHTML = "<span style=\"display:none;\">Next slide</span>&#9658;";

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
//		a.onMouseOver = "func('Previous slide')";
		a.href = "javascript:Epub3Sliderizer.gotoPrevious();";
		//a.innerHTML = "<span style=\"display:none;\">Previous slide</span>&#9668;";

		this.bodyRoot.insertBefore(a, this.bodyRoot.children[0]);
	}
}


// ----------

Epub3Sliderizer.reAnimateElement = function(elem)
{	
	var elm = elem;
	var newOne = elm.cloneNode(true);
	elm.parentNode.replaceChild(newOne, elm);
	
	console.log("REANIMATE");
	
	if (elm == this.bodyRoot)
	{
		this.bodyRoot = newOne;
	}
	else
	{
		for (var i = 0; i < this.incrementals.length; i++)
		{
			if (elm == this.incrementals[i])
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
	Array.prototype.forEach.call(
		element.querySelectorAllZ(".animated"),
		function(elem)
		{
			reAnimateElement(elem);
		}
	);
}

// ----------

Epub3Sliderizer.invalidateIncremental = function(enableAuto)
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
			}
		);
		
		return;
	}
	
	var i = -1;
	var that = this;
	Array.prototype.forEach.call(
		this.incrementals,
		function(elem)
		{
			i++;
	
			var delay = elem.parentNode.getAttribute('data-incremental-delay') || 500;
	
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
						}, delay);
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
			
				if (that.firefox || that.opera)
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

	this.invalidateIncremental(false);
}

// ----------

Epub3Sliderizer.firstIncremental = function()
{
	if (this.isEpubReadingSystem())
	{
		return;
	}

	this.increment = 0;
	
	this.invalidateIncremental(true);
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
	
	this.invalidateIncremental(!backward && this.increment == 0);
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
		document.body.querySelectorAllZ(".epb3sldrzr-animated"),
		function(elem)
		{
			elem.classList.remove("epb3sldrzr-animated");

			elem.classList.add("animated"); // STOPPED BY DEFAULT IN CSS (animation-iteration-count: 0) ...
				
			elem.classList.add("epb3sldrzr-animateStart"); // ... THEN, ANIMATES (animation-iteration-count: N)
			
			if (that.firefox || that.opera)
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

	if (this.firefox || this.opera)
	{
//		this.reAnimateElement(this.bodyRoot);
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
		this.bodyRoot.querySelectorAllZ("#epb3sldrzr-content .epb3sldrzr-epubMediaOverlayActive"),
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
	
	this.incrementals = this.bodyRoot.querySelectorAllZ("#epb3sldrzr-content .incremental > *");

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

	var fakeEpubReadingSystem = false;

	if (typeof navigator.epubReadingSystem != 'undefined')
	{
		this.epubReadingSystem = navigator.epubReadingSystem;
	}
	else
	{
		if (window.location.search && window.location.search.indexOf("epub") >= 0)
		//if (window.location.href.indexOf("static") >= 0)
		{
			fakeEpubReadingSystem = true;
			this.epubReadingSystem = {name: "FAKE epub reader", version: "0.0.1"};
		}
	}
	
	if (this.epubReadingSystem != null)
	{
		console.log(this.epubReadingSystem.name);
		console.log(this.epubReadingSystem.version);
	}
	
	this.kobo = typeof window.KOBO_TAG != 'undefined'; //typeof window.nextKoboSpan != 'undefined' || 
	
	/*
	var obj = window;
	var str = "";
	for (var prop in obj) {
	  if (obj.hasOwnProperty(prop)) {
		  if (prop.toLowerCase().indexOf("kobo") >= 0
		  	|| prop.toLowerCase().indexOf("ibooks") >= 0
			|| prop.toLowerCase().indexOf("epub") >= 0)
		  {
			  str += ("\n" + prop);
		  }
	  }
	}
	alert(str);
	*/
	
	/*
	TOO SLOW! :(
	(despite CSS HW acceleration)
	
	var scroll = querySelectorZ("div#epb3sldrzr-root");
	if (typeof scroll == "undefined" || scroll == null)
	{
		scroll = querySelectorZ("div#epb3sldrzr-root-NOTES");
	}
	if (scroll.offsetHeight < scroll.scrollHeight)
	{
		var iScroll = new IScroll(scroll, { fadeScrollbar: false, bounce: false, preventDefault: false, useTransition: true, useTransform: false });
	}
	*/

	/*
	var aa_ = document.createElement('a');
	aa_.id = "epb3sldrzr-link-firebug";
	aa_.title = "Firebug";
//		a.onMouseOver = "func('Slide menu')";
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
		
		if (this.epubReadingSystem == null)
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

		document.body.insertBefore(a, document.body.children[0]);

		this.bodyRoot.style.visibility = "visible";
	}
	else if (this.staticMode || this.authorMode)
	{
		//console.log("STATIC (iframe)");
		
		document.body.classList.add("epb3sldrzr-epubReadingSystem");
		
		if (typeof window.orientation != 'undefined')
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
			alert("AUTHOR MODE");
			
			this.AUTHORize(".epb3sldrzr-author");
		}
	}
	else
	{	
		this.initReverse();
		
		this.initLinks();

		window.onkeyup = this.onKeyboard.bind(this);
	
		if (typeof Hammer != "undefined")
		{
			if (!this.mobile)
			{
				if (typeof Hammer.plugins.showTouches != "undefined")
				{
					Hammer.plugins.showTouches();
				}
				if (typeof Hammer.plugins.fakeMultitouch != "undefined")
				{
					Hammer.plugins.fakeMultitouch();
				}
			}
	
			delete Hammer.defaults.stop_browser_behavior.userSelect;
	
			this.hammer = Hammer(document.body,
				{
					prevent_default: false,
					css_hacks: false,
					swipe_velocity: 1
				});
		}
	
		this.initTouch();
	
		if (typeof window.orientation != 'undefined')
		{
			window.onorientationchange = this.onOrientationChange.bind(this);
			this.onOrientationChange();
		}
		else
		{
			window.onresize = this.onResize.bind(this);
			this.resetResize();
		}

		this.initMediaOverlays();

		if (this.mobile)
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
		
		if (typeof $ != "undefined")
		{

		//$(document).ready(function()
		//{
	
		(function($)
		{
			if (typeof $(window).mousewheel == "undefined")
			{
				return;
			}
	
			if (!navigator.userAgent.match(/Macintosh/))
			{
				return;
			}

			$(window).mousewheel(function (event, delta, deltaX, deltaY)
			{
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

					scrollableX = scrollableX || elem.scrollLeft != 0;
					scrollableY = scrollableY || elem.scrollTop != 0;

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
		
				if (this.totalZoom == 1)
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
		}(jQuery));

		//});

		}
	}
}

// ----------

function readyDelayed()
{
	if (Epub3Sliderizer.staticMode || Epub3Sliderizer.ibooks || Epub3Sliderizer.readium)
	{
		return;
	}

	Epub3Sliderizer.init();
}

// ----------

function readyFirst()
{
	Epub3Sliderizer.bodyRoot = querySelectorZ("#epb3sldrzr-body"); //document.body
		
	if (Epub3Sliderizer.opera)
	{
		document.documentElement.classList.add("opera");
	}
	if (Epub3Sliderizer.firefox)
	{
		document.documentElement.classList.add("firefox");
	}
	if (Epub3Sliderizer.mobile)
	{
		document.documentElement.classList.add("mobile");
	}

	if (window.location.search && window.location.search.indexOf("static") >= 0)
	//if (window.location.href.indexOf("static") >= 0)
	{
		Epub3Sliderizer.staticMode = true;
		document.documentElement.classList.add("static");
	}

	if (window.location.search && window.location.search.indexOf("author") >= 0)
	//if (window.location.href.indexOf("static") >= 0)
	{
		Epub3Sliderizer.authorMode = true;
		document.documentElement.classList.add("author");
	}

	if (Epub3Sliderizer.staticMode)
	{
		
		window.setTimeout(
			function()
			{
				Epub3Sliderizer.init();

				if (typeof $ != "undefined")
				{
					//$.blockUI.defaults.css = { cursor: "default" };
					$.blockUI.defaults.overlayCSS.opacity = 0;
					$.blockUI.defaults.overlayCSS.cursor = "default";
					$.blockUI({ message: null, css: { border: "none", cursor: "default" } });
				}
			}
			, 0);
	}
	else
	{
		Epub3Sliderizer.readium = typeof window.parent.Readium != 'undefined';
		Epub3Sliderizer.ibooks = typeof window.iBooks != 'undefined';

		if (Epub3Sliderizer.ibooks || Epub3Sliderizer.readium)
		{
			Epub3Sliderizer.init();
		}
		else
		{
			Epub3Sliderizer.resetResize();
		}
	}
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

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////


