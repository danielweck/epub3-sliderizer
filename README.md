epub3-sliderizer
================

A simple utility to easily create __EPUB 3__ / __HTML 5__ slidedecks: just one output fileset &#8658; dual support for e-book readers and web browsers. The input format is a single text file that uses a basic line-by-line syntax (no XML). Markdown and tag-soup HTML are supported (they get "massaged" into the required (X)HTML5 markup). Visual styles can be overridden using regular CSS.

[Follow this link](http://danielweck.github.io/epub3-sliderizer "epub3-sliderizer homepage") to learn more about the tool (live demo).

**[Screenshots](#screenshots) below.**

Notice
----------------

**This is a spare-time project, originally developed for my own personal use.
Feel free to report issues and to request features / enhancements, but please bare in mind that I cannot promise you a timely response, let alone provide ETA information about milestones, releases, etc.**

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

`data.txt` Syntax
----------------

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

```
_FIELD-NAME

This is the field content.

_ANOTHER-FIELD-NAME

Content can
spread onto
several lines.
```

(a list of supported field names is detailed below)

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
```
(default `dc:identifier` is "DEFAULT-UID"!)


```
_CREATOR

[REQUIRED]
```
(your name, or an organisation's name)


```
_SUMMARY
_DESCRIPTION
_SUBJECT
_PUBLISHER
_LICENSE
_RIGHTS

[OPTIONAL]
```
(various EPUB metadata)

```
\_PAGE_DIR

[OPTIONAL]
```
(default is `ltr`, that is to say "left to right")


```
_LANGUAGE

[OPTIONAL]
```
(default is `en-US`)



```
\_FILE_EPUB

[REQUIRED]
```
(filename of the corresponding EPUB file to link to, e.g. `EPUB3-Sliderizer_demo1.epub`)


```
_TOUCHICON

[OPTIONAL]
```
(relative filepath to your chosen "touch icon", used when bookmarking on mobile devices)


```
_FAVICON

[OPTIONAL]
```
(relative filepath to your chosen "favicon", used in web browsers' address bar)

```
_LOGO

[OPTIONAL]
```
(relative filepath to your chosen logo, which gets rendered on every slide (unless overridden by CSS `display` rules))


```
_COVER

[OPTIONAL]
```
(relative filepath to your chosen cover image, which gets displayed in e-readers libraries (e-book thumbnails))

```
\_BACKGROUND_IMG

[OPTIONAL]
```
(relative filepath for a centered image background that applies to every slide (unless overridden on a per-slide basis)

```
\_BACKGROUND_IMG_SIZE

[OPTIONAL]
```
(CSS background-size property value: auto (original size), cover (ratio preserved, cropped), contain (ratio preserved, fit), 100% 100% (stretch, ignores ratio))

```
_INCREMENTALS

[OPTIONAL]
```
(boolean value (`TRUE`/`FALSE` or `1`/`0` or `YES`/`NO`) or `auto`: specifies if the HTML list items (`li` in `ol` or `ul`) should be incrementable (default is `NO`, `YES` means "manual", and `auto` means "automatic progression"). Can be overridden on a per-slide basis).


```
\_JS_SCRIPT

[OPTIONAL]
```
(regular Javascript, which is inserted into the HTML `head` of every slide)


```
\_CSS_STYLE

[OPTIONAL]
```
(regular CSS, which is inserted into the HTML `head` of every slide)


```
\_FILES_CSS

[OPTIONAL]
```
(list of relative paths for CSS files that get referenced from the HTML `head` of every slide)

```
\_FILES_JS

[OPTIONAL]
```
(list of relative paths for JavaScript files that get referenced from the HTML `head` of every slide)

```
\_FILES_IMG

[OPTIONAL]
```
(list of relative paths for image files that get referenced from the HTML content. This is usually not needed as the HTML markup gets analysed and images are automatically found)

```
\_FILES_FONT

[OPTIONAL]
```
(list of relative filepaths for fonts that are used in `@font-face`)

```
\_FILES_CSS_FONTS

[OPTIONAL]
```
(list of relative paths for CSS files that are used to declare `@font-face`)



```
\_MO_NARRATOR

[OPTIONAL]
```

```
\_MO_DUR

[OPTIONAL]
```
(SMIL timestamp "clock value", e.g. `00:00:10.094`)

```
\_MO_AUDIO_FILES

[OPTIONAL]
```
(list of relative paths for audio files that are used in Media Overlays)

```
\_MO_ACTIVE

[OPTIONAL]
```
(Media Overlays CSS class, e.g. `-epub-media-overlay-active`)

```
\_MO_PLAYBACK_ACTIVE

[OPTIONAL]
```
(Media Overlays CSS class, e.g. `-epub-media-overlay-playing`)


```
\_VIEWPORT_WIDTH
\_VIEWPORT_HEIGHT

[OPTIONAL]
```
(int pixel values...normally you do not need to change the defaults, which are 1290x1000)


```
_NOTES

[OPTIONAL]
```
(general notes, typically invisible at presentation time, but contained in the generated fileset nonetheless)


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
```
(Markdown, tag-soup HTML, or XHTML (in which case the first line should be `NO-MARKDOWN` to avoid conversion issues))


```
\_CONTENT_MIDDLE

[OPTIONAL]
```
(boolean value (`TRUE`/`FALSE` or `1`/`0` or `YES`/`NO`): specifies if the slide content should be centred vertically)

```
_INCREMENTALS

[OPTIONAL]
```
(boolean value (`TRUE`/`FALSE` or `1`/`0` or `YES`/`NO`) or `auto`: specifies if the HTML list items (`li` in `ol` or `ul`) should be incrementable (default is `NO`, `YES` means "manual", and `auto` means "automatic progression"). Can override the global setting).


```
\_BACKGROUND_IMG

[OPTIONAL]
```
(relative filepath for a centered image background that applies to the slide, may override the global setting)

```
\_BACKGROUND_IMG_SIZE

[OPTIONAL]
```
(CSS background-size property value: auto (original size), cover (ratio preserved, cropped), contain (ratio preserved, fit), 100% 100% (stretch, ignores ratio))


```
\_JS_SCRIPT

[OPTIONAL]
```
(regular Javascript, which is inserted into the HTML `head` of the slide)


```
\_CSS_STYLE

[OPTIONAL]
```
(regular CSS, which is inserted into the HTML `head` of the slide)


```
\_FILES_CSS

[OPTIONAL]
```
(list of relative paths for CSS files that get referenced from the HTML `head` of the slide)

```
\_FILES_JS

[OPTIONAL]
```
(list of relative paths for JavaScript files that get referenced from the HTML `head` of the slide)

```
\_FILES_IMG

[OPTIONAL]
```
(list of relative paths for image files that get referenced from the HTML content. This is usually not needed as the HTML markup gets analysed and images are automatically found)


```
\_FILES_FONT

[OPTIONAL]
```
(list of relative filepaths for fonts that are used in `@font-face`)

```
\_FILES_CSS_FONTS

[OPTIONAL]
```
(list of relative paths for CSS files that are used to declare `@font-face`)


```
\_MO_DUR

[OPTIONAL]
```
(SMIL timestamp "clock value", e.g. `00:00:10.094`)


```
\_MO_SMIL

[OPTIONAL]
```
(abbreviated pseudo-SMIL syntax, see example below)

```
\_MO_SMIL

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
```
(per-slide notes, linked from the slide, but typically invisible at presentation time)



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

