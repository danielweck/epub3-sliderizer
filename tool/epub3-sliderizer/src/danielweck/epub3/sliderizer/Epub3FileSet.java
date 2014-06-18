package danielweck.epub3.sliderizer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.MustacheFactory;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class Epub3FileSet {

	public final static class FileId {
		String FILE;
		String ID;

		public FileId(String file, String id) {
			FILE = file;
			ID = id;
		}
	}

	public static String XHTML_EXT = ".xhtml";

	public final static String GENERATOR = "EPUB3-Sliderizer http://github.com/danielweck/epub3-sliderizer";
	public final static String KEYWORDS = "EPUB EPUB3 HTML5 XHTML XML Sliderizer slideshow slide deck e-book ebook";

	public final static String FOLDER_TEMPLATES = "templates";
	public final static String TEMPLATE_NAV = "nav.xhtml.mustache";
	public final static String TEMPLATE_SLIDE = "slide.xhtml.mustache";
	public final static String TEMPLATE_SLIDE_NOTES = "slide_NOTES.xhtml.mustache";
	public final static String TEMPLATE_BACK_IMG_CSS = "background_img.css.mustache";
	public final static String TEMPLATE_VIEWPORT_OVERRIDE_CSS = "viewport_override.css.mustache";
	public final static String TEMPLATE_PRINT = "print.xhtml.mustache";

	public final static String FOLDER_FONTS = "fonts";
	public final static String FOLDER_HTML = "html";
	public final static String FOLDER_MO = "mo";
	public final static String FOLDER_JS = "js";
	public final static String FOLDER_IMG = "img";
	public final static String FOLDER_CSS = "css";

	public final static String FOLDER_CUSTOM = "custom";

	public final static String[][] FONT_FILENAMES = new String[][] {
			new String[] { "FontAwesome.woff", "font-awesome-woff" },
			new String[] { "Inconsolata.woff", "font-inconsolata-woff" },
			new String[] { "Lato_400.woff", "font-lato-400-woff" },
			new String[] { "Lato_900.woff", "font-lato-900-woff" },
			new String[] { "Neuton_400.woff", "font-neuton-400-woff" },
			new String[] { "Neuton_700.woff", "font-neuton-700-woff" },
			new String[] { "Arvo_400.woff", "font-arvo-400-woff" },
			new String[] { "Arvo_700.woff", "font-arvo-700-woff" } };

	public final static FileId CSS_NAVDOC = new FileId("navdoc.css",
			"css-navdoc");
	public final static FileId CSS_FONTS[] = new FileId[] {
			new FileId("fonts.css", "css-fonts"),
			new FileId("FontAwesome.css", "css-font-awesome") };
	public final static FileId[] CSSs = new FileId[] {
			new FileId("struct.css", "css-struct"),
			new FileId("incrementals.css", "css-incrementals"),
			new FileId("animations.css", "css-animations"),
			new FileId("controls.css", "css-controls"),
			new FileId("default.css", "css-default")
	// new FileId("jquery-ui.css", "css-jquery-ui")
	};

	public final static FileId[] JSs = new FileId[] {
			new FileId("default.js", "js-default") };

	public final static FileId[] JSs_OPF_ONLY = new FileId[] {
			new FileId("addEventListener.js", "js-addEventListener"),
			new FileId("classList.js", "js-classList"),
			new FileId("screenfull.js", "js-screenfull"),
			new FileId("hammer.min.js", "js-hammer"),
			new FileId("hammer.fakemultitouch.js", "js-hammer-fakemultitouch"),
			new FileId("hammer.showtouches.js", "js-hammer-showtouches"),
			new FileId("jquery.min.js", "js-jquery"),
			new FileId("jquery.mousewheel.js", "js-jquery-mousewheel"),
			new FileId("jquery.blockUI.js", "js-jquery-blockUI"),
			new FileId("reMarked.js", "js-reMarked"),
			new FileId("marked.js", "js-marked"),
			new FileId("ace.js", "js-ace"),
			new FileId("mode-markdown.js", "js-ace-markdown"),
			new FileId("theme-solarized_dark.js", "js-ace-theme"),
			new FileId("Markdown.Editor.js", "js-markdown-editor"),
			new FileId("htmlparser.js", "js-html-parser"),
			new FileId("keymaster.js", "js-keymaster") };

	private final static String CSS_PREFIXED = "_PREFIXED_";
	private final static String CSS_PREFIXED_PROP = "-PREFIXED_PROPERTY-";
	private final static String[] CSS_PREFIXES = new String[] { "webkit",
			"moz", "ms", "o" };

	public static void processCssFile(SlideShow slideShow, Slide slide,
			File cssFile, String pathEpubFolder, int verbosity) throws Exception {
		if (!cssFile.exists()) {
			throw new FileNotFoundException(cssFile.getAbsolutePath());
		}

		if (verbosity > 0) {
			System.out.println(" ");
			System.out.println("+++++ PROCESSING CSS: "
					+ cssFile.getAbsolutePath());
		}

		StringBuilder strBuilder = XmlDocument.readFileLines(cssFile);

		String updatedCSS = processCssStyle(slideShow, slide,
				strBuilder.toString(), pathEpubFolder, verbosity);

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
								CSS_PREFIXED, "-" + prefix + "-"))).replaceAll(
								CSS_PREFIXED_PROP, "-" + prefix + "-")
						+ "\n}\n";
			}
			replacement = replacement
					+ toReplace.replaceAll(CSS_PREFIXED, "").replaceAll(
							CSS_PREFIXED_PROP, "") + "\n}\n";

			String after = "";
			if (iRight < style.length() - 1) {
				after = style.substring(iRight + 1, style.length());
			}

			style = before + replacement + after;

			iStart = i1 + replacement.length();
		}
        
		return style;
	}

	public static String processCssStyle(SlideShow slideShow, Slide slide,
			String css, String pathEpubFolder, int verbosity
    ) throws Exception {
		String style = css;

        
		ArrayList<String> allReferences_IMG = slideShow.getAllReferences_IMG();
        
		String regexp_ = "url\\s*\\(\\s*[\"']?\\s*([^\\s]+)\\s*[\"']?\\s*\\)";
		Pattern pattern_ = Pattern.compile(regexp_);
		Matcher matcher_ = pattern_.matcher(style);
        while (matcher_.find()) {
            for (int i = 1; i <= matcher_.groupCount(); i++) {
                String grp = matcher_.group(i);

        		//String fileExtension = Epub3FileSet.getFileExtension(grp);
                String mediaType = Epub3FileSet.getMediaType(grp);
        		if (mediaType == null || mediaType.indexOf("image/") != 0) {
        			continue;
        		}

				boolean found = false;
				for (String path : allReferences_IMG) {
					if (grp == path) {
						found = true;
                        break;
					}
				}
				if (!found) {
					if (verbosity > 0) {
						System.out.println("###### ADDING CSS IMAGE: "
								+ grp);
					}

            		String fullSourcePath = slideShow.getBaseFolderPath() + '/' + grp;
            		File file = new File(fullSourcePath);
            		if (file.exists())
                    {
    					Epub3FileSet.handleFile(slideShow, slide,
    							pathEpubFolder, Epub3FileSet.FOLDER_IMG + "/"
    									+ Epub3FileSet.FOLDER_CUSTOM, grp,
    							verbosity);
                        
                        if (slide != null) {
        					if (slide.FILES_IMG == null) {
        						slide.FILES_IMG = "";
        					} else {
        						slide.FILES_IMG += "\n";
        					}
                            slide.FILES_IMG += grp;
                        }
                        else {
        					if (slideShow.FILES_IMG == null) {
        						slideShow.FILES_IMG = "";
        					} else {
        						slideShow.FILES_IMG += "\n";
        					}
                            slideShow.FILES_IMG += grp;
                        }

    					slideShow.addReferences_IMG(grp);
    					allReferences_IMG = slideShow.getAllReferences_IMG();

        			} else {
        				System.out.println(" ");
        				System.out.println("::::: INVALID CSS URL IMAGE? " + grp);

                        if (true) {
                            throw new RuntimeException("::::::::: FORCE STOP: " + grp);
                        }
                    }
				}
            }
        }

        allReferences_IMG = slideShow.getAllReferences_IMG();
        for (String path : allReferences_IMG) {
            String rplc = "../" + Epub3FileSet.FOLDER_IMG + "/" + Epub3FileSet.FOLDER_CUSTOM + "/" + path;

    		String regexp = "(url\\s*\\(\\s*[\"']?\\s*" + path + "\\s*[\"']?\\s*\\))";
            
            //style = style.replaceAll(regexp, rplc);
            
    		Pattern pattern = Pattern.compile(regexp);
			Matcher matcher = pattern.matcher(style);
            //             
            // while (matcher.find()) {
            //     for (int i = 1; i <= matcher.groupCount(); i++) {
            //         String grp = matcher.group(i);
            // 
            //         if (true) {
            //             throw new RuntimeException(grp);
            //         }
            //     }
            // }
            //             
            style = matcher.replaceAll("url('" + rplc + "')");
        }

		style = processCssStyle_(style);

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

		style = style.replaceAll("VIEWPORT_WIDTH", slide == null
				|| slide.VIEWPORT_WIDTH == null ? slideShow.VIEWPORT_WIDTH
				: slide.VIEWPORT_WIDTH);
		style = style.replaceAll("VIEWPORT_HEIGHT", slide == null
				|| slide.VIEWPORT_HEIGHT == null ? slideShow.VIEWPORT_HEIGHT
				: slide.VIEWPORT_HEIGHT);

		int fontSize = 40;
		try {
			fontSize = Integer.parseInt(slideShow.FONT_SIZE);
		} catch (Exception ex) {
			;
		}

		style = style.replaceAll("FONT_SIZEpx", fontSize + "px");
		style = style.replaceAll("FONT_SIZErem", fontSize / 10 + "rem");

		int half = Math.round(fontSize / 2);
		style = style.replaceAll("FONT_SIZE_HALFpx", half + "px");
		style = style.replaceAll("FONT_SIZE_HALFrem", half / 10 + "rem");

		int widthSS = 1290;
		try {
			widthSS = Integer.parseInt(slideShow.VIEWPORT_WIDTH);
		} catch (Exception ex) {
			;
		}
		int widthS = widthSS;
		if (slide != null && slide.VIEWPORT_WIDTH != null) {
			try {
				widthS = Integer.parseInt(slide.VIEWPORT_WIDTH);
			} catch (Exception ex) {
				;
			}
		}

		int heightSS = 1000;
		try {
			heightSS = Integer.parseInt(slideShow.VIEWPORT_HEIGHT);
		} catch (Exception ex) {
			;
		}
		int heightS = heightSS;
		if (slide != null && slide.VIEWPORT_HEIGHT != null) {
			try {
				heightS = Integer.parseInt(slide.VIEWPORT_HEIGHT);
			} catch (Exception ex) {
				;
			}
		}

		double ratio = widthSS / (double) widthS;
		int fontSizeUI = (int) Math.ceil(fontSize / ratio / 1.2);

		double ratio_ = heightSS / (double) heightS;
		int fontSizeUI_ = (int) Math.ceil(fontSize / ratio_ / 1.2);

		style = style.replaceAll("FONT_SIZE_UIpx", fontSizeUI + "px");
		style = style.replaceAll("FONT_SIZE_UI_px", fontSizeUI_ + "px");

		return style;
	}

	public static void handleFile(SlideShow slideShow, Slide slide,
			String pathEpubFolder, String destFolder, String path, int verbosity)
			throws Exception {
		if (path == null) {
			return;
		}

		String relativeDestinationPath = destFolder + '/' + path;
		String fullDestinationPath = pathEpubFolder + '/'
				+ relativeDestinationPath;

		String fullSourcePath = slideShow.getBaseFolderPath() + '/' + path;
		File file = new File(fullSourcePath);
		if (file.exists()) {
			Epub3FileSet.copyFile(fullSourcePath, fullDestinationPath,
					verbosity);
			// System.out.println(" ");
			// System.out.println("^^^^^^^ FILE: " + fullSourcePath);

			String ext = getFileExtension(fullDestinationPath);
			if (ext.equalsIgnoreCase("css")) {
				processCssFile(slideShow, slide, new File(fullDestinationPath),
						pathEpubFolder, verbosity);
			}
		} else if (verbosity > 0) {
			System.out.println(" ");
			System.out.println("^^^^^^^ Cannot find file: " + fullSourcePath);
		}
	}

	public static ArrayList<String> splitPaths(String paths) {
		ArrayList<String> array = new ArrayList<String>();

		if (paths == null) {
			return array;
		}

		if (paths.indexOf('\n') < 0) {
			array.add(paths);
		} else {
			String[] pathsArray = paths.split("\n");
			for (int i = 0; i < pathsArray.length; i++) {
				String path = pathsArray[i];
				if (!path.trim().isEmpty()) {
					array.add(path);
				}
			}
		}
		return array;
	}

	public static void handleFiles(SlideShow slideShow, Slide slide,
			String pathEpubFolder, String destFolder, String paths,
			int verbosity) throws Exception {
		if (paths == null) {
			return;
		}
		ArrayList<String> array = splitPaths(paths);
		for (String path : array) {
			handleFile(slideShow, slide, pathEpubFolder, destFolder, path,
					verbosity);
		}
	}

	public static void create(String uriDataFile, SlideShow slideShow,
			String pathEpubFolder, int verbosity) throws Exception {

		File epubFolder = new File(pathEpubFolder);
		if (!epubFolder.isDirectory()) {
			throw new FileNotFoundException(pathEpubFolder);
		}

		URI uri = new URI(uriDataFile);
		if (!uri.getScheme().equalsIgnoreCase("file")) {
			throw new MalformedURLException(uriDataFile);
		}

		File file = new File(uri);
		if (!file.exists()) {
			throw new FileNotFoundException(uriDataFile);
		}

		File template_Nav = null;
		File template_Slide = null;
		File template_SlideNotes = null;
		File template_BackImgCSS = null;
		File template_ViewportOverrideCSS = null;
		File template_Print = null;

		MustacheFactory mustacheFactory = null;

		File templateDir = new File(file.getParent(), FOLDER_TEMPLATES);
		if (!templateDir.isDirectory()) {
			String toolDir = new File(Epub3FileSet.class.getClassLoader()
					.getResource("").getPath()).getParent();
			templateDir = new File(toolDir, FOLDER_TEMPLATES);
		}
		if (templateDir.isDirectory()) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out.println("}}}}} FOUND TEMPLATE DIRECTORY: "
						+ templateDir.getAbsolutePath());
			}
			mustacheFactory = new DefaultMustacheFactory(templateDir);

			File navTemplateFile = new File(templateDir, TEMPLATE_NAV);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out.println("}}}}} FOUND TEMPLATE [NAV DOC]: "
							+ navTemplateFile.getAbsolutePath());
				}
				template_Nav = navTemplateFile;
			}
			File slideTemplateFile = new File(templateDir, TEMPLATE_SLIDE);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out.println("}}}}} FOUND TEMPLATE [SLIDE]: "
							+ slideTemplateFile.getAbsolutePath());
				}
				template_Slide = slideTemplateFile;
			}
			File slideNotesTemplateFile = new File(templateDir,
					TEMPLATE_SLIDE_NOTES);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out.println("}}}}} FOUND TEMPLATE [SLIDE NOTES]: "
							+ slideNotesTemplateFile.getAbsolutePath());
				}
				template_SlideNotes = slideNotesTemplateFile;
			}
			File backImgCssTemplateFile = new File(templateDir,
					TEMPLATE_BACK_IMG_CSS);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out
							.println("}}}}} FOUND TEMPLATE [BACKGROUND IMG CSS]: "
									+ backImgCssTemplateFile.getAbsolutePath());
				}
				template_BackImgCSS = backImgCssTemplateFile;
			}
			File viewportOverrideCssTemplateFile = new File(templateDir,
					TEMPLATE_VIEWPORT_OVERRIDE_CSS);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out
							.println("}}}}} FOUND TEMPLATE [VIEWPORT OVERRIDE CSS]: "
									+ viewportOverrideCssTemplateFile
											.getAbsolutePath());
				}
				template_ViewportOverrideCSS = viewportOverrideCssTemplateFile;
			}
			File printTemplateFile = new File(templateDir, TEMPLATE_PRINT);
			if (file.exists()) {
				if (verbosity > 0) {
					System.out.println(" ");
					System.out.println("}}}}} FOUND TEMPLATE [PRINT DOC]: "
							+ printTemplateFile.getAbsolutePath());
				}
				template_Print = printTemplateFile;
			}
		}

		NCX.create(slideShow, pathEpubFolder, verbosity);

		NavDoc.create(mustacheFactory, template_Nav, slideShow, pathEpubFolder,
				verbosity);

		Print.create(mustacheFactory, template_Print, slideShow,
				pathEpubFolder, verbosity);

		XHTML.createAll(mustacheFactory, template_Slide, template_SlideNotes,
				template_BackImgCSS, template_ViewportOverrideCSS, slideShow,
				pathEpubFolder, verbosity);

		// processCSS MUST EXECUTE AFTER XHTML!! (image references dynamically added when
		// found in content markup)
        
		for (int i = 0; i < Epub3FileSet.CSSs.length; i++) {
			String filename = Epub3FileSet.CSSs[i].FILE;
			// String id = Epub3FileSet.CSSs[i][1];

			processCssFile(slideShow, null, new File(pathEpubFolder,
					Epub3FileSet.FOLDER_CSS + "/" + filename), pathEpubFolder, verbosity);
		}

		processCssFile(slideShow, null, new File(pathEpubFolder,
				Epub3FileSet.FOLDER_CSS + "/" + Epub3FileSet.CSS_NAVDOC.FILE),
				pathEpubFolder, verbosity);

		for (int i = 0; i < Epub3FileSet.CSS_FONTS.length; i++) {
			String filename = Epub3FileSet.CSS_FONTS[i].FILE;
			// String id = Epub3FileSet.CSS_FONTS[i][1];

			processCssFile(slideShow, null, new File(pathEpubFolder,
					Epub3FileSet.FOLDER_HTML + "/" + Epub3FileSet.FOLDER_FONTS
							+ "/" + filename), pathEpubFolder, verbosity);
		}

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.LOGO, verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.TOUCHICON,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.COVER, verbosity);

		// TODO: MASSIVE hack!!
		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ (slideShow.FAVICON.equals("favicon.ico") ? "" : "/"
						+ Epub3FileSet.FOLDER_CUSTOM), slideShow.FAVICON,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_CSS
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.FILES_CSS,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_HTML
				+ "/" + Epub3FileSet.FOLDER_FONTS + "/"
				+ Epub3FileSet.FOLDER_CUSTOM, slideShow.FILES_CSS_FONTS,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_JS
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.FILES_JS,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.FILES_IMG,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_HTML
				+ "/" + Epub3FileSet.FOLDER_FONTS + "/"
				+ Epub3FileSet.FOLDER_CUSTOM, slideShow.FILES_FONT, verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_IMG
				+ "/" + Epub3FileSet.FOLDER_CUSTOM, slideShow.BACKGROUND_IMG,
				verbosity);

		handleFiles(slideShow, null, pathEpubFolder, Epub3FileSet.FOLDER_HTML,
				slideShow.BACKGROUND_AUDIO, verbosity);

		for (Slide slide : slideShow.slides) {

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_IMG + "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.FILES_IMG, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_HTML + "/" + Epub3FileSet.FOLDER_FONTS
							+ "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.FILES_FONT, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_IMG + "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.BACKGROUND_IMG, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_HTML, slide.BACKGROUND_AUDIO, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_CSS + "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.FILES_CSS, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_HTML + "/" + Epub3FileSet.FOLDER_FONTS
							+ "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.FILES_CSS_FONTS, verbosity);

			handleFiles(slideShow, slide, pathEpubFolder,
					Epub3FileSet.FOLDER_JS + "/" + Epub3FileSet.FOLDER_CUSTOM,
					slide.FILES_JS, verbosity);
		}

		// MUST EXECUTE AFTER XHTML!! (image references dynamically added when
		// found in content markup)
		OPF.create(slideShow, pathEpubFolder, verbosity);
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
		if (fileExtension.equalsIgnoreCase("ttf")) {
			return "application/vnd.ms-opentype";
		}
		if (fileExtension.equalsIgnoreCase("otf")) {
			return "application/vnd.ms-opentype"; // "font/opentype";
		}
		if (fileExtension.equalsIgnoreCase("woff")) {
			return "application/font-woff";
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
		if (fileExtension.equalsIgnoreCase("html")) {
			return "application/xhtml+xml"; // "text/html";
		}
		if (fileExtension.equalsIgnoreCase("xhtml")) {
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
		if (fileExtension.equalsIgnoreCase("mp4")) { // oops :(
			return "video/mp4";
		}
		if (fileExtension.equalsIgnoreCase("webm")) {
			return "video/webm";
		}
		if (fileExtension.equalsIgnoreCase("ogv")) {
			return "video/ogg";
		}
		if (fileExtension.equalsIgnoreCase("pls")) {
			return "application/pls+xml";
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
