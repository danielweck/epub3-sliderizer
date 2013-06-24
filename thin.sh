#!/bin/sh

thin -c _OUTPUT/content/EPUB3/epub/ -p 3000 -A file start &

open http://localhost:3000/Nav.xhtml
