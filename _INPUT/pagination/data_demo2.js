
document.addEventListener("DOMContentLoaded", function(e)
{
    if (//true || //TODO remove this (desktop browser test only)
        ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
    {
        setTimeout(function()
        {
            checkInitHammer(initTouch);
        }, 800);
    } 
});

_PAGE_lastSubPage = 5;

_PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards)
{
    var container = document.getElementById("container");
    
    container.setAttribute("data-subpage", currentSubPage);

    container.classList.add(backwards ? "backwards" : "forwards");
    container.classList.remove(!backwards ? "backwards" : "forwards");
    
    if (!initialDisplay)
    {
        container.classList.add("transit");
    }
    else
    {
        container.classList.remove("transit");
    }
};

_PAGE_elementActivate = function(elementId)
{
    var elem = document.getElementById(elementId);
    if (!elem) return;
    
console.debug("_PAGE_elementActivate: " + elementId);
//console.debug(elem);

    var parent = elem;
    do
    {
        var id = parent.getAttribute("id");
        if (id)
        {
            var matches = id.match(/(subpage)([0-9]+)/);
            if (matches)
            {
console.debug("_1");
                var n = parseInt(matches[2]);
                n--;
                
                if (n >= 0 && n <= _PAGE_lastSubPage)
                {
console.debug("_3");
                    if (n !== _PAGE_currentSubPage)
                    {
console.debug(n);
                        _PAGE_goto(n);
                        return;
                    }
                }
            }
        }
        
        parent = parent.parentNode;
    }
    while (parent && parent.getAttribute);
};

var initTouch = function(hammerAlreadyLoaded)
{
    if (!window.Hammer) return;
    
    console.debug("HAMMER TOUCH INIT");

    //var that = this;

    var container = document.getElementById("container");
    var canvas = document.getElementById("canvas");

    // if (Hammer.defaults && Hammer.defaults.stop_browser_behavior)
    // {
    //     console.debug(Hammer.defaults.stop_browser_behavior);
    //
    //     if (Hammer.defaults.stop_browser_behavior.userSelect)
    //     {
    //         delete Hammer.defaults.stop_browser_behavior.userSelect;
    //     }
    //     else
    //     {
    //         delete Hammer.defaults.stop_browser_behavior;
    //     }
    // }

    var supportSwipe = hammerAlreadyLoaded ? true : false;

    var hammer = new Hammer(container,
    {
        drag: true,
        dragend: true,
        dragstart: true,
        
        drag_vertical: true,
        drag_horizontal: true,
        
        transform: false,
        transformend: false,
        transformstart: false,
        
        swipe: supportSwipe, // important!
        swipeleft: supportSwipe,
        swiperight: supportSwipe,
        swipeup: supportSwipe,
        swipedown: supportSwipe,
        
        tap: false,
        tap_double: false,
        
        hold: false,
        
        prevent_default: false,
        
        css_hacks: false,
        
        swipe_velocity: 1
    });

    var canDrag = true;
    
    var dragXStart = 0;
    var dragYStart = 0;

    hammer.on("dragstart",
    function(hammerEvent)
    {
        if (navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination && navigator.epubReadingSystem.Pagination.TouchSuspend)
        {
console.debug("TouchSuspend(false) 4");
            navigator.epubReadingSystem.Pagination.TouchSuspend(window, false);
        }
        
        canDrag = true;

        canvas.style.MozTransform = null;
        canvas.style.WebkitTransform = null;
        canvas.style.OTransform = null;
        canvas.style.msTransform = null;
        canvas.style.transform = null;

        canvas.style.MozTransitionProperty = "none";
        canvas.style.WebkitTransitionProperty = "none";
        canvas.style.OTransitionProperty = "none";
        canvas.style.msTransitionProperty = "none";
        canvas.style.transitionProperty = "none";
        
        canvas.style.MozTransitionDuration = "0s";
        canvas.style.WebkitTransitionDuration = "0s";
        canvas.style.OTransitionDuration = "0s";
        canvas.style.msTransitionDuration = "0s";
        canvas.style.transitionDuration = "0s";
        
        if (hammerEvent.gesture)
        {
            dragXStart = hammerEvent.gesture.center.pageX;
            dragYStart = hammerEvent.gesture.center.pageY;
        }
        else
        {
            dragXStart = 0;
            dragYStart = 0;
        }
    }
    );

    hammer.on("drag",
    function(hammerEvent)
    {
        if (!canDrag) return;
        
        if (hammerEvent.gesture)
        {
            var xOffset = hammerEvent.gesture.center.pageX - dragXStart;
            var yOffset = hammerEvent.gesture.center.pageY - dragYStart;

            if (xOffset == 0)
            {
                return;
            }
            else if (xOffset > 0 && _PAGE_currentSubPage === 0
                || xOffset < 0 && _PAGE_currentSubPage === 5)
            {
                // Reached edge => let the browser / reading system's own Hammer instance on this same window handle the drag (which may lead to a page turn swipe), otherwise see stopPropagation below
                
                canDrag = false;
                
                if (navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination && navigator.epubReadingSystem.Pagination.TouchSuspend)
                {
console.debug("TouchSuspend(false) 1");
                    navigator.epubReadingSystem.Pagination.TouchSuspend(window, false);
                }
                
                //hammerEvent.gesture.stopDetect();
                return;
            }

            if (navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination && navigator.epubReadingSystem.Pagination.TouchSuspend)
            {
console.debug("TouchSuspend(true)");
                navigator.epubReadingSystem.Pagination.TouchSuspend(window, true);
            }
                
            //hammerEvent.preventDefault();
            //hammerEvent.stopPropagation();
            
            //hammerEvent.gesture.preventDefault();
            hammerEvent.gesture.stopPropagation(); // EPUB3-Sliderizer's own Hammer top-level (document) handler will not receive the event, which remains within this scope (page content)

            var drag = 100 * Math.abs(xOffset) / canvas.clientWidth;
            var X = 0;
            var Y = 0;
            
            if (drag >= 5) // TODO: threshold should be based on X vs. Y ratio differences (percentage of viewport edge, depending on drag direction)
            {
                canDrag = false;
                
                restore();
//
//                 if (navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination && navigator.epubReadingSystem.Pagination.TouchSuspend)
//                 {
// console.debug("TouchSuspend(false) 2");
//                     navigator.epubReadingSystem.Pagination.TouchSuspend(window, false);
//                 }
//
//                 hammerEvent.gesture.stopDetect();
                
                if (xOffset <= 0)
                {
                    _PAGE_gotoNext();
                }
                else
                {
                    _PAGE_gotoPrevious();
                }
                
                return;
            }
            
            if (_PAGE_currentSubPage === 0)
            {
                if (xOffset < 0) // NEXT
                {
                    X = -drag + "%";
                    Y = 0;
                }
                else
                {
                    // no previous page
                    return;
                }
            }
            else if (_PAGE_currentSubPage === 1)
            {
                //-25%, 0

                if (xOffset < 0) // NEXT
                {
                    X = "-25%";
                    Y = -drag + "%";
                }
                else
                {
                    X = (drag - 25) + "%";
                    Y = 0;
                }
            }
            else if (_PAGE_currentSubPage === 2)
            {
                //-25%, -50%

                if (xOffset < 0) // NEXT
                {
                    X = (-drag - 25) + "%";
                    Y = "-50%";
                }
                else
                {
                    X = "-25%";
                    Y = (drag - 50) + "%";
                }
            }
            else if (_PAGE_currentSubPage === 3)
            {
                //-50%, -50%

                if (xOffset < 0) // NEXT
                {
                    X = (-drag - 50) + "%";
                    Y = "-50%";
                }
                else
                {
                    X = (drag - 50) + "%";
                    Y = "-50%";
                }
            }
            else if (_PAGE_currentSubPage === 4)
            {
                //-66.66%, -50%

                if (xOffset < 0) // NEXT
                {
                    X = "-66.66%";
                    Y = (drag - 50) + "%";
                }
                else
                {
                    X = (drag - 66.66) + "%";
                    Y = "-50%";
                }
            }
            else if (_PAGE_currentSubPage === 5)
            {
                //-66.66%, 0

                if (xOffset < 0)
                {
                    // no next page
                    return;
                }
                else
                {
                    X = "-66.66%";
                    Y = -drag + "%";
                }
            }

            var transform = "translate("+X+","+Y+")";

            //hammerEvent.gesture.distance
            canvas.style.MozTransform = transform;
            canvas.style.WebkitTransform = transform;
            canvas.style.OTransform = transform;
            canvas.style.msTransform = transform;
            canvas.style.transform = transform;
        }
    }
    );

    hammer.on("dragend",
    function(hammerEvent)
    {
        restore();

        if (navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination && navigator.epubReadingSystem.Pagination.TouchSuspend)
        {
console.debug("TouchSuspend(false) 3");
            navigator.epubReadingSystem.Pagination.TouchSuspend(window, false);
        }
    }
    );
    
    var restore = function()
    {
        canvas.style.MozTransform = null;
        canvas.style.WebkitTransform = null;
        canvas.style.OTransform = null;
        canvas.style.msTransform = null;
        canvas.style.transform = null;

        canvas.style.MozTransitionProperty = null;
        canvas.style.WebkitTransitionProperty = null;
        canvas.style.OTransitionProperty = null;
        canvas.style.msTransitionProperty = null;
        canvas.style.transitionProperty = null;
        
        canvas.style.MozTransitionDuration = null;
        canvas.style.WebkitTransitionDuration = null;
        canvas.style.OTransitionDuration = null;
        canvas.style.msTransitionDuration = null;
        canvas.style.transitionDuration = null;
    };
};

var checkInitHammer = function(init)
{
    if (window.Hammer)
    {
        console.debug("HAMMER already loaded.");
        init(true);
        return;
    }

    console.debug("HAMMER load attempt...");
    try
    {
        var head = document.head ? document.head : document.getElementsByTagName('head')[0];
        var script = document.createElementNS("http://www.w3.org/1999/xhtml", 'script');
        script.setAttribute("type", 'text/javascript');    
        script.setAttribute("src", "../js/hammer.min.js");
        head.appendChild(script);
    }
    catch (err)
    {
        console.error(err);
        console.error(err.msg);
    }
    
    var tryAgain_Hammer = function(tries)
    {
        if (!window.Hammer)
        {
            if (tries >= 0)
            {
                setTimeout(function()
                {
                    tryAgain_Hammer(--tries);
                }, 100);
            }

            console.debug("HAMMER ... :(");
            return;
        }

        console.debug("HAMMER loaded :)");
        init();
    };
    tryAgain_Hammer(10);
};
