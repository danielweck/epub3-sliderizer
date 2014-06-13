package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;
import java.io.File;
import java.util.ArrayList;
import java.util.Map;
import java.util.Stack;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.common.base.Function;

import danielweck.epub3.sliderizer.Epub3FileSet;
import danielweck.epub3.sliderizer.NavDoc;
import danielweck.epub3.sliderizer.XHTML;

public final class Slide extends Fielder {

	public Slide() throws Exception {
	}

	public SlideShow slideShow;

	public final static Function<String, String> viewportOverrideCss = XHTML.viewportOverrideCss;

	public Slide(SlideShow ss) throws Exception {
		this();
		slideShow = ss;
	}

	public boolean NOT_FIRST() {
		return SLIDE_NUMBER() > 1;
	}

	public boolean NOT_LAST() {
		return SLIDE_NUMBER() < slideShow.slides.size();
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

	public ArrayList<String> remoteResources = null;

	public boolean containsRemoteResources() {
		if (remoteResources == null) {
			remoteResources = new ArrayList<String>();

			String regexp = "src\\s*=\\s*\"\\s*(https?[^\"]+)\\s*\"";

			Pattern pattern = Pattern.compile(regexp);
			Matcher matcher = pattern.matcher(this.CONTENT);
			while (matcher.find()) {
				for (int i = 1; i <= matcher.groupCount(); i++) {
					String src = matcher.group(i);

					if (!src.startsWith("http")) {
						throw new RuntimeException(src);
					}

					remoteResources.add(src);
				}
			}
		}

		return remoteResources.size() > 0;
	}

	public String VIEWPORT_WIDTH = null;
	public String VIEWPORT_HEIGHT = null;
	//
	// public String FONT_SIZE_UI = null;
	//
	public String TITLE = "DEFAULT TITLE";
	public String SUBTITLE = null;

	public String CONTENT = "<p style=\"text-align: center;\">\n<br/>\n</p>";
	public static String FIELD_CONTENT = "CONTENT";

	// TODO: MASSIIIIVE HACK!! :(
	private int _verbosity = -1;

	public String CONTENT_XHTML() throws Exception {

		if (CONTENT == null) {
			return null;
		}

		return XHTML.massage(CONTENT, slideShow, this,
				slideShow.pathEpubFolder, _verbosity);
	}

	public String CONTENT_MIDDLE = "FALSE";

	public boolean CONTENT_MIDDLE_ALIGN() {
		return CONTENT_MIDDLE.equalsIgnoreCase("TRUE")
				|| CONTENT_MIDDLE.equalsIgnoreCase("YES")
				|| CONTENT_MIDDLE.equalsIgnoreCase("1");
	}

	public boolean AUTHORize() throws Exception {
		return CONTENT != null && CONTENT.indexOf(XHTML.MARKDOWN_SRC) != 0
				&& (_verbosity >= 3 || CONTENT.indexOf(XHTML.MARKDOWN) == 0);
	}

	public String CONTENT_ORIGINAL() throws Exception {

		if (CONTENT == null) {
			return null;
		}
		String content = CONTENT;
		// if (content.indexOf(XHTML.MARKDOWN_SRC) == 0) {
		// content = content.substring(XHTML.MARKDOWN_SRC.length());
		// } else
		if (content.indexOf(XHTML.MARKDOWN) == 0) {
			content = content.substring(XHTML.MARKDOWN.length());
		}
		// else if (content.indexOf(XHTML.NOMARKDOWN) == 0) {
		// content = content.substring(XHTML.NOMARKDOWN.length());
		// }
		return content.replace("&", "&amp;").replace("<", "&lt;")
				.replace(">", "&gt;").trim();
	}

	public boolean AUTHORize_NOTES() {
		return NOTES != null && NOTES.indexOf(XHTML.MARKDOWN_SRC) != 0
				&& (_verbosity >= 3 || NOTES.indexOf(XHTML.MARKDOWN) == 0);
	}

	public String NOTES_ORIGINAL() throws Exception {

		if (NOTES == null) {
			return null;
		}
		String content = NOTES;
		// if (content.indexOf(XHTML.MARKDOWN_SRC) == 0) {
		// content = content.substring(XHTML.MARKDOWN_SRC.length());
		// } else
		if (content.indexOf(XHTML.MARKDOWN) == 0) {
			content = content.substring(XHTML.MARKDOWN.length());
		}
		// else if (content.indexOf(XHTML.NOMARKDOWN) == 0) {
		// content = content.substring(XHTML.NOMARKDOWN.length());
		// }
		return content.replace("&", "&amp;").replace("<", "&lt;")
				.replace(">", "&gt;").trim();
	}

	public String INCREMENTALS = null;

	public boolean incrementalsNO() {
		if (INCREMENTALS == null) {
			return false;
		}
		return INCREMENTALS.equalsIgnoreCase("FALSE")
				|| INCREMENTALS.equalsIgnoreCase("NO")
				|| INCREMENTALS.equalsIgnoreCase("0");
	}

	public boolean incrementalsManual() {
		if (INCREMENTALS == null) {
			return false;
		}
		return INCREMENTALS.equalsIgnoreCase("TRUE")
				|| INCREMENTALS.equalsIgnoreCase("YES")
				|| INCREMENTALS.equalsIgnoreCase("1");
	}

	public boolean incrementalsAuto() {
		if (INCREMENTALS == null) {
			return false;
		}
		return INCREMENTALS.equalsIgnoreCase("AUTO");
	}

	public String FILES_IMG = null;

	public String BACKGROUND_AUDIO = null;

	public String BACKGROUND_IMG = null;
	public String BACKGROUND_IMG_SIZE = "contain"; // auto, contain, cover, 100%
													// 100%

	public String MO_DUR = null;
	public String MO_SMIL = null;

	public String FILES_FONT = null;

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

	public String FILES_CSS_FONTS = null;

	private ArrayList<String> _xCSSs_FONTS = null;

	public ArrayList<String> xCSSs_FONTS() {

		if (FILES_CSS_FONTS == null) {
			return null;
		}
		if (_xCSSs_FONTS != null) {
			return _xCSSs_FONTS;
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(FILES_CSS_FONTS);

		_xCSSs_FONTS = new ArrayList<String>(array.size());

		for (String path : array) {

			if (_xCSSs_FONTS.contains(path)) {
				continue;
			}
			_xCSSs_FONTS.add(path);
		}

		if (_xCSSs_FONTS.size() == 0) {
			_xCSSs_FONTS = null;
		}
		return _xCSSs_FONTS;
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
	public static String FIELD_CSS_STYLE = "CSS_STYLE";

	public String CSS_STYLING() throws Exception {
		return Epub3FileSet.processCssStyle(slideShow, this, CSS_STYLE);
	}

	public String JS_SCRIPT = null;
	public static String FIELD_JS_SCRIPT = "JS_SCRIPT";

	public String NOTES = null;
	public static String FIELD_NOTES = "NOTES";

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

	protected boolean parseSpecial(File file, String line,
			Stack<BufferedReader> bufferedReaders,
			Map<BufferedReader, String> mapBufferedReaderLine, int verbosity)
			throws Exception {

		// HACK!
		_verbosity = verbosity;

		if (line.equals(SLIDE_MARKER)) {
			return true;
		}

		return false;
	}

	static Slide parse(File file, SlideShow slideShow,
			Stack<BufferedReader> bufferedReaders,
			Map<BufferedReader, String> mapBufferedReaderLine, int verbosity)
			throws Exception {

		Slide slide = new Slide(slideShow);

		// HACK!
		slide._verbosity = verbosity;

		parseFields(file, slide, bufferedReaders, mapBufferedReaderLine,
				verbosity);

		return slide;
	}
}