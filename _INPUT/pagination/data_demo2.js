
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