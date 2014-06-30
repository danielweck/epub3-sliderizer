
_PAGE_lastSubPage = 4;

_PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards)
{
    var scroll = document.getElementById("scroll");

    if (!initialDisplay)
    {
        scroll.classList.add("transit");
    }
    else
    {
        scroll.classList.remove("transit");
    }

    var container = document.getElementById("container");
    container.setAttribute("data-subpage", currentSubPage);
    
    return "subpage" + currentSubPage;
};

_PAGE_elementActivate = function(elementId)
{
console.error("_PAGE_elementActivate: " + elementId);
    var matches = elementId.match(/(page|subpage)([0-9]+)/);
    if (matches)
    {
console.debug("_1");
        var n = parseInt(matches[2]);
        if (matches[1] === "page")
        {
console.debug("_2");
            n--;
        }
        if (n >= 0 && n <= _PAGE_lastSubPage)
        {
console.debug("_3");
            if (n !== _PAGE_currentSubPage)
            {
console.debug(n);
                _PAGE_goto(n);
            }
        }
    }
};