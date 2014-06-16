#!/bin/sh

# killall thin

thin -c _OUTPUT/ -p 3000 -a 192.168.1.68 -A file start &

open http://192.168.1.68:3000/content/EPUB3/epub/nav.xhtml

#open http://localhost:3000/content/index.html
