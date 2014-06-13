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
#VERBOSITY="VERBOSE_max" ===> triggers special "author" mode with Markdown editor (HTML mode)

# FIRST PASS => XHTML (EPUB3 ZIP)
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

exitValue=$?

echo "[INFO] javac: ${exitValue}"

if [ $exitValue != 0 ] 
then
echo "Compilation error?"
exit $exitValue 
fi

fi

DATA_url="file://${DATA_file}"

EPUB_FOLDER="${root}/_OUTPUT/content/EPUB3/epub"

echo "EPUB3-Sliderization in progress..."
echo ${DATA_file}
echo ${EPUB_FOLDER}

########################################################################################

java -classpath "${root}/tool/epub3-sliderizer/lib/guava-15.0.jar:${root}/tool/epub3-sliderizer/lib/mustache-compiler-0.8.13.jar:${root}/tool/epub3-sliderizer/lib/asm-all-4.1.jar:${root}/tool/epub3-sliderizer/lib/parboiled-core-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/parboiled-java-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/pegdown-1.4.1.jar:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar:${bin}" Main ${DATA_url} ${EPUB_FOLDER} ${VERBOSITY}

exitValue=$?

echo "[INFO] java (sliderize XHTML): ${exitValue}"

if [ $exitValue != 0 ] 
then
echo "Execution error?"
exit $exitValue 
fi


#open ${EPUB_FOLDER}
#exit

########################################################################################

cd ${root}

#### TODO REMOVE!!!
exit
cp -r _OUTPUT/content/EPUB3 ../readium-js-viewer/epub_content/

#mv "${root}/_OUTPUT/content/EPUB3/epub/js/aloha/" "${root}/_OUTPUT/content/"

############################################################
#### TODO RESTORE!!!
###./pack-epub.sh
############################################################

exitValue=$?

echo "[INFO] pack-epub.sh: ${exitValue}"

if [ $exitValue != 0 ] 
then
echo "PACK EPUB error? (rebuilding ZIP)"
./zipEpub.sh
fi

mv "${root}/_OUTPUT/content/EPUB3-Sliderizer.epub" "${root}/_OUTPUT/content/${EPUB_FILENAME}.epub"

if [ $exitValue != 0 ] 
then
exit $exitValue 
fi

####### exit

# 
# ########################################################################################
# 
# cd ./tool/epub3-sliderizer/
# 
# java -classpath "${root}/tool/epub3-sliderizer/lib/guava-15.0.jar:${root}/tool/epub3-sliderizer/lib/mustache-compiler-0.8.13.jar:${root}/tool/epub3-sliderizer/lib/asm-all-4.1.jar:${root}/tool/epub3-sliderizer/lib/parboiled-core-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/parboiled-java-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/pegdown-1.4.1.jar:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar:${bin}" Main ${DATA_url} ${EPUB_FOLDER} ${VERBOSITY} REFLOWABLE
# 
# exitValue=$?
# 
# echo "[INFO] java (sliderize XHTML reflowable): ${exitValue}"
# 
# if [ $exitValue != 0 ] 
# then
# echo "Execution error?"
# exit $exitValue 
# fi
# 
# ########################################################################################
# 
# cd ${root}
# 
# #mv "${root}/_OUTPUT/content/EPUB3/epub/js/aloha/" "${root}/_OUTPUT/content/"
# 
# ############################################################
# ./pack-epub.sh
# ############################################################
# 
# exitValue=$?
# 
# echo "[INFO] pack-epub.sh: ${exitValue}"
# 
# if [ $exitValue != 0 ] 
# then
# echo "PACK EPUB error?"
# exit $exitValue 
# fi
# 
# mv "${root}/_OUTPUT/content/EPUB3-Sliderizer.epub" "${root}/_OUTPUT/content/${EPUB_FILENAME}_REFLOW.epub"
# 
# #mv "${root}/_OUTPUT/content/aloha/" "${root}/_OUTPUT/content/EPUB3/epub/js/" 
# 
# ########################################################################################

######## exit

cd ./tool/epub3-sliderizer/

# SECOND PASS => HTML content editable author mode
VERBOSITY="VERBOSE_max"

java -classpath "${root}/tool/epub3-sliderizer/lib/guava-15.0.jar:${root}/tool/epub3-sliderizer/lib/mustache-compiler-0.8.13.jar:${root}/tool/epub3-sliderizer/lib/asm-all-4.1.jar:${root}/tool/epub3-sliderizer/lib/parboiled-core-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/parboiled-java-1.1.6.jar:${root}/tool/epub3-sliderizer/lib/pegdown-1.4.1.jar:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar:${bin}" Main ${DATA_url} ${EPUB_FOLDER} ${VERBOSITY}

exitValue=$?

echo "[INFO] java (sliderize HTML): ${exitValue}"

if [ $exitValue != 0 ] 
then
echo "Execution error?"
exit $exitValue 
fi

cd ${root}