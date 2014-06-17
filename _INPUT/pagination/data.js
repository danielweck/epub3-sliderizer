
// ===== OVERRIDE FOR EACH XHTML PAGE:

var _PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards) {};

var _PAGE_lastSubPage = 0;

// ===== ===== ===== ===== ===== ===== 

document.addEventListener("DOMContentLoaded", function(e)
{
    var _PAGE_currentSubPage = 0;
    var _PAGE_precedentSubPage = 0;

    console.debug(window.location.hash);
    if (window.location && window.location.hash)
    {
        var n = window.location.hash.replace("#subpage", "");
        try
        {
            n = parseInt(n) - 1;
            
            if (!isNaN(n) && n >= 0 && n <= _PAGE_lastSubPage)
            {
                console.debug(n);
                _PAGE_currentSubPage = n;
            }
        }
        catch(err)
        {
            console.error(err);
            console.error(err.msg);
        }
    }

    _PAGE_updateDisplay(true, _PAGE_currentSubPage, false);

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

        console.debug(navigator.epubReadingSystem.PageDirection);
        
        func();
    };
    
    var epubReadingSystem_INIT = function()
    {
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

        _PAGE_updateDisplay(true, _PAGE_currentSubPage, backward);

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

            _PAGE_updateDisplay(false, _PAGE_currentSubPage, previous);

            return false; // instruct the Reading System to *not* turn the page
        };
        
        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_NEXT, function(payload){ return pagePreviousNext(false, payload); });
        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_PREVIOUS, function(payload){ return pagePreviousNext(true, payload); });
    };

    epubReadingSystem_WAIT_AND_DO(20, 100, epubReadingSystem_INIT);
    
}, false);
