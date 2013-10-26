#!/bin/sh

#git checkout gh-pages

target="doc"
target="demo1"

cp _OUTPUT/content/*.epub .

cp -r _OUTPUT/content/EPUB3/* ${target}

git status

git status --short ${target}

git ls-files --exclude-standard --others ${target} | xargs git add

git status --short ${target}

git status

root=$(pwd)
echo "${root}"

git commit -a -m "${root} up"
git push

#git checkout master