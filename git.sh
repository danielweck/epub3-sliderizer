#!/bin/sh

#git checkout gh-pages

cp _OUTPUT/content/EPUB3-Sliderizer.epub .

cp -r _OUTPUT/content/EPUB3/* doc/

git status --short doc

git ls-files --exclude-standard --others doc | xargs git add

git status --short doc

root=$(pwd)
echo "${root}"

git commit -a -m "www up"
git push

git checkout master