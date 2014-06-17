
// ===== OVERRIDE FOR EACH XHTML PAGE:

var _PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards) {};

var _PAGE_lastSubPage = 0;

// ===== ===== ===== ===== ===== ===== 

var _PAGE_goto = undefined;

document.addEventListener("DOMContentLoaded", function(e)
{
    var _PAGE_currentSubPage = 0;
    var _PAGE_precedentSubPage = 0;
    
    _PAGE_goto = function(subPage, initial, previous)
    {
        if (subPage < 0 || subPage > _PAGE_lastSubPage) return;
        
        _PAGE_currentSubPage = subPage;

        setTimeout(function()
        {
            _skipHashChangeEvent = true;
            window.location.hash = "#page" + (_PAGE_currentSubPage+1);
        }, 100);
        
        _PAGE_updateDisplay(initial ? true : false, _PAGE_currentSubPage, previous ? true : false);
    };

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
    _PAGE_updateDisplay(true, _PAGE_currentSubPage, false);
    
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
            _PAGE_updateDisplay(true, _PAGE_currentSubPage, false);
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
// console.debug(navigator.epubReadingSystem.PageDirection);
// console.debug(navigator.epubReadingSystem.on);
    
        if (!navigator.epubReadingSystem.on)
        {
            return;
        }

        if (navigator.epubReadingSystem.PageDirection === navigator.epubReadingSystem.EVENT_PAGE_PREVIOUS)
        {
            _PAGE_precedentSubPage = _PAGE_lastSubPage + 1;
            _PAGE_currentSubPage = _PAGE_lastSubPage;
        }

        var backward = _PAGE_precedentSubPage > _PAGE_currentSubPage;

        _PAGE_goto(_PAGE_currentSubPage, true, backward);

        var pagePreviousNext = function(previous, payload)
        {
            _PAGE_precedentSubPage = _PAGE_currentSubPage;
            
            if (previous) _PAGE_currentSubPage--;
            else  _PAGE_currentSubPage++;

            var doNothing = previous ? (_PAGE_currentSubPage < 0) : (_PAGE_currentSubPage > _PAGE_lastSubPage);
            if (doNothing)
            {
                if (previous) _PAGE_currentSubPage++;
                else  _PAGE_currentSubPage--;
            
                return true; // do nothing, just let the Reading System turn the page normally
            }

            _PAGE_goto(_PAGE_currentSubPage, false, previous);

            return false; // instruct the Reading System to *not* turn the page
        };
        
        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_NEXT, function(payload){ return pagePreviousNext(false, payload); });
        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_PREVIOUS, function(payload){ return pagePreviousNext(true, payload); });
    };

    epubReadingSystem_WAIT_AND_DO(20, 100, epubReadingSystem_INIT);
    
}, false);
