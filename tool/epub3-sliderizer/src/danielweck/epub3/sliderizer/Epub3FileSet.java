package danielweck.epub3.sliderizer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
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
		fileDst.getParentFile().mkdirs();

		InputStream inStream = null;
		OutputStream outStream = null;
		try {
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
