#!/bin/sh

thin -c _OUTPUT/content/ -p 3000 -A file start &

open http://localhost:3000/EPUB3/epub/Nav.xhtml
