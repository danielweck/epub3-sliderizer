#!/bin/sh

#git checkout gh-pages

cp _OUTPUT/content/EPUB3-Sliderizer.epub .
cp -r _OUTPUT/content/EPUB3/* doc/
git commit -a -m "www up"
git push

git checkout master