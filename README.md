epub3-sliderizer
================

Simple utility to easily create __EPUB 3__ / __HTML 5__ slidedecks (one output fileset, dual support for e-book readers and web browsers)

[Follow this link to learn more about the tool (live demo)](http://danielweck.github.io/epub3-sliderizer "epub3-sliderizer homepage").

Notice
----------------

**This is a spare-time project, originally developed for my own personal use.
Feel free to report issues or request features / enhancements.
Please bare in mind that I cannot promise a response.**

Contributions are welcome: fork-away and submit pull requests!

License
----------------

At the moment the source code is available as-is, under the [WTFPL license](http://www.wtfpl.net/about).
In some not-too-distant future I might consider using a [less rude license](http://opensource.org/licenses).

Prerequisites
----------------

Java.

(JDK to compile, JRE to execute)

The shell scripts have only ever been tested on Mac OSX, but I guess they should work on Linux as well.
Windows users: Cygwin is your best friend (until someone contributes MS-DOS bat scripts).

Quick Start
----------------

Command line:

* `git clone git@github.com:danielweck/epub3-sliderizer.git`
* `cd epub3-sliderizer`
* `./sliderize.sh`

By default, the `sliderize.sh` script behaves as if the `doc` parameter was passed, which results in building the "documentation" project located in `./_INPUT/__doc__/`.

The output fileset is _always_ generated in `./_OUTPUT/`. Beware, this folder gets **deleted** everytime the `sliderize.sh` command is executed!!

There is an additional demonstration project in `./_INPUT/__demo1__/`. To build it, simply pass the `demo1` parameter to the `sliderize.sh` command.

If all goes well, the `./_OUTPUT/content/` folder should then contain `EPUB3-Sliderizer.epub` (documentation), or `EPUB3-Sliderizer_demo1.epub` (additional demo). To check the results in your web-browser, open the `./_OUTPUT/content/EPUB3/epub/nav.xhtml` file (drag and drop, or double-click if the XHTML file association is supported on your system).

To test on remote devices (e.g. an iPad connected wirelessly on the same sub-network), you can start a local HTTP server on port 3000 by typing this command: `./thin.sh` (this should automatically open a local web-browser page). Note: this requires a [Ruby](https://www.ruby-lang.org) runtime. Obviously, you can serve the satic XHTML files any other way you want (e.g. DropBox).

Make Your Own
----------------

* `cd _INPUT`
* `mkdir **test**`
* `cd **test**`
* `touch data.txt` (naming convention for the master source file)
* edit `data.txt` (+ copy assets in the `test` folder, as needed)
* `cd ..`
* `./sliderize.sh **test**`

Learn by example by exploring the [documentation](https://github.com/danielweck/epub3-sliderizer/tree/master/_INPUT/doc) or the [demo](https://github.com/danielweck/epub3-sliderizer/tree/master/_INPUT/demo1).

User Manual, Authoring Guidelines
----------------

TODO...

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

