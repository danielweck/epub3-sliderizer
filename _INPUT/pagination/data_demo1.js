
_PAGE_lastSubPage = 4;

_PAGE_updateDisplay = function(initialDisplay, currentSubPage, backwards)
{
//    var heading = document.getElementById("heading");
//    heading.innerHTML = "Page 2 ........... sub-page <span style=\"color:red;\">" + (currentSubPage+1) + "</span> / " + (_PAGE_lastSubPage+1);

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