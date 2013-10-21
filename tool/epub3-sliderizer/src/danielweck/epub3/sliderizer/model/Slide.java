package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;

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

	public boolean containsSVG = false;
	public boolean containsMATHML = false;

	public String TITLE = "DEFAULT TITLE";
	public String SUBTITLE = null;

	public String CONTENT = "<p style=\"text-align: center;\">\nDEFAULT <br> CONTENT\n</p>";
	public static String FIELD_CONTENT = "CONTENT";

	public String CONTENT_XHTML() throws Exception {

		if (CONTENT == null) {
			return null;
		}

		return XHTML.massage(CONTENT, slideShow, this,
				slideShow.pathEpubFolder, -1);
	}

	public String FILES_IMG = null;
	public String FILES_CSS = null;
	public String FILES_JS = null;

	public String CSS_STYLE = null;
	public String JS_SCRIPT = null;

	public String NOTES = null;

	public String NOTES_XHTML() throws Exception {

		if (NOTES == null) {
			return null;
		}

		return XHTML.massage(NOTES, slideShow, this, slideShow.pathEpubFolder,
				-1);
	}

	// String MO_AUDIO = null;
	// String MO_DURATION = null;
	// String MO_SMIL = null;

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