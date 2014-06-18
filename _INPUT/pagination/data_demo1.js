
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
};