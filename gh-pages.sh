#!/bin/sh

git checkout gh-pages

TARGET="doc"
if [ "$#" -eq 0 ]
then
    echo "No script arguments."
else
    echo "Script arguments: ${#}"
    echo "Script argument #1 (TARGET): ${1}"
    TARGET=${1}
fi

./git.sh "${TARGET}"