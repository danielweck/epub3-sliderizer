#!/bin/sh

root=$(pwd)

OUTPUT_FOLDER_NAME="_OUTPUT"

rm -r ./${OUTPUT_FOLDER_NAME}
mkdir ./${OUTPUT_FOLDER_NAME}
cp -r ./tool/readium ./${OUTPUT_FOLDER_NAME}/
mkdir ./${OUTPUT_FOLDER_NAME}/content
cp -r ./tool/EPUB3 ./${OUTPUT_FOLDER_NAME}/content/
mv ./${OUTPUT_FOLDER_NAME}/readium/index.html ./${OUTPUT_FOLDER_NAME}/content/

cd ./tool/epub3-sliderizer/

pwd

class="./bin/Main.class"

if [ -f ${class} ]; then

echo "Class found: ${class}"

else

echo "Compiling: ${class}"
javac -classpath ".:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar" ./src/Main.java -d ./bin/ -sourcepath "${root}/tool/epub3-sliderizer/src" #-verbose

fi

#exit


DATA="_INPUT/data.txt"
DATA_file="${root}/${DATA}"
DATA_url="file://${DATA_file}"

EPUB_FOLDER="${root}/${OUTPUT_FOLDER_NAME}/content/EPUB3/OPS"
#epub="${epub_folder}/EPUB3.epub"

echo "EPUB3-Slider in progress..."
echo ${DATA_file}
echo ${EPUB_FOLDER}

java -classpath "${root}/tool/epub3-sliderizer/bin/:${root}/tool/epub3-sliderizer/lib/jsoup-1.7.2.jar" Main ${DATA_url} ${EPUB_FOLDER} VERBOSE_max



#open ${EPUB_FOLDER}
#exit



cd ${root}

EPUB_FOLDER="${root}/${OUTPUT_FOLDER_NAME}/content/EPUB3/"

find "${EPUB_FOLDER}" -name ".DS_Store" -depth -exec rm {} \;

#for x in `find ./$@ -name ".DS_Store" -print`
#   do
#     rm -f $x
#   done

java -jar ./tool/epubcheck/epubcheck.jar "${EPUB_FOLDER}" -mode exp -save

open "${root}/${OUTPUT_FOLDER_NAME}/content/"