package danielweck.epub3.sliderizer.model;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URI;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;

import danielweck.epub3.sliderizer.Epub3FileSet;

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

	public String SUMMARY = null;
	public String DESCRIPTION = null;
	public String SUBJECT = null;

	public String CREATOR = Epub3FileSet.THIS;
	public String PUBLISHER = null;

	public String IDENTIFIER = "DEFAULT-UID";

	public String LANGUAGE = "en-US";
	public String PAGE_DIR = "ltr";

	public String RIGHTS = null;
	public String LICENSE = null;

	public String VIEWPORT_WIDTH = "1290";
	public String VIEWPORT_HEIGHT = "1000";

	public String FONT_SIZE = "40";

	public String FAVICON = "favicon.ico";

	public String LOGO = null;

	public String COVER = null;

	public String FILES_CSS = null;
	public String FILES_JS = null;

	public String CSS_STYLE = null;
	public String JS_SCRIPT = null;

	public String NOTES = null;

	public final ArrayList<Slide> slides = new ArrayList<Slide>();

	private ArrayList<String> allReferences_IMG = null;

	public ArrayList<String> getAllReferences_IMG() {

		if (allReferences_IMG == null) {
			allReferences_IMG = new ArrayList<String>();

			ArrayList<String> array = Epub3FileSet.splitPaths(this.LOGO);
			for (String str : array) {
				if (!allReferences_IMG.contains(str)) {
					allReferences_IMG.add(str);
				}
			}

			array = Epub3FileSet.splitPaths(this.COVER);
			for (String str : array) {
				if (!allReferences_IMG.contains(str)) {
					allReferences_IMG.add(str);
				}
			}

			for (Slide slide : slides) {
				array = Epub3FileSet.splitPaths(slide.FILES_IMG);
				for (String str : array) {
					if (!allReferences_IMG.contains(str)) {
						allReferences_IMG.add(str);
					}
				}
			}
		}

		return allReferences_IMG;
	}

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

	public boolean importedConverted = false;

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

		String ext = Epub3FileSet.getFileExtension(file.getAbsolutePath());
		if (ext.equalsIgnoreCase("opf")) {
			EPubImporter.parse(slideShow, file, verbosity);
		} else {
			BufferedReader bufferedReader = null;
			try {
				bufferedReader = new BufferedReader(new InputStreamReader(
						new FileInputStream(file), "UTF-8")
				// new FileReader(file)
				);
				parseFields(slideShow, bufferedReader, verbosity);
			} finally {
				if (bufferedReader != null) {
					bufferedReader.close();
				}
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
			} else {
				boolean first = true;
				ArrayList<String> array = Epub3FileSet
						.splitPaths(defaultFieldValue);
				for (String path : array) {

					if (!first) {
						writer.write('\n');
						writer.write(Fielder.COMMENT_PREFIX);
					}

					writer.write(path);
					first = false;
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
