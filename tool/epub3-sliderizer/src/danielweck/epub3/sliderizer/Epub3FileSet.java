package danielweck.epub3.sliderizer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;

public final class Epub3FileSet {

	final static String HTML_FOLDER_NAME = "html";
	final static String JS_FOLDER_NAME = "js";
	final static String IMG_FOLDER_NAME = "img";
	final static String CSS_FOLDER_NAME = "css";

	final static String CSS_DEFAULT_NAME = "default.css";
	final static String CSS_ANIMATE_NAME = "animate.css";

	final static String JS_DEFAULT_NAME = "default.js";
	final static String JS_SCREENFULL_NAME = "screenfull.js";
	final static String JS_CLASSLIST_NAME = "classList.js";
	// final static String JS_HISTORY_NAME = "history.js";
	// final static String JS_JSON_NAME = "json2.js";

	private final static String CSS_PREFIXED = "_PREFIXED_";
	private final static String CSS_PREFIXED_PROP = "-PREFIXED_PROPERTY-";
	private final static String[] CSS_PREFIXES = new String[] { "webkit",
			"moz", "ms", "o" };

	private static void processCssFile(File cssFile, int verbosity)
			throws Exception {
		if (!cssFile.exists()) {
			throw new FileNotFoundException(cssFile.getAbsolutePath());
		}

		if (verbosity > 0) {
			System.out.println(" ");
			System.out.println("+++++ PROCESSING CSS: "
					+ cssFile.getAbsolutePath());
		}

		StringBuilder strBuilder = new StringBuilder();
		BufferedReader bufferedReader = null;
		try {
			bufferedReader = new BufferedReader(new FileReader(cssFile));
			String line;
			while ((line = bufferedReader.readLine()) != null) {
				strBuilder.append(line);
				strBuilder.append('\n');
			}

		} finally {
			if (bufferedReader != null) {
				bufferedReader.close();
			}
		}

		String updatedCSS = processCssStyle(strBuilder.toString());

		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(cssFile);
			fileWriter.write(updatedCSS);
		} finally {
			if (fileWriter != null) {
				fileWriter.close();
			}
		}

		if (verbosity > 2) {
			System.out.println(" ");
			System.out.println("+++++ PROCESSED CSS: \n\n" + updatedCSS);
		}
	}

	private static String processCssStyle_(String css) throws Exception {
		String style = css;

		int i1 = -1;
		int iStart = 0;
		while ((i1 = style.indexOf(CSS_PREFIXED, iStart)) >= 0) {

			String before = "";
			if (i1 > 0) {
				before = style.substring(0, i1);
			}

			int iOpeningComment = before.lastIndexOf("/*");

			if (iOpeningComment >= 0) {

				int iClosingComment = before.lastIndexOf("*/");

				if (iClosingComment < iOpeningComment) {

					iStart = i1 + CSS_PREFIXED.length();
					continue;
				}
			}

			int iOpeningCurlyBrace = style.indexOf('{', i1);
			int iClosingCurlyBrace = -1;

			int depth = -1;

			int i = iOpeningCurlyBrace;
			while (i < style.length()) {
				if (style.charAt(i) == '{') {
					depth++;
					i++;
					continue;
				}
				if (style.charAt(i) == '}') {
					depth--;

					if (depth == -1) {
						iClosingCurlyBrace = i;
						break;
					}
				}

				i++;
			}

			int iRight = iClosingCurlyBrace;

			String toReplace = style.substring(i1, iRight).trim();

			String matchKeyFrames = CSS_PREFIXED + "@";
			boolean isKeyFrames = toReplace.indexOf(matchKeyFrames) == 0;

			String matchSelection = CSS_PREFIXED + "::";
			boolean isSelection = toReplace.indexOf(matchSelection) == 0;

			String replacement = "\n";
			for (String prefix : CSS_PREFIXES) {
				replacement = replacement
						+ (isKeyFrames ? toReplace.replaceAll(matchKeyFrames,
								"@-" + prefix + "-") : (isSelection ? toReplace
								.replaceAll(matchSelection, "::-" + prefix
										+ "-") : toReplace.replaceAll(
								CSS_PREFIXED, "-" + prefix + "-"))) + "\n}\n";
			}
			replacement = replacement + toReplace.replaceAll(CSS_PREFIXED, "")
					+ "\n}\n";

			String after = "";
			if (iRight < style.length() - 1) {
				after = style.substring(iRight + 1, style.length());
			}

			style = before + replacement + after;

			iStart = i1 + replacement.length();
		}

		return style;
	}

	public static String processCssStyle(String css) throws Exception {
		String style = css;

		int i1 = -1;
		int iStart = 0;
		while ((i1 = style.indexOf(CSS_PREFIXED_PROP, iStart)) >= 0) {

			String before = "";
			if (i1 > 0) {
				before = style.substring(0, i1);
			}

			int iOpeningComment = before.lastIndexOf("/*");

			if (iOpeningComment >= 0) {

				int iClosingComment = before.lastIndexOf("*/");

				if (iClosingComment < iOpeningComment) {

					iStart = i1 + CSS_PREFIXED_PROP.length();
					continue;
				}
			}

			int iSemicolon = style.indexOf(';', i1);
			int iClosingCurlyBrace = style.indexOf('}', i1);

			int iRight = -1;

			if (iSemicolon < 0 && iClosingCurlyBrace < 0) {
				iRight = style.length();
			} else {
				if (iSemicolon < 0) {
					iSemicolon = Integer.MAX_VALUE;
				}
				if (iClosingCurlyBrace < 0) {
					iClosingCurlyBrace = Integer.MAX_VALUE;
				}
				iRight = Math.min(iSemicolon, iClosingCurlyBrace);
			}

			String toReplace = style.substring(i1, iRight).trim();

			String replacement = "\n";
			for (String prefix : CSS_PREFIXES) {
				replacement = replacement
						+ toReplace.replaceAll(CSS_PREFIXED_PROP, "-" + prefix
								+ "-") + ";\n";
			}
			replacement = replacement
					+ toReplace.replaceAll(CSS_PREFIXED_PROP, "") + ";\n";

			String after = "";
			if (iRight < style.length()) {
				after = style.substring(
						((style.charAt(iRight) == ';' && iRight < style
								.length() - 1) ? iRight + 1 : iRight), style
								.length());
			}

			style = before + replacement + after;

			iStart = i1 + replacement.length();
		}

		style = processCssStyle_(style);

		return style;
	}

	private static void handleFile(SlideShow slideShow, String pathEpubFolder,
			String destFolder, String path, int verbosity) throws Exception {
		if (path == null) {
			return;
		}

		String relativeDestinationPath = destFolder + '/' + path;
		String fullDestinationPath = pathEpubFolder + '/'
				+ relativeDestinationPath;

		String fullSourcePath = slideShow.getBaseFolderPath() + '/' + path;
		File imgFile = new File(fullSourcePath);
		if (imgFile.exists()) {
			Epub3FileSet.copyFile(fullSourcePath, fullDestinationPath,
					verbosity);
		}
	}

	private static void handleFiles(SlideShow slideShow, String pathEpubFolder,
			String destFolder, String paths, int verbosity) throws Exception {
		if (paths == null) {
			return;
		}
		if (paths.indexOf('\n') < 0) {
			handleFile(slideShow, pathEpubFolder, destFolder, paths, verbosity);
		} else {
			String[] lines = paths.split("\n");
			for (int i = 0; i < lines.length; i++) {
				handleFile(slideShow, pathEpubFolder, destFolder, lines[i],
						verbosity);
			}
		}
	}

	public static void create(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		File epubFolder = new File(pathEpubFolder);
		if (!epubFolder.isDirectory()) {
			throw new FileNotFoundException(pathEpubFolder);
		}

		processCssFile(new File(pathEpubFolder, Epub3FileSet.CSS_FOLDER_NAME
				+ "/" + Epub3FileSet.CSS_DEFAULT_NAME), verbosity);

		handleFiles(slideShow, pathEpubFolder, Epub3FileSet.IMG_FOLDER_NAME,
				slideShow.LOGO, verbosity);

		handleFiles(slideShow, pathEpubFolder, Epub3FileSet.IMG_FOLDER_NAME,
				slideShow.COVER, verbosity);

		handleFiles(slideShow, pathEpubFolder, Epub3FileSet.IMG_FOLDER_NAME,
				slideShow.FAVICON, verbosity);

		handleFiles(slideShow, pathEpubFolder, Epub3FileSet.CSS_FOLDER_NAME,
				slideShow.FILES_CSS, verbosity);

		handleFiles(slideShow, pathEpubFolder, Epub3FileSet.JS_FOLDER_NAME,
				slideShow.FILES_JS, verbosity);

		for (Slide slide : slideShow.slides) {

			handleFiles(slideShow, pathEpubFolder,
					Epub3FileSet.IMG_FOLDER_NAME, slide.FILES_IMG, verbosity);

			handleFiles(slideShow, pathEpubFolder,
					Epub3FileSet.CSS_FOLDER_NAME, slide.FILES_CSS, verbosity);

			handleFiles(slideShow, pathEpubFolder, Epub3FileSet.JS_FOLDER_NAME,
					slide.FILES_JS, verbosity);
		}

		NCX.create(slideShow, pathEpubFolder, verbosity);

		NavDoc.create(slideShow, pathEpubFolder, verbosity);

		OPF.create(slideShow, pathEpubFolder, verbosity);

		XHTML.createAll(slideShow, pathEpubFolder, verbosity);
	}

	public static void copyFile(String srcFullPath, String dstFullPath,
			int verbosity) throws Exception {

		File fileSrc = new File(srcFullPath);
		if (!fileSrc.exists()) {
			throw new FileNotFoundException(srcFullPath);
		}

		File fileDst = new File(dstFullPath);
		if (fileDst.exists()) {
			// throw new InvalidParameterException(dstFullPath);

			if (verbosity > 0) {
				System.out.println("File already exists: [" + dstFullPath
						+ "].");
			}
			return;
		}

		InputStream inStream = null;
		OutputStream outStream = null;
		try {
			fileDst.getParentFile().mkdirs();

			inStream = new FileInputStream(fileSrc);
			outStream = new FileOutputStream(fileDst);

			byte[] buffer = new byte[1024];
			int length;
			while ((length = inStream.read(buffer)) > 0) {
				outStream.write(buffer, 0, length);
			}
		} finally {
			if (inStream != null) {
				inStream.close();
			}
			if (outStream != null) {
				outStream.close();
			}
		}

		if (verbosity > 0) {
			System.out.println("===== File copied: [" + srcFullPath + "] => ["
					+ dstFullPath + "].");
		}
	}

	public static String getMediaType(String fileName) {
		String fileExtension = getFileExtension(fileName);

		if (fileExtension == null) {
			return null;
		}
		if (fileExtension.equalsIgnoreCase("ico")) {
			return "image/vnd.microsoft.icon";
		}
		if (fileExtension.equalsIgnoreCase("jpg")
				|| fileExtension.equalsIgnoreCase("jpeg")) {
			return "image/jpeg";
		}
		if (fileExtension.equalsIgnoreCase("png")
				|| fileExtension.equalsIgnoreCase("apng")) {
			return "image/png";
		}
		if (fileExtension.equalsIgnoreCase("gif")) {
			return "image/gif";
		}
		if (fileExtension.equalsIgnoreCase("html")
				|| fileExtension.equalsIgnoreCase("xhtml")) {
			return "application/xhtml+xml";
		}
		if (fileExtension.equalsIgnoreCase("ncx")) {
			return "application/x-dtbncx+xml";
		}
		if (fileExtension.equalsIgnoreCase("css")) {
			return "text/css";
		}
		if (fileExtension.equalsIgnoreCase("js")) {
			return "text/javascript";
		}
		if (fileExtension.equalsIgnoreCase("smil")) {
			return "application/smil+xml";
		}
		if (fileExtension.equalsIgnoreCase("mp3")) {
			return "audio/mpeg";
		}
		if (fileExtension.equalsIgnoreCase("mp4")) {
			return "audio/mp4";
		}

		return "??";
	}

	public static String getFileExtension(String fileName) {
		String extension = null;
		int i = fileName.lastIndexOf('.');
		int p = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
		if (i > p) {
			extension = fileName.substring(i + 1);
		}
		return extension;
	}
}
