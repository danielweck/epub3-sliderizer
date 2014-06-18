
_PAGE_lastSubPage = 4;

_PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards)
{
    var container = document.getElementById("container");
    
    container.setAttribute("data-subpage", currentSubPage);

    if (!initialDisplay)
    {
        container.classList.add("transit");
    }
    else
    {
        container.classList.remove("transit");
    }
};