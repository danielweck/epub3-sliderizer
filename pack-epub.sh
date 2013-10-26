#!/bin/sh

root=$(pwd)

EPUB_FILENAME="EPUB3-Sliderizer"

EPUB_FOLDER="${root}/_OUTPUT/content/EPUB3/"

find "${EPUB_FOLDER}" -name ".DS_Store" -depth -exec rm {} \;

#for x in `find ./$@ -name ".DS_Store" -print`
#   do
#     rm -f $x
#   done

java -jar "${root}/tool/epubcheck/epubcheck.jar" "${EPUB_FOLDER}" -mode exp -save

mv "${root}/_OUTPUT/content/EPUB3.epub" "${root}/_OUTPUT/content/${EPUB_FILENAME}.epub"

open "${root}/_OUTPUT/content/"
