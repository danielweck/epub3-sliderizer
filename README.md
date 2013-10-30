epub3-sliderizer
================

A simple utility to easily create __EPUB 3__ / __HTML 5__ slidedecks: just one output fileset &#8658; dual support for e-book readers and web browsers. The input format is a single text file that uses a basic line-by-line syntax (no XML). Markdown and tag-soup HTML are supported (they get "massaged" into the required (X)HTML5 markup). Visual styles can be overridden using regular CSS.

[Follow this link](http://danielweck.github.io/epub3-sliderizer "epub3-sliderizer homepage") to learn more about the tool (live demo).

**[Screenshots](#screenshots) below.**

Notice
----------------

**This is a spare-time project, originally developed for my own personal use.
Feel free to report issues and to request features / enhancements, but please bare in mind that I cannot promise you a timely response, let alone provide ETA information about milestones, releases, etc. (there is no project planning, I just code if / when my free time allows)**

Contributions are welcome: fork-away and submit pull requests!

License
----------------

At the moment the source code is available as-is, under the [WTFPL license](http://www.wtfpl.net/about).
In some not-too-distant future I might consider using a [less rude license](http://opensource.org/licenses).

Prerequisites
----------------

[Java](http://www.java.com).

(JDK to compile, JRE to execute)

The shell scripts have only ever been tested on Mac OSX, but I guess they should work on Linux as well.
Windows users: Cygwin is your best friend (until someone contributes MS-DOS bat scripts).

PS: this tool ships with [EPUB-Check 3.0.1](https://github.com/IDPF/epubcheck), which is used to validate the generated EPUB 3 fileset.

Features
----------------

EPUB3-Sliderizer is based on the promise of "__single file__ editing", but unlike other HTML slideshow frameworks, EPUB3-Sliderizer generates each slide as a separate XHTML file. This way, the files can be used as "pages" in the context of a __pre-paginated e-book__ (aka "fixed layout"). Furthermore, the actual content can be authored with __Markdown__, using __tag-soup HTML__, or with __clean XHTML__. Your choice.

In an EPUB book created by EPUB3-Sliderizer, each HTML file is capable of "self-rendering" within a web browser (using its own __built-in navigation user interface__, or "chrome"), delivering a rich "slide deck" viewing experience on both __mobile / touch__ devices and __keyboard__-driven desktops. Just unzip the EPUB file on the local filesystem, and optionally upload to an HTTP server. The EPUB file itself can be used not only for archiving, but also to offer a "book-like", more static reading experience.

EPUB3-Sliderizer supports a "__reflowable__" presentation mode, which makes slide decks __accessible__ to persons who suffer from visual deficiencies. For example, the font size can be increased within the rectangular boundaries of a given slide, creating vertical content overflow + __scrolling__. Alternatively, the visual constraints of a slide's frame can be deactivated entirely, resulting in __normal web page__ rendering (full horizontal stretch, vertical scroll as needed).

All of this is possible thanks to careful CSS and JavaScript engineering, thus why EPUB3-Sliderizer is a _framework_ (i.e. not just a _library_) which relies on a specific project structure. Converting arbitrary HTML web pages (or even PowerPoint / Keynote assets) to the EPUB3-Sliderizer format is possible for very simple, semantic content types (e.g. basic bullet points), but experience shows that authoring directly in the __'data.txt' master format__ leads to fewer headaches.

Wish List
----------------

* To author the `data.txt` master file by hand is okay for some, but it would be really nice if there was some kind of __editor__ user interface, such as a web page containing form fields and submit buttons.
* ...which leads to: __server-side__ execution. Currently EPUB3-Sliderizer relies heavily on local filesystem access, so things would need to be ported to binary blobs / database storage facility (or equivalent abstraction).
* "1-click" __style templates__ (with a few samples to try)
* Slide __navigation strip__ (horizontal scrolling list of thumbnails)
* __2-page spread__ in web browser view (to simulate e-book reading)
* Dancing ponies?

Quick Start
----------------

Command line:

* `git clone git@github.com:danielweck/epub3-sliderizer.git`
* `cd epub3-sliderizer`
* `./sliderize.sh`

By default, the `sliderize.sh` script behaves as if the `doc` parameter was passed, which results in building the "documentation" project located in `./_INPUT/doc/`.

The output fileset is _always_ generated in `./_OUTPUT/`. Beware, this folder gets **deleted** everytime the `sliderize.sh` command is executed!!

There is an additional demonstration project in `./_INPUT/demo1/`. To build it, simply pass the `demo1` parameter to the `sliderize.sh` command.

If all goes well, the `./_OUTPUT/content/` folder should then contain `EPUB3-Sliderizer.epub` (documentation), or `EPUB3-Sliderizer_demo1.epub` (additional demo). To check the results in your web-browser, open the `./_OUTPUT/content/EPUB3/epub/nav.xhtml` file (drag and drop, or double-click if the XHTML file association is supported on your system).

To test the generated HTML fileset on remote devices (e.g. an iPad connected wirelessly on the same sub-network), you can start a local HTTP server on port 3000 by typing this command: `./thin.sh` (this should automatically open a local web-browser page). Note: this requires a [Ruby](https://www.ruby-lang.org) runtime. Obviously, you can serve the static XHTML files any other way you want (e.g. DropBox).

Make Your Own
----------------

* `cd _INPUT`
* `mkdir test`
* `cd test`
* edit `data.txt`
* place media assets inside the `test` folder (or subfolders), i.e. images, audio, etc.
* `cd ..`
* `./sliderize.sh test`

Learn by example by exploring the [documentation](https://github.com/danielweck/epub3-sliderizer/tree/master/_INPUT/doc) or the [demo](https://github.com/danielweck/epub3-sliderizer/tree/master/_INPUT/demo1).

Master Format Syntax
----------------

The `data.txt` master file is scanned line-by-line, and its syntax is pretty straight-forward:

### Line comments

```
// This is a comment
```

```
// Comment line 1
// Comment line 2
// --------------- handsome horizontal line :)
```

(note that at least one space after `//` is _required_)

### Fields

By convention: start with an underscore `_`, all upper case.

```
_FIELD-NAME

This is the field content.
```

```
_ANOTHER-FIELD-NAME

Content can
spread onto
several lines.
```

(the list of supported fields is described below)

### Slide marker

```
-SLIDE
```

This announces a new slide. Any content below this line "belongs" to the slide, until a new slide marker is encountered once again.

### Global slideshow fields

Any content before the _very first_ slide marker (i.e. at the top of `data.txt`) pertains to the slideshow as a whole.
Here is a list of supported fields:

```
_TITLE

[REQUIRED]
```

```
_SUBTITLE

[OPTIONAL]
```

```
_IDENTIFIER

[REQUIRED]
(note: default for 'dc:identifier' is "DEFAULT-UID")
```


```
_CREATOR

[REQUIRED]
(person or organisation name)
```


```
_SUMMARY
_DESCRIPTION
_SUBJECT
_PUBLISHER
_LICENSE
_RIGHTS

[OPTIONAL]
(misc. EPUB metadata)
```


```
_PAGE_DIR

[OPTIONAL]
(default is 'ltr', i.e. "left to right")
```


```
_LANGUAGE

[OPTIONAL]
(default is 'en-US')
```



```
_FILE_EPUB

[REQUIRED]
(filename for the EPUB link, e.g. 'EPUB3-Sliderizer_MySlideShow.epub')
```



```
_TOUCHICON

[OPTIONAL]
(relative filepath to the "touch icon", which is used when bookmarking on mobile devices)
```

```
_FAVICON

[OPTIONAL]
(relative filepath to the "favicon", which is used in the web browser address bar)
```

```
_LOGO

[OPTIONAL]
(relative filepath to an image, which gets rendered on every slide depending on CSS rules))
```

```
_COVER

[OPTIONAL]
(relative filepath to the cover image, which gets displayed in an e-reader "library" (e-book thumbnail))
```

```
_BACKGROUND_IMG

[OPTIONAL]
(relative filepath for a centered image background that applies to every slide (unless overridden on a per-slide basis)
```

```
_BACKGROUND_IMG_SIZE

[OPTIONAL]
(CSS background-size property value: auto (original size), cover (ratio preserved, meet-crop), contain (ratio preserved, fit-within), 100% 100% (ratio ignored, stretch))
```

```
_INCREMENTALS

[OPTIONAL]
(boolean value ('TRUE'/'FALSE' or '1'/'0' or 'YES'/'NO') or 'auto': specifies if the HTML list items ('li' in 'ol' or 'ul') should be incrementable (default is 'NO', 'YES' means "manual", and 'auto' means "automatic progression"). Can be overridden on a per-slide basis).
```


```
_JS_SCRIPT

[OPTIONAL]
(regular Javascript, which gets inserted into the HTML 'head' of every slide)
```

```
_CSS_STYLE

[OPTIONAL]
(regular CSS, which gets inserted into the HTML 'head' of every slide)
```

```
_FILES_CSS

[OPTIONAL]
(list of relative paths for CSS files that get referenced from the HTML 'head' of every slide)
```

```
_FILES_JS

[OPTIONAL]
(list of relative paths for JavaScript files that get referenced from the HTML 'head' of every slide)
```

```
_FILES_IMG

[OPTIONAL]
(list of relative paths for image files that are referenced from the authored HTML content. This is usually not needed as the HTML markup is parsed and images are normally found)
```

```
_FILES_FONT

[OPTIONAL]
(list of relative filepaths for fonts that are used in '@font-face', to address cross-domain issues)
```

```
_FILES_CSS_FONTS

[OPTIONAL]
(list of relative paths for CSS files that are used to declare '@font-face')
```


```
_MO_NARRATOR

[OPTIONAL]
(The person who speaks in the audio Media Overlays)
```

```
_MO_DUR

[OPTIONAL]
(SMIL timestamp "clock value", e.g. '00:00:10.094')
```

```
_MO_AUDIO_FILES

[OPTIONAL]
(list of relative paths for audio files that are used in Media Overlays)
```

```
_MO_ACTIVE

[OPTIONAL]
(Media Overlays "media:active" CSS class, e.g. '-epub-media-overlay-active')
```

```
_MO_PLAYBACK_ACTIVE

[OPTIONAL]
(Media Overlays "media:playback-active" CSS class, e.g. '-epub-media-overlay-playing')
```

```
_VIEWPORT_WIDTH
_VIEWPORT_HEIGHT

[OPTIONAL]
(integer pixel values...normally you do not need to change the defaults, which is 1290 x 1000)
```


```
_NOTES

[OPTIONAL]
(general notes, typically invisible at presentation time, but generated in the HTML markup nonetheless)
```

### Individual slide fields


```
_TITLE

[REQUIRED]
```

```
_SUBTITLE

[OPTIONAL]
```

```
_CONTENT

[REQUIRED]
(Markdown, tag-soup HTML, or XHTML (in which case the first line should be 'NO-MARKDOWN' to avoid conversion issues!))
```

```
_CONTENT_MIDDLE

[OPTIONAL]
(boolean value ('TRUE'/'FALSE' or '1'/'0' or 'YES'/'NO'): specifies if the slide content should be centred vertically)
```

```
_INCREMENTALS

[OPTIONAL]
(boolean value ('TRUE'/'FALSE' or '1'/'0' or 'YES'/'NO') or 'auto': specifies if the HTML list items ('li' in 'ol' or 'ul') should be incrementable (default is 'NO', 'YES' means "manual", and 'auto' means "automatic progression"). Can override the global setting).
```

```
_BACKGROUND_IMG

[OPTIONAL]
(relative filepath for a centered image background that applies to the slide, may override the global setting)
```

```
_BACKGROUND_IMG_SIZE

[OPTIONAL]
(CSS background-size property value: auto (original size), cover (ratio preserved, cropped), contain (ratio preserved, fit), 100% 100% (stretch, ignores ratio))
```

```
_JS_SCRIPT

[OPTIONAL]
(regular Javascript, which gets inserted into the HTML 'head' of the slide)
```

```
_CSS_STYLE

[OPTIONAL]
(regular CSS, which gets inserted into the HTML 'head' of the slide)
```

```
_FILES_CSS

[OPTIONAL]
(list of relative paths for CSS files that get referenced from the HTML 'head' of the slide)
```

```
_FILES_JS

[OPTIONAL]
(list of relative paths for JavaScript files that get referenced from the HTML 'head' of the slide)
```

```
_FILES_IMG

[OPTIONAL]
(list of relative paths for image files that are referenced from the authored HTML content. This is usually not needed as the HTML markup is parsed and images are normally found)
```

```
_FILES_FONT

[OPTIONAL]
(list of relative filepaths for fonts that are used in '@font-face', to address cross-domain issues)
```

```
_FILES_CSS_FONTS

[OPTIONAL]
(list of relative paths for CSS files that are used to declare '@font-face')
```

```
_MO_DUR

[OPTIONAL]
(SMIL timestamp "clock value", e.g. '00:00:10.094')
```

```
_MO_SMIL

[OPTIONAL]
(abbreviated pseudo-SMIL syntax, see example below)

AUDIO audio.mp3

TXT #txt1
BEGIN 03:100
END 04.855

TXT #txt2
END 11.307
```


```
_NOTES

[OPTIONAL]
(per-slide notes, linked from the slide, but typically invisible at presentation time)
```


Screenshots
----------------

### iBooks (iPad)

![iBooks iPad](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_iBooks.png)

### iBooks (Mac OS X)

![iBooksX](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_iBooksX.png)

### Readium (Chrome Extension)

![Readium Chrome Extension](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_ReadiumChrome.png)

### Web Browser

![Web Browser](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_Browser.png)

### Readium-SDK (OSX "Launcher App")

![Readium SDK OSX Launcher App](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_ReadiumOSX.png)

### Readium.js

![Readium JS](http://danielweck.github.io/epub3-sliderizer/EPUB3-Sliderizer_ReadiumJS.png)

