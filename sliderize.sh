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

#VERBOSITY="VERBOSE_min"
#VERBOSITY="VERBOSE_medium"
#VERBOSITY="VERBOSE_max"
VERBOSITY="VERBOSE_min"

root=$(pwd)

DATA_file="${root}/_INPUT/${TARGET}/data.txt"
if [ -f ${DATA_file} ]
then
    echo "Data file found: ${DATA_file}"
else
    echo "Data file not found! ${DATA_file}"
    exit
fi

EPUB_FILENAME="EPUB3-Sliderizer"
if [ "${TARGET}" != "doc" ]
then
    EPUB_FILENAME="EPUB3-Sliderizer_${TARGET}"
fi
echo "EPUB file: ${EPUB_FILENAME}"


rm -r ./_OUTPUT
mkdir ./_OUTPUT
#cp -r ./tool/readium ./_OUTPUT/
mkdir ./_OUTPUT/content
cp -r ./tool/EPUB3 ./_OUTPUT/content/
#mv ./_OUTPUT/readium/index.html ./_OUTPUT/content/


bin="${root}/tool/epub3-sliderizer/bin/"

if [ -f ${bin} ]; then

echo "Build directory found: ${bin}"

else

echo "MKDIR: ${bin}"

mkdir "${bin}"

fi



cd ./tool/epub3-sliderizer/

pwd

class="./bin/Main.clazz"

if [ -f ${class} ]; then

echo "Class found: ${class}"

else

echo "Compiling: ${class}"

javac -classpath ".:${root}/tool/epub3-sliderizer/lib/guava-15.0.jar:${root}/tool/epub3-sliderizer/lib/mustache-compiler-0.8.13.jar:${root}/tool/epub3-sliderizer/lib/asm-all-4.1.jar:${root}/tool/epub3-sliderizer/lib/parboiled-core-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/parboiled-java-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/pegdown-1.4.1.jar:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar" "${root}/tool/epub3-sliderizer/src/Main.java" -d "${bin}" -sourcepath "${root}/tool/epub3-sliderizer/src" #-verbose

fi

DATA_url="file://${DATA_file}"

EPUB_FOLDER="${root}/_OUTPUT/content/EPUB3/epub"

echo "EPUB3-Sliderization in progress..."
echo ${DATA_file}
echo ${EPUB_FOLDER}

java -classpath "${root}/tool/epub3-sliderizer/lib/guava-15.0.jar:${root}/tool/epub3-sliderizer/lib/mustache-compiler-0.8.13.jar:${root}/tool/epub3-sliderizer/lib/asm-all-4.1.jar:${root}/tool/epub3-sliderizer/lib/parboiled-core-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/parboiled-java-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/pegdown-1.4.1.jar:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar:${bin}" Main ${DATA_url} ${EPUB_FOLDER} ${VERBOSITY}

#open ${EPUB_FOLDER}
#exit


cd ${root}

./pack-epub.sh

mv "${root}/_OUTPUT/content/EPUB3-Sliderizer.epub" "${root}/_OUTPUT/content/${EPUB_FILENAME}.epub"