package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;
import java.util.ArrayList;

import danielweck.epub3.sliderizer.Epub3FileSet;
import danielweck.epub3.sliderizer.NavDoc;
import danielweck.epub3.sliderizer.XHTML;

public final class Slide extends Fielder {

	public Slide() throws Exception {
	}

	public SlideShow slideShow;

	public Slide(SlideShow ss) throws Exception {
		this();
		slideShow = ss;
	}

	public int SLIDE_NUMBER() {
		return slideShow.slides.indexOf(this) + 1;
	}

	public String SLIDE_FILENAME() {
		return XHTML.getFileName(SLIDE_NUMBER());
	}

	public String SLIDE_FILENAME_NOTES() {
		return XHTML.getFileName_Notes(SLIDE_NUMBER());
	}

	public String PREV_SLIDE_FILENAME() {
		String prev = "../" + NavDoc.getFileName();
		int i = SLIDE_NUMBER();
		if (i > 1) {
			prev = XHTML.getFileName(i - 1);
		}
		return prev;
	}

	public String NEXT_SLIDE_FILENAME() {
		int i = SLIDE_NUMBER();
		if (i < slideShow.slides.size()) {
			return XHTML.getFileName(i + 1);
		}
		return null;
	}

	public boolean containsSVG = false;
	public boolean containsMATHML = false;

	public String TITLE = "DEFAULT TITLE";
	public String SUBTITLE = null;

	public String CONTENT = "<p style=\"text-align: center;\">\n<br/>\n</p>";
	public static String FIELD_CONTENT = "CONTENT";

	public String CONTENT_XHTML() throws Exception {

		if (CONTENT == null) {
			return null;
		}

		return XHTML.massage(CONTENT, slideShow, this,
				slideShow.pathEpubFolder, -1);
	}

	public String CONTENT_MIDDLE = "FALSE";

	public boolean CONTENT_MIDDLE_ALIGN() {
		return CONTENT_MIDDLE.equalsIgnoreCase("TRUE")
				|| CONTENT_MIDDLE.equalsIgnoreCase("YES")
				|| CONTENT_MIDDLE.equalsIgnoreCase("1");
	}

	public String FILES_IMG = null;

	public String BACKGROUND_IMG = null;
	public String BACKGROUND_IMG_SIZE = "100%"; // auto, contain, cover, 100%

	public String MO_DUR = null;
	public String MO_SMIL = null;

	public String FILES_CSS = null;

	private ArrayList<String> _xCSSs = null;

	public ArrayList<String> xCSSs() {

		if (FILES_CSS == null) {
			return null;
		}
		if (_xCSSs != null) {
			return _xCSSs;
		}

		ArrayList<String> slideShowCSSs = slideShow.xCSSs();
		if (slideShowCSSs == null) {
			slideShowCSSs = new ArrayList<String>(0);
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(FILES_CSS);

		_xCSSs = new ArrayList<String>(array.size());

		for (String path : array) {

			if (_xCSSs.contains(path) || slideShowCSSs.contains(path)) {
				continue;
			}
			_xCSSs.add(path);
		}

		if (_xCSSs.size() == 0) {
			_xCSSs = null;
		}
		return _xCSSs;
	}

	public String FILES_JS = null;

	private ArrayList<String> _xJSs = null;

	public ArrayList<String> xJSs() {

		if (FILES_JS == null) {
			return null;
		}
		if (_xJSs != null) {
			return _xJSs;
		}

		ArrayList<String> slideShowJSs = slideShow.xJSs();
		if (slideShowJSs == null) {
			slideShowJSs = new ArrayList<String>(0);
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(FILES_JS);

		_xJSs = new ArrayList<String>(array.size());

		for (String path : array) {

			if (_xJSs.contains(path) || slideShowJSs.contains(path)) {
				continue;
			}
			_xJSs.add(path);
		}

		if (_xJSs.size() == 0) {
			_xJSs = null;
		}
		return _xJSs;
	}

	public String CSS_STYLE = null;

	public String CSS_STYLING() throws Exception {
		return Epub3FileSet.processCssStyle(slideShow, CSS_STYLE);
	}

	public String JS_SCRIPT = null;

	public String NOTES = null;

	public String NOTES_XHTML() throws Exception {

		if (NOTES == null) {
			return null;
		}

		return XHTML.massage(NOTES, slideShow, this, slideShow.pathEpubFolder,
				-1);
	}

	public void toString(Appendable appendable, int i) throws Exception {

		appendable.append("***** SLIDE " + i);
		appendable.append('\n');

		super.toString(appendable);
	}

	static final String SLIDE_MARKER = "-SLIDE";

	protected boolean parseSpecial(String line, BufferedReader bufferedReader,
			int verbosity) throws Exception {

		if (line.equals(SLIDE_MARKER)) {
			return true;
		}

		return false;
	}

	static Slide parse(SlideShow slideShow, BufferedReader bufferedReader,
			int verbosity) throws Exception {

		Slide slide = new Slide(slideShow);

		parseFields(slide, bufferedReader, verbosity);

		return slide;
	}
}