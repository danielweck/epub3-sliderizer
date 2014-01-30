#!/bin/sh


TARGET="doc"
if [ "$#" -eq 0 ]
then
    echo "No script arguments."
else
    echo "Script arguments: ${#}"
    echo "Script argument #1 (TARGET): ${1}"
    TARGET=${1}
fi

cp _OUTPUT/content/*.epub .

mkdir ${TARGET}

cp -r _OUTPUT/content/EPUB3/* ${TARGET}

git status

git status --short ${TARGET}

git ls-files --exclude-standard --others ${TARGET} | xargs git add

git status

git status --short ${TARGET}

root=$(pwd)
echo "${root}"

git commit -a -m "${TARGET} up"
git push

git checkout master