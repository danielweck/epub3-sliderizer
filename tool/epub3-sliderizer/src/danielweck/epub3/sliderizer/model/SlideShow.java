package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URI;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;

public final class SlideShow extends Fielder {

	SlideShow() throws Exception {

		TimeZone timeZone = TimeZone.getTimeZone("UTC");
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
		dateFormat.setTimeZone(timeZone);
		DATE = dateFormat.format(new Date());

		// DATE = String.format("%tFT%<tRZ", new Date());
	}

	private String baseFolderPath = null;

	public String getBaseFolderPath() {
		return baseFolderPath;
	}

	public SlideShow(String folderPath) throws Exception {

		this();
		baseFolderPath = folderPath;
	}

	public String DATE = null;

	public String TITLE = "DEFAULT TITLE";
	public String SUBTITLE = null;

	public String SUMMARY = "DEFAULT SUMMARY";
	public String DESCRIPTION = "DEFAULT DESCRIPTION";
	public String SUBJECT = "DEFAULT SUBJECT";

	public String CREATOR = "DEFAULT CREATOR";
	public String PUBLISHER = "DEFAULT PUBLISHER";

	public String IDENTIFIER = "DEFAULT-UID";

	public String LANGUAGE = "en-US";
	public String PAGE_DIR = "ltr";

	public String RIGHTS = "Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)";
	public String LICENSE = "http://creativecommons.org/licenses/by-sa/3.0/";

	public String VIEWPORT_WIDTH = "1024";
	public String VIEWPORT_HEIGHT = "768";

	public String FAVICON = "favicon.ico";

	public String LOGO = null;
	
	public String COVER = null;

	public String FILES_CSS = null;
	public String FILES_JS = null;

	public String CSS_STYLE = null;
	public String JS_SCRIPT = null;

	public String NOTES = null;

	public final ArrayList<Slide> slides = new ArrayList<Slide>();

	public void toString(Appendable appendable) throws Exception {

		appendable.append("***** SLIDESHOW");
		appendable.append('\n');

		super.toString(appendable);

		int i = 0;
		for (Slide slide : slides) {
			appendable.append('\n');

			i++;
			slide.toString(appendable, i);
		}
	}

	protected boolean parseSpecial(String line, BufferedReader bufferedReader,
			int verbosity) throws Exception {

		boolean isSlideMarker = line.equals(Slide.SLIDE_MARKER);
		while (isSlideMarker) {

			Slide slide = Slide.parse(bufferedReader, verbosity);
			slides.add(slide);

			if ((isSlideMarker = bufferedReader.ready())) {
				continue;
			}

			return true;
		}

		return false;
	}

	public static SlideShow parse(String uriDataFile, int verbosity)
			throws Exception {

		URI uri = new URI(uriDataFile);
		if (!uri.getScheme().equalsIgnoreCase("file")) {
			throw new MalformedURLException(uriDataFile);
		}

		File file = new File(uri);
		if (!file.exists()) {
			throw new FileNotFoundException(uriDataFile);
		}

		if (verbosity > 0) {
			System.out.println(" ");
			System.out.println(">>>>> PARSING: " + file.getAbsolutePath());
		}

		SlideShow slideShow = new SlideShow(file.getParent());

		BufferedReader bufferedReader = null;
		try {
			bufferedReader = new BufferedReader(new FileReader(file));
			parseFields(slideShow, bufferedReader, verbosity);
		} finally {
			if (bufferedReader != null) {
				bufferedReader.close();
			}
		}

		if (verbosity > 0) {
			System.out.println(" ");
			System.out.println(">>>>> PARSED:");
			System.out.println(slideShow.toString());
		}

		return slideShow;
	}

	private static void repeatChar(char c, int n, Writer out) throws Exception {
		for (int i = 0; i < n; i++) {
			out.write(c);
		}
	}

	private void createSampleTemplate_Fields(Map<String, String> fields,
			Writer writer, int verbosity) throws Exception {
		for (Map.Entry<String, String> field : fields.entrySet()) {
			String fieldName = field.getKey();
			String defaultFieldValue = field.getValue();

			writer.write(Fielder.FIELD_PREFIX);
			writer.write(fieldName);
			writer.write('\n');
			writer.write(Fielder.COMMENT_PREFIX);
			// writer.write('(');
			if (defaultFieldValue == null) {
				writer.write("NULL");
			} else if (defaultFieldValue.indexOf('\n') < 0) {
				writer.write(defaultFieldValue);
			} else {
				String[] lines = defaultFieldValue.split("\n");
				writer.write(lines[0]);
				if (lines.length > 1) {
					for (int i = 1; i < lines.length; i++) {
						writer.write('\n');
						writer.write(Fielder.COMMENT_PREFIX);
						writer.write(lines[i]);
					}
				}
			}
			// writer.write(')');
			writer.write('\n');
			writer.write('\n');

			writer.flush();
		}
	}

	public void createSampleTemplate(Writer writer, int verbosity)
			throws Exception {

		if (verbosity > 0) {
			System.out.println(" ");
			System.out.println(">>>>> SAMPLE TEMPLATE: ");
		}

		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		String str = "This is a sample template slideshow data file";
		writer.write(str);
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		writer.write("Format:");
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar(' ', 4, writer);
		writer.write("_FIELD_NAME");
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar(' ', 4, writer);
		writer.write(Fielder.COMMENT_PREFIX);
		writer.write("DEFAULT VALUE");
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar(' ', 4, writer);
		writer.write("[OVERRIDE BELOW WITH YOUR OWN VALUE]");
		writer.write('\n');
		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar(' ', 4, writer);
		writer.write("[...WHICH CAN BE MULTILINE]");
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar('-', str.length(), writer);
		writer.write('\n');

		writer.write('\n');

		Map<String, String> fields = getFields();
		createSampleTemplate_Fields(fields, writer, verbosity);

		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		str = "Slide #1 example";
		writer.write(str);
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar('-', str.length(), writer);
		writer.write('\n');

		writer.write('\n');

		writer.write(Slide.SLIDE_MARKER);
		writer.write('\n');
		writer.write('\n');

		Slide slide = slides.isEmpty() ? new Slide() : slides.get(0);
		fields = slide.getFields();
		createSampleTemplate_Fields(fields, writer, verbosity);

		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		str = "Slide #2 example";
		writer.write(str);
		writer.write('\n');

		writer.write(Fielder.COMMENT_PREFIX);
		repeatChar('-', str.length(), writer);
		writer.write('\n');

		writer.write('\n');

		writer.write(Slide.SLIDE_MARKER);
		writer.write('\n');
		writer.write('\n');

		writer.flush();

		createSampleTemplate_Fields(fields, writer, verbosity);

		writer.write('\n');

		writer.flush();
	}
}
