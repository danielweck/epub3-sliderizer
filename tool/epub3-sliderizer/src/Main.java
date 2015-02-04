import java.io.PrintStream;
import java.io.PrintWriter;

import danielweck.epub3.sliderizer.Epub3FileSet;
import danielweck.epub3.sliderizer.model.SlideShow;

public final class Main {

	public static void main(String[] args) throws Exception {

		if (args.length < 2) {
			System.err
					.println("Required arguments: [source data file URI], [destination EPUB folder path] (optional: [VERBOSE])");
			return;
		}

		int verbosity = 0;
		if (args.length > 2) {
			if (args[2].equalsIgnoreCase("VERBOSE_MIN")
					|| args[2].equalsIgnoreCase("VERBOSE")) {
				verbosity = 1;
			} else if (args[2].equalsIgnoreCase("VERBOSE_MEDIUM")) {
				verbosity = 2;
			} else if (args[2].equalsIgnoreCase("VERBOSE_MAX")) {
				verbosity = 3;
			}
		}

		String msg1 = "VERBOSITY: "
				+ (verbosity == 1 ? "MIN" : (verbosity == 2 ? "MEDIUM"
						: (verbosity == 3 ? "MAX" : "NO")));
		// String hr1 = repeatChar('-', msg1.length());
		// System.out.println(hr1);
		repeatChar('-', msg1.length(), System.out);
		System.out.print('\n');
		System.out.println(msg1);
		// System.out.println(hr1);
		repeatChar('-', msg1.length(), System.out);
		System.out.print('\n');

		if (verbosity >= 3) {
			System.out.print('\n');
			System.out
					.println(">>>>>> HTML5 MODE FOR CONTENT-EDITABLE (no XHTML file extension)");
			System.out.print('\n');
			Epub3FileSet.XHTML_EXT = ".html";
		}

		long timeNS = System.nanoTime(); // System.currentTimeMillis()
		try {
			String uriDataFile = args[0];
			
			// Workaround for Windows GitBash ... (yuk!)
			uriDataFile = uriDataFile.replaceAll("file:///c/", "file:///C:/");

			SlideShow slideShow = SlideShow.parse(uriDataFile, verbosity);

			if (args.length > 3) {
				if (args[3].equalsIgnoreCase("REFLOWABLE")) {
					slideShow.REFLOWABLE = "YES";
				}
			}

			if (verbosity > 2) {
				slideShow.createSampleTemplate(new PrintWriter(System.out),
						verbosity);
			}

			String pathEpubFolder = args[1];

			// TODO: yuck yuck yuck!!
			slideShow.pathEpubFolder = pathEpubFolder;

			Epub3FileSet.create(uriDataFile, slideShow, pathEpubFolder,
					verbosity);

		} catch (Exception ex) {
			throw ex;
		} finally {
			timeNS = System.nanoTime() - timeNS;
			long timeMS = Math.round(timeNS / 1000000.0);

			String msg2 = "TOTAL PROCESSING TIME: " + timeMS + "ms";
			// String hr2 = repeatChar('-', msg2.length());
			// System.out.println(hr2);
			repeatChar('-', msg2.length(), System.out);
			System.out.print('\n');
			System.out.println(msg2);
			// System.out.println(hr2);
			repeatChar('-', msg2.length(), System.out);
			System.out.print('\n');
		}
	}

	// private static String repeatChar(char c, int n) {
	// // new String(new char[n]).replace('\0', c);
	//
	// char[] array = new char[n];
	// for (int i = 0; i < n; i++) {
	// array[i] = c;
	// }
	// return new String(array);
	// }

	private static void repeatChar(char c, int n, PrintStream out) {
		for (int i = 0; i < n; i++) {
			out.print(c);
		}
	}
}
