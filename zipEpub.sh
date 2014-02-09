#!/bin/sh

root=$(pwd)

EPUB_FILENAME="EPUB3-Sliderizer"

EPUB_FOLDER="${root}/_OUTPUT/content/EPUB3/"

find "${EPUB_FOLDER}" -name ".DS_Store" -depth -exec rm {} \;

#for x in `find ./$@ -name ".DS_Store" -print`
#   do
#     rm -f $x
#   done


javac -classpath "${root}/tool/epubcheck/epubcheck.jar" "${root}/zipEpub.java" -d "${root}/tool/epub3-sliderizer/bin" -sourcepath "${root}" #-verbose

java -classpath "${root}/tool/epubcheck/epubcheck.jar:${root}/tool/epub3-sliderizer/bin" zipEpub ${EPUB_FOLDER}

mv "${root}/_OUTPUT/content/EPUB3.epub" "${root}/_OUTPUT/content/${EPUB_FILENAME}.epub"

open "${EPUB_FOLDER}/.."