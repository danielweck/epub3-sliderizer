#!/bin/sh

# killall thin

thin -c _OUTPUT/ -p 3000 -a localhost -A file start &

open http://localhost:3000/content/EPUB3/epub/nav.xhtml

#open http://localhost:3000/content/index.html
