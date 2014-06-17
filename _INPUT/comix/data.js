// ===== override at slide level
var updateScene = undefined;
var _lastSoftPage = 0;
// ===== override at slide level

var _softPage = 0;
var _precedentSoftPage = 0;

var _epubReadingSystemTries = 0;

function initthough()
{
    if (updateScene) updateScene(true);

    if (!navigator.epubReadingSystem)
    {
        console.log("!navigator.epubReadingSystem");

        _epubReadingSystemTries++;
        if (_epubReadingSystemTries < 20)
        {
            setTimeout(initthough, 100);
        }
        return;
    }

    console.error("INIT THOUGH");
    if (navigator.epubReadingSystem.on)
    {
        console.error("CONTENT ONEVENT");

        console.log(navigator.epubReadingSystem.PageDirection);

        if (navigator.epubReadingSystem.PageDirection === navigator.epubReadingSystem.EVENT_PAGE_PREVIOUS)
        {
            _precedentSoftPage = _lastSoftPage + 1;
            _softPage = _lastSoftPage;
        }

        if (updateScene) updateScene(true);

        var pageNext = function(payload)
        {
            console.error("CONTENT EVENT_PAGE_NEXT PAYLOAD");
            console.debug(payload);

            _precedentSoftPage = _softPage;

            _softPage++;
            if (_softPage > _lastSoftPage)
            {
                _softPage--;

                return true; // do nothing, just let the Reading System turn the page normally
            }

            if (updateScene) updateScene();

            return false;
        };
        var pagePrevious = function(payload)
        {
            console.error("CONTENT EVENT_PAGE_PREVIOUS PAYLOAD");
            console.debug(payload);

            _precedentSoftPage = _softPage;

            _softPage--;
            if (_softPage < 0)
            {
                _softPage++;

                return true; // do nothing, just let the Reading System turn the page normally
            }

            if (updateScene) updateScene();

            return false;
        };

        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_NEXT, pageNext);
        navigator.epubReadingSystem.on(window, navigator.epubReadingSystem.EVENT_PAGE_PREVIOUS, pagePrevious);

    }
}

document.addEventListener("DOMContentLoaded", function(e)
{
    initthough();
}, false);
