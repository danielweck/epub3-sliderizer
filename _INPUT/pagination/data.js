
// ===== OVERRIDE FOR EACH XHTML PAGE:

var _PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards)
{
    console.debug("_PAGE_updateDisplay NOOP");
    console.debug("initialDisplay: " + initialDisplay);
    console.debug("currentSubPage: " + currentSubPage);
    console.debug("backwards: " + backwards);
    
    return undefined;
};

var _PAGE_lastSubPage = 0;

var _PAGE_elementActivate = function(elementId)
{
    console.debug("_PAGE_elementActivate NOOP: " + elementId);
};

// ===== ===== ===== ===== ===== ===== 

var _PAGE_currentSubPage = 0;

var _PAGE_goto = undefined;
var _PAGE_gotoFirst = undefined;
var _PAGE_gotoLast = undefined;
var _PAGE_gotoNext = undefined;
var _PAGE_gotoPrevious = undefined;


var _PAGE_updateDisplay_INTERNAL = function(initialDisplay, currentSubPage, backwards, notifyActiveSubPage)
{
    var elementId = _PAGE_updateDisplay(initialDisplay, currentSubPage, backwards);
    
    if (notifyActiveSubPage && navigator.epubReadingSystem && navigator.epubReadingSystem.Pagination)
    {
        navigator.epubReadingSystem.Pagination.ActiveSubPage(window, currentSubPage, _PAGE_lastSubPage+1, elementId);
    }
};

document.addEventListener("DOMContentLoaded", function(e)
{
    var _PAGE_precedentSubPage = 0;

    _PAGE_gotoFirst = function()
    {
        _PAGE_goto(0);
    };
    
    _PAGE_gotoLast = function()
    {
        _PAGE_goto(_PAGE_lastSubPage);
    };
    
    _PAGE_gotoNext = function()
    {
        _PAGE_goto(_PAGE_currentSubPage+1);
    };
    
    _PAGE_gotoPrevious = function()
    {
        _PAGE_goto(_PAGE_currentSubPage-1);
    };
    
    var throttle = function(func, wait, immediate)
    {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        var later = function()
        {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
        };

        return function()
        {
            var now = new Date();
            if (!previous && immediate === false)
            {
                previous = now;
            }
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
    };
    
    _PAGE_goto = function(subPage, initial, previous, skipActiveSubPageNotify)
    {
        if (subPage < 0 || subPage > _PAGE_lastSubPage) return;

        //if (subPage === _PAGE_currentSubPage) return;
        
        _PAGE_currentSubPage = subPage;

        setTimeout(function()
        {
            _skipHashChangeEvent = true;
            window.location.hash = "#page" + (_PAGE_currentSubPage+1);
        }, 100);
    
        _PAGE_updateDisplay_INTERNAL(initial ? true : false,
            _PAGE_currentSubPage, previous ? true : false,
            !skipActiveSubPageNotify ? true : false);
    };
    
    //_PAGE_goto = throttle(_PAGE_goto, 600, true); // true: first one wins, false: last one lives!

    var updateFromHash = function()
    {
console.debug("- HASH:");
console.debug(window.location.hash);

        if (window.location && window.location.hash)
        {
            var n = window.location.hash.replace("#page", "");
            try
            {
                n = parseInt(n) - 1;
            
                if (!isNaN(n) && n >= 0 && n <= _PAGE_lastSubPage)
                {
console.debug("- PAGE:");
console.debug(n);
                    _PAGE_currentSubPage = n;
                    
                    return true;
                }
            }
            catch(err)
            {
                console.error(err);
                console.error(err.msg);
            }
        }
        
        return false;
    };
    updateFromHash();
    _PAGE_updateDisplay_INTERNAL(true, _PAGE_currentSubPage, false);
    
    var _skipHashChangeEvent = false;
    window.addEventListener("hashchange", function()
    {
        if (_skipHashChangeEvent)
        {
            _skipHashChangeEvent = false;
            return;
        }
        if (updateFromHash())
        {
            _PAGE_updateDisplay_INTERNAL(true, _PAGE_currentSubPage, false);
        }
    }, false);

    var epubReadingSystem_WAIT_AND_DO = function(maxTries, waitTime, func, tries)
    {
        if (!tries) tries = 0;
        else tries++;
    
        if (!navigator.epubReadingSystem)
        {
            if (tries < maxTries)
            {
                setTimeout(function()
                {
                    epubReadingSystem_WAIT_AND_DO(maxTries, waitTime, func, tries);
                }, waitTime);
            }
            return;
        }

        func();
    };
    
    var epubReadingSystem_INIT = function()
    {
// console.debug("navigator.epubReadingSystem: ");
// console.debug(navigator.epubReadingSystem.Pagination.Direction);
    
        if (!navigator.epubReadingSystem.Pagination)
        {
            return;
        }

        if (navigator.epubReadingSystem.Pagination.Direction === navigator.epubReadingSystem.Pagination.EVENT_PAGE_PREVIOUS)
        {
            _PAGE_precedentSubPage = _PAGE_lastSubPage + 1;
            _PAGE_currentSubPage = _PAGE_lastSubPage;
        }

        var backward = _PAGE_precedentSubPage > _PAGE_currentSubPage;

        _PAGE_goto(_PAGE_currentSubPage, true, backward);

        var pagePreviousNext = function(previous, payload)
        {
            _PAGE_precedentSubPage = _PAGE_currentSubPage;

            var doNothing = previous ? (_PAGE_currentSubPage <= 0) : (_PAGE_currentSubPage >= _PAGE_lastSubPage);
            if (doNothing)
            {
console.debug("NOTHING _PAGE_currentSubPage: " + _PAGE_currentSubPage);
                return true; // do nothing, just let the Reading System turn the page normally
            }
            
            if (previous) _PAGE_currentSubPage--;
            else  _PAGE_currentSubPage++;

console.debug("DO _PAGE_currentSubPage: " + _PAGE_currentSubPage);

            _PAGE_goto(_PAGE_currentSubPage, false, previous);

            return false; // instruct the Reading System to *not* turn the page
        };
        
        navigator.epubReadingSystem.Pagination.registerEventListener(window, navigator.epubReadingSystem.Pagination.EVENT_PAGE_NEXT, function(payload){ return pagePreviousNext(false, payload); });
        navigator.epubReadingSystem.Pagination.registerEventListener(window, navigator.epubReadingSystem.Pagination.EVENT_PAGE_PREVIOUS, function(payload){ return pagePreviousNext(true, payload); });

        navigator.epubReadingSystem.Pagination.registerEventListener(window, navigator.epubReadingSystem.Pagination.EVENT_SUBPAGE_ELEMENT_ACTIVATE, function(payload){ _PAGE_elementActivate(payload); });
    };

    epubReadingSystem_WAIT_AND_DO(20, 100, epubReadingSystem_INIT);
    
}, false);
