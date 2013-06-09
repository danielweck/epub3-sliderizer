package danielweck.epub3.sliderizer;

import java.util.ArrayList;

import javax.xml.XMLConstants;

import org.jsoup.Jsoup;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class XHTML {

	public static String getFileName(int i) {
		// String nStr = String.format("0\1", n);
		String nStr = i <= 9 ? "0" + i : "" + i;

		String htmlFile = "slide_" + nStr + ".xhtml";
		return htmlFile;
	}

	public static void createAll(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		int n = slideShow.slides.size();
		for (int i = 0; i < n; i++) {
			XHTML.create(slideShow, i, pathEpubFolder, verbosity);
		}
	}

	private static ArrayList<String> alreadyAddedHeadLinks = new ArrayList<String>();

	private static void create_HeadLinks(String relFilePath, Document document,
			Element elementHead, String linkRel, String linkType,
			String destFolder) {
		if (relFilePath == null) {
			return;
		}

		String[] relPaths = null;
		if (relFilePath.indexOf('\n') < 0) {
			relPaths = new String[1];
			relPaths[0] = relFilePath;
		} else {
			relPaths = relFilePath.split("\n");
		}

		for (int i = 0; i < relPaths.length; i++) {

			String ref = destFolder + "/" + relPaths[i];
			if (alreadyAddedHeadLinks.contains(ref)) {
				continue;
			}
			alreadyAddedHeadLinks.add(ref);

			Element elementLink = document.createElement("link");
			elementHead.appendChild(elementLink);
			elementLink.setAttribute("rel", linkRel);
			elementLink.setAttribute("href", ref);
			if (linkType != null) {
				elementLink.setAttribute("type", linkType);
			}
		}
	}

	private static ArrayList<String> alreadyAddedHeadScripts = new ArrayList<String>();

	private static void create_HeadScripts(String relFilePath,
			Document document, Element elementHead, String linkType,
			String destFolder) {
		if (relFilePath == null) {
			return;
		}

		String[] relPaths = null;
		if (relFilePath.indexOf('\n') < 0) {
			relPaths = new String[1];
			relPaths[0] = relFilePath;
		} else {
			relPaths = relFilePath.split("\n");
		}

		for (int i = 0; i < relPaths.length; i++) {

			String ref = destFolder + "/" + relPaths[i];
			if (alreadyAddedHeadScripts.contains(ref)) {
				continue;
			}
			alreadyAddedHeadScripts.add(ref);

			Element elementScript = document.createElement("script");
			elementHead.appendChild(elementScript);
			elementScript.setAttribute("src", ref);
			elementScript.appendChild(document.createTextNode(" "));

			if (linkType != null) {
				elementScript.setAttribute("type", linkType);
			}
		}
	}

	static Element create_Boilerplate(Document document, Slide slide,
			SlideShow slideShow, String pathEpubFolder, int verbosity)
			throws Exception {

		alreadyAddedHeadScripts.clear();
		alreadyAddedHeadLinks.clear();

		String PATH_PREFIX = slide == null ? "" : "../";

		Element elementHtml = document.createElementNS(
				"http://www.w3.org/1999/xhtml", "html");
		document.appendChild(elementHtml);
		if (slide == null) {
			elementHtml.setAttribute("id", "epb3sldrzr-NavDoc");
		}

		elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":epub",
				"http://www.idpf.org/2007/ops");

		elementHtml
				.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
						XMLConstants.XMLNS_ATTRIBUTE + ":"
								+ XMLConstants.XML_NS_PREFIX,
						XMLConstants.XML_NS_URI);

		elementHtml.setAttributeNS(XMLConstants.XML_NS_URI,
				XMLConstants.XML_NS_PREFIX + ":lang", slideShow.LANGUAGE);
		elementHtml.setAttribute("lang", slideShow.LANGUAGE);

		Element elementHead = document.createElement("head");
		elementHtml.appendChild(elementHead);

		Element elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("charset", "UTF-8");

		String title = slide == null ? slideShow.TITLE : slide.TITLE;
		String subtitle = slide == null ? slideShow.SUBTITLE : slide.SUBTITLE;

		String htmlTitle = (slideShow.TITLE != null ? slideShow.TITLE : "")
				+ (slideShow.SUBTITLE != null ? " - " + slideShow.SUBTITLE : "")
				+ (slide == null ? ""
						: " / "
								+ (slide.TITLE != null ? slide.TITLE : "")
								+ (slide.SUBTITLE != null ? " - "
										+ slide.SUBTITLE : ""));

		Element elementTitle = document.createElement("title");
		elementHead.appendChild(elementTitle);
		elementTitle.appendChild(document.createTextNode(htmlTitle));

		create_HeadLinks(slideShow.FAVICON, document, elementHead,
				"shortcut icon", null, PATH_PREFIX
						+ Epub3FileSet.IMG_FOLDER_NAME);

		if (slideShow.VIEWPORT_WIDTH != null
				&& slideShow.VIEWPORT_HEIGHT != null) {
			Element elementMeta2 = document.createElement("meta");
			elementHead.appendChild(elementMeta2);
			elementMeta2.setAttribute("name", "viewport");
			elementMeta2.setAttribute("content", "width="
					+ slideShow.VIEWPORT_WIDTH + ",height="
					+ slideShow.VIEWPORT_HEIGHT);
		}

		create_HeadLinks(Epub3FileSet.CSS_DEFAULT_NAME, document, elementHead,
				"stylesheet", "text/css", PATH_PREFIX
						+ Epub3FileSet.CSS_FOLDER_NAME);

		create_HeadLinks(Epub3FileSet.CSS_ANIMATE_NAME, document, elementHead,
				"stylesheet", "text/css", PATH_PREFIX
						+ Epub3FileSet.CSS_FOLDER_NAME);

		create_HeadLinks(slideShow.FILES_CSS, document, elementHead,
				"stylesheet", "text/css", PATH_PREFIX
						+ Epub3FileSet.CSS_FOLDER_NAME);

		if (slide != null) {
			create_HeadLinks(slide.FILES_CSS, document, elementHead,
					"stylesheet", "text/css", PATH_PREFIX
							+ Epub3FileSet.CSS_FOLDER_NAME);
		}

		create_HeadScripts(Epub3FileSet.JS_DEFAULT_NAME, document, elementHead,
				null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		create_HeadScripts(Epub3FileSet.JS_SCREENFULL_NAME, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		create_HeadScripts(Epub3FileSet.JS_CLASSLIST_NAME, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		// create_HeadScripts(Epub3FileSet.JS_HISTORY_NAME, document,
		// elementHead,
		// null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);
		//
		// create_HeadScripts(Epub3FileSet.JS_JSON_NAME, document, elementHead,
		// null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		create_HeadScripts(slideShow.FILES_JS, document, elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		if (slide != null) {
			create_HeadScripts(slide.FILES_JS, document, elementHead, null, // "text/javascript",
					PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);
		}

		if (slide == null) {
			create_HeadLinks(XHTML.getFileName(1), document, elementHead,
					"next", null, Epub3FileSet.HTML_FOLDER_NAME);
		} else {
			int i = slideShow.slides.indexOf(slide) + 1;

			String prev = "../" + NavDoc.getFileName();
			if (i > 1) {
				prev = XHTML.getFileName(i - 1);
			}
			create_HeadLinks(prev, document, elementHead, "prev", null, ".");

			if (i < slideShow.slides.size()) {
				String next = XHTML.getFileName(i + 1);

				create_HeadLinks(next, document, elementHead, "next", null, ".");
			}
		}

		if (slideShow.CSS_STYLE != null) {
			Element elementStyle = document.createElement("style");
			elementHead.appendChild(elementStyle);
			elementStyle.setAttribute("type", "text/css");
			elementStyle.appendChild(document.createTextNode("\n"));
			String css = Epub3FileSet.processCssStyle(slideShow,
					slideShow.CSS_STYLE);
			elementStyle.appendChild(document.createTextNode(css));
			elementStyle.appendChild(document.createTextNode("\n"));
		}

		if (slide != null && slide.CSS_STYLE != null) {
			Element elementStyle = document.createElement("style");
			elementHead.appendChild(elementStyle);
			elementStyle.setAttribute("type", "text/css");
			elementStyle.appendChild(document.createTextNode("\n"));
			String css = Epub3FileSet.processCssStyle(slideShow,
					slide.CSS_STYLE);
			elementStyle.appendChild(document.createTextNode(css));
			elementStyle.appendChild(document.createTextNode("\n"));
		}

		if (slideShow.JS_SCRIPT != null) {
			Element elementScript = document.createElement("script");
			elementHead.appendChild(elementScript);
			// elementScript.setAttribute("type", "text/javascript");
			elementScript.appendChild(document.createTextNode("\n//"));
			elementScript.appendChild(document.createCDATASection("\n"
					+ slideShow.JS_SCRIPT + "\n//"));
			elementScript.appendChild(document.createTextNode("\n"));
		}

		if (slide != null && slide.JS_SCRIPT != null) {

			Element elementScript = document.createElement("script");
			elementHead.appendChild(elementScript);
			// elementScript.setAttribute("type", "text/javascript");
			elementScript.appendChild(document.createTextNode("\n//"));
			elementScript.appendChild(document.createCDATASection("\n"
					+ slide.JS_SCRIPT + "\n//"));
			elementScript.appendChild(document.createTextNode("\n"));
		}

		Element elementBody_ = document.createElement("body");
		elementHtml.appendChild(elementBody_);
		elementBody_.setAttributeNS("http://www.idpf.org/2007/ops",
				"epub:type", "bodymatter");

		Element elementBody = document.createElement("div");
		elementBody.setAttribute("id", "epb3sldrzr-body");
		elementBody_.appendChild(elementBody);

		if (slideShow.LOGO != null) {

			String relativeDestinationPath = PATH_PREFIX
					+ Epub3FileSet.IMG_FOLDER_NAME + '/' + slideShow.LOGO;

			Element elementImg = document.createElement("img");
			elementBody.appendChild(elementImg);
			elementImg.setAttribute("id", "epb3sldrzr-logo");
			elementImg.setAttribute("alt", "");
			elementImg.setAttribute("src", relativeDestinationPath);
		}

		Element elementDiv = document.createElement("div");
		elementBody.appendChild(elementDiv);
		elementDiv.setAttribute("id", "epb3sldrzr-root");

		Element elementH1 = document.createElement("h1");
		elementH1.setAttribute("id", "epb3sldrzr-title");
		elementDiv.appendChild(elementH1);
		elementH1.appendChild(document.createTextNode(title));

		if (subtitle != null) {
			if (slide == null) {
				Element elementLineBreak = document.createElement("br");
				elementH1.appendChild(elementLineBreak);
			}
			Element elementSpan = document.createElement("span");
			elementH1.appendChild(document.createTextNode(" "));
			elementH1.appendChild(elementSpan);
			elementSpan.setAttribute("id", "epb3sldrzr-subtitle");
			// elementSpan.setAttribute("class", "fade smaller");
			elementSpan.appendChild(document.createTextNode(subtitle));
		}

		Element elementSection = document.createElement("section");
		elementDiv.appendChild(elementSection);
		elementSection.setAttribute("id", "epb3sldrzr-content");

		return elementSection;
	}

	static void create_Content(Element elementSection, Document document,
			String content, SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		if (content == null) {
			return;
		}

		String wrappedContent = "<wrapper xmlns=\"http://www.w3.org/1999/xhtml\">"
				+ content + "</wrapper>";

		Document documentFragment = null;
		try {
			documentFragment = XmlDocument.parse(wrappedContent);
		} catch (Exception ex) {
			// ex.printStackTrace();
		}

		boolean soupedUp = false;
		org.jsoup.nodes.Document soupDoc = null;
		try {
			soupDoc = Jsoup.parse(wrappedContent);
			soupDoc.outputSettings().prettyPrint(true);
			wrappedContent = soupDoc.outerHtml();
			try {
				documentFragment = XmlDocument.parse(wrappedContent);
				soupedUp = true;
			} catch (Exception ex) {
				// ex.printStackTrace();
			}
		} catch (Exception ex) {
			// ex.printStackTrace();
		}

		if (documentFragment != null) {
			Element docElement = documentFragment.getDocumentElement();
			if (soupedUp) {
				try {
					docElement = (Element) ((Element) docElement
							.getElementsByTagName("body").item(0))
							.getElementsByTagName("wrapper").item(0);
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}

			NodeList list = docElement.getChildNodes();
			for (int j = 0; j < list.getLength(); ++j) {
				elementSection.appendChild(document.importNode(list.item(j),
						true));
			}
		} else {
			elementSection.appendChild(document.createTextNode(content));
		}
	}

	private static void create(SlideShow slideShow, int i,
			String pathEpubFolder, int verbosity) throws Exception {

		Slide slide = slideShow.slides.get(i);
		i++;

		Document document = XmlDocument.create();

		Element elementSection = create_Boilerplate(document, slide, slideShow,
				pathEpubFolder, verbosity);

		create_Content(elementSection, document, slide.CONTENT, slideShow,
				pathEpubFolder, verbosity);

		if (slide.NOTES != null) {
			Element elementNotes = document.createElement("div");
			elementSection.getParentNode().appendChild(elementNotes);
			elementNotes.setAttribute("id", "epb3sldrzr-notes");
			// elementNotes.appendChild(document.createTextNode("SLIDE NOTES:"));
			create_Content(elementNotes, document, slide.NOTES, slideShow,
					pathEpubFolder, verbosity);
		}

		String fileName = XHTML.getFileName(i);
		XmlDocument.save(document, pathEpubFolder + "/"
				+ Epub3FileSet.HTML_FOLDER_NAME + "/" + fileName, verbosity);
	}
}
