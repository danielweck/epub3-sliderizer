package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;

public final class Slide extends Fielder {

	public Slide() throws Exception {
	}

	public boolean containsSVG = false;
	public boolean containsMATHML = false;
	
	public String TITLE = "DEFAULT TITLE";
	public String SUBTITLE = null;

	public String CONTENT = "<p style=\"text-align: center;\">\nDEFAULT <br> CONTENT\n</p>";

	public String FILES_IMG = null;
	public String FILES_CSS = null;
	public String FILES_JS = null;

	public String CSS_STYLE = null;
	public String JS_SCRIPT = null;
	
	public String NOTES = null;
	
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

	static Slide parse(BufferedReader bufferedReader, int verbosity)
			throws Exception {

		Slide slide = new Slide();

		parseFields(slide, bufferedReader, verbosity);

		return slide;
	}
}