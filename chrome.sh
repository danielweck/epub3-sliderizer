#!/bin/sh

./make.sh

root=$(pwd)

OUTPUT_FOLDER_NAME="_OUTPUT"


NAV="file://"${root}"/"${OUTPUT_FOLDER_NAME}"/content/EPUB3/epub/nav.xhtml"
NAV=$(echo ${NAV} | sed 's/ /%20/g')
echo ${NAV}

INDEX="file://"${root}"/"${OUTPUT_FOLDER_NAME}"/content/index.html"
INDEX=$(echo ${INDEX} | sed 's/ /%20/g')
echo ${INDEX}




CHROME_APP=$(ls /Applications/ | grep Chrome | head -n 1)
#CHROME_APP='Google\\ Chrome\\ BETA.app'
echo ${CHROME_APP}

#CHROME_APP_PATH="'/Applications/"${CHROME_APP}"'"
#CHROME_APP_PATH="\"/Applications/"${CHROME_APP}"\""
CHROME_APP_PATH="/Applications/"${CHROME_APP}
#CHROME_APP_PATH=$(echo ${CHROME_APP_PATH} | sed 's/ /\\ /g')
echo ${CHROME_APP_PATH}

osascript -e "tell application \"${CHROME_APP}\"" -e "set chromewindows to every window" -e "repeat with chromewindow in chromewindows" -e "set windowtabs to every tab of chromewindow" -e "repeat with windowtab in windowtabs" -e "tell windowtab" -e "delete" -e "end tell" -e "end repeat" -e "end repeat" -e "end tell"

osascript -e "tell application \"${CHROME_APP}\" to activate"

osascript -e "delay 2" -e "tell application \"${CHROME_APP}\"" -e "tell application \"System Events\"" -e "keystroke \"q\" using {command down}" -e "end tell" -e "end tell" -e "delay 2" 

function activateStuff(){
osascript -e "tell application \"${CHROME_APP}\" to activate"

osascript -e "delay 2" -e "tell application \"${CHROME_APP}\"" -e "tell application \"System Events\"" -e "keystroke \"j\" using {command down, option down}" -e "end tell" -e "end tell"
#-e "tell process \"Google Chrome\"" -e "click menu item \"JavaScript Console\" of menu 1 of menu item \"Developer\" of menu 1 of menu bar item \"View\" of menu bar 1" -e "end tell" -e "end tell" -e "end tell"

#osascript -e "tell application \"${CHROME_APP}\" to tell the active tab of its first window" -e "reload" -e "end tell"

#osascript -e "do shell script \'${CHROME_APP_COMMAND}\'"
}

open -a "${CHROME_APP_PATH}" --args --disable-application-cache --disable-web-security -–allow-file-access-from-files --incognito ${NAV}

activateStuff

osascript -e "tell application \"${CHROME_APP}\"" -e "set myTab to make new tab at end of tabs of window 1" -e "set URL of myTab to \"${INDEX}\"" -e "end tell"

activateStuff

