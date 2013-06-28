package danielweck.epub3.sliderizer;

import java.nio.charset.Charset;
import java.util.ArrayList;

import javax.xml.XMLConstants;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Entities.EscapeMode;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
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

	public static String getFileName_Notes(int i) {
		return getFileName(i).replace(".xhtml", "_NOTES.xhtml");
	}

	public static void createAll(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		int n = slideShow.slides.size();
		for (int i = 0; i < n; i++) {
			XHTML.create(slideShow, i, pathEpubFolder, verbosity);
		}
	}

	private static ArrayList<String> alreadyAddedHeadLinks = new ArrayList<String>();

	private static void create_HeadLinks(String paths, Document document,
			Element elementHead, String linkRel, String linkType,
			String destFolder) {
		if (paths == null) {
			return;
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(paths);
		for (String path : array) {

			String ref = destFolder + "/" + path;
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

	private static void create_HeadScripts(String paths, Document document,
			Element elementHead, String linkType, String destFolder) {
		if (paths == null) {
			return;
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(paths);
		for (String path : array) {

			String ref = destFolder + "/" + path;
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
			SlideShow slideShow, String pathEpubFolder, int verbosity,
			boolean notes) throws Exception {

		int i = slide == null ? -1 : slideShow.slides.indexOf(slide) + 1;

		alreadyAddedHeadScripts.clear();
		alreadyAddedHeadLinks.clear();

		String PATH_PREFIX = slide == null ? "" : "../";

		Element elementHtml = document.createElementNS(
				"http://www.w3.org/1999/xhtml", "html");
		document.appendChild(elementHtml);
		if (slide == null) {
			elementHtml.setAttribute("id", "epb3sldrzr-NavDoc");
		} else {
			elementHtml.setAttribute("id", "epb3sldrzr-Slide"
					+ (notes ? "Notes" : "") + "_" + i);
		}

		elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":epub",
				"http://www.idpf.org/2007/ops");

		elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":m",
				"http://www.w3.org/1998/Math/MathML");

		elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":svg",
				"http://www.w3.org/2000/svg");

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

		elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("name", "description");
		elementMeta.setAttribute("content", Epub3FileSet.THIS);

		elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("name", "keywords");
		elementMeta
				.setAttribute("content",
						"EPUB EPUB3 HTML5 Sliderizer slideshow slide deck e-book ebook");

		String title = slide == null ? slideShow.TITLE : slide.TITLE;
		if (title == null || title.isEmpty()) {
			title = "NO TITLE!";
		}

		String subtitle = slide == null ? slideShow.SUBTITLE : slide.SUBTITLE;

		String htmlTitle = (slideShow.TITLE != null ? slideShow.TITLE : "")
				+ (slideShow.SUBTITLE != null ? " - " + slideShow.SUBTITLE : "")
				+ (slide == null ? ""
						: " / "
								+ (slide.TITLE != null ? slide.TITLE : "")
								+ (slide.SUBTITLE != null ? " - "
										+ slide.SUBTITLE : ""));
		if (notes) {
			htmlTitle = htmlTitle + " (NOTES)";
		}

		htmlTitle = "(" + (i == -1 ? 0 : i) + "/" + slideShow.slides.size()
				+ ") " + htmlTitle;

		Element elementTitle = document.createElement("title");
		elementHead.appendChild(elementTitle);
		elementTitle.appendChild(document.createTextNode(htmlTitle));

		create_HeadLinks(slideShow.FAVICON, document, elementHead,
				"shortcut icon", null, PATH_PREFIX
						+ Epub3FileSet.FOLDER_IMG
						+ (slideShow.FAVICON.equals("favicon.ico") ? "" : "/"
								+ Epub3FileSet.FOLDER_CUSTOM));

		if (// !notes &&
		slideShow.VIEWPORT_WIDTH != null && slideShow.VIEWPORT_HEIGHT != null) {
			Element elementMeta2 = document.createElement("meta");
			elementHead.appendChild(elementMeta2);
			elementMeta2.setAttribute("name", "viewport");
			elementMeta2.setAttribute("content", "width="
					+ slideShow.VIEWPORT_WIDTH + ", height="
					+ slideShow.VIEWPORT_HEIGHT
			// +
			// ", user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1"
					);
		}

		// create_HeadLinks(Epub3FileSet.CSS_ANIMATE, document, elementHead,
		// "stylesheet", "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS);

		// create_HeadLinks(Epub3FileSet.CSS_JQUERY_UI, document, elementHead,
		// "stylesheet", "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS);

		create_HeadLinks(Epub3FileSet.CSS_FONT_AWESOME, document, elementHead,
				"stylesheet", "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS);

		if (!slideShow.importedConverted) {
			create_HeadLinks(Epub3FileSet.CSS_DEFAULT, document, elementHead,
					"stylesheet", "text/css", PATH_PREFIX
							+ Epub3FileSet.FOLDER_CSS);
		}

		create_HeadLinks(slideShow.FILES_CSS, document, elementHead,
				"stylesheet", "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS
						+ "/" + Epub3FileSet.FOLDER_CUSTOM);

		if (slide != null) {
			create_HeadLinks(slide.FILES_CSS, document, elementHead,
					"stylesheet", "text/css", PATH_PREFIX
							+ Epub3FileSet.FOLDER_CSS + "/"
							+ Epub3FileSet.FOLDER_CUSTOM);
		}

		if (slideShow.importedConverted) {
			create_HeadLinks(Epub3FileSet.CSS_DEFAULT, document, elementHead,
					"stylesheet", "text/css", PATH_PREFIX
							+ Epub3FileSet.FOLDER_CSS);
		}

		create_HeadScripts(Epub3FileSet.JS_CLASSLIST, document, elementHead,
				null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_SCREENFULL, document, elementHead,
				null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_HAMMER, document, elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_HAMMER_FAKEMULTITOUCH, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_HAMMER_SHOWTOUCHES, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_JQUERY, document, elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_JQUERY_UI, document, elementHead,
				null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_JQUERY_BLOCKUI, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_JQUERY_MOUSEWHEEL, document,
				elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		create_HeadScripts(Epub3FileSet.JS_DEFAULT, document, elementHead,
				null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS);

		// create_HeadScripts(Epub3FileSet.JS_SCROLLFIX_NAME, document,
		// elementHead, null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);
		//
		// create_HeadScripts(Epub3FileSet.JS_iSCROLL_NAME, document,
		// elementHead, null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);
		//
		// create_HeadScripts(Epub3FileSet.JS_HISTORY_NAME, document,
		// elementHead,
		// null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);
		//
		// create_HeadScripts(Epub3FileSet.JS_JSON_NAME, document, elementHead,
		// null, // "text/javascript",
		// PATH_PREFIX + Epub3FileSet.JS_FOLDER_NAME);

		create_HeadScripts(slideShow.FILES_JS, document, elementHead, null, // "text/javascript",
				PATH_PREFIX + Epub3FileSet.FOLDER_JS + "/"
						+ Epub3FileSet.FOLDER_CUSTOM);

		if (slide != null) {
			create_HeadScripts(slide.FILES_JS, document, elementHead, null, // "text/javascript",
					PATH_PREFIX + Epub3FileSet.FOLDER_JS + "/"
							+ Epub3FileSet.FOLDER_CUSTOM);
		}

		if (slide == null) {
			create_HeadLinks(XHTML.getFileName(1), document, elementHead,
					"next", null, Epub3FileSet.FOLDER_HTML);

			create_HeadLinks(slideShow.FILE_EPUB != null ? slideShow.FILE_EPUB
					: "EPUB3.epub", document, elementHead, "epub", null,
					"../..");
		} else if (!notes) {

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

		if (slideShow.importedConverted) {
			Element elementStyle = document.createElement("style");
			elementHead.appendChild(elementStyle);
			elementStyle.setAttribute("type", "text/css");
			elementStyle.appendChild(document.createTextNode("\n"));

			String css = "\n\nh1#epb3sldrzr-title,\nh1#epb3sldrzr-title-NOTES\n{\nposition: absolute; left: 0; top: 0; right: 0; display: none; \n}\n\n";
			css += "\n\ndiv#epb3sldrzr-root-NOTES,div#epb3sldrzr-root{overflow:hidden;}\n\n";

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
		if (notes) {
			elementBody_.setAttribute("class", "epb3sldrzr-NOTES");
		} else if (slide != null) {
			elementBody_.setAttribute("class", "epb3sldrzr-SLIDE");
		} else {
			elementBody_.setAttribute("class", "epb3sldrzr-NAVDOC");
		}

		Element elementBody = null;
		if (false && notes) {
			elementBody = elementBody_;
		} else {
			elementBody = document.createElement("div");
			elementBody.setAttribute("id", "epb3sldrzr-body"
					+ (notes ? "-NOTES" : ""));
			elementBody_.appendChild(elementBody);
		}

		if (// !notes &&
		slideShow.LOGO != null) {
			String relativeDestinationPath = PATH_PREFIX
					+ Epub3FileSet.FOLDER_IMG + "/"
					+ Epub3FileSet.FOLDER_CUSTOM + '/' + slideShow.LOGO;

			Element elementImg = document.createElement("img");
			elementBody.appendChild(elementImg);
			elementImg.setAttribute("id", "epb3sldrzr-logo");
			elementImg.setAttribute("alt", "");
			elementImg.setAttribute("src", relativeDestinationPath);
		}

		Element elementDiv = null;
		if (false && notes) {
			elementDiv = elementBody_;
		} else {
			elementDiv = document.createElement("div");
			elementBody.appendChild(elementDiv);
			elementDiv.setAttribute("id", "epb3sldrzr-root"
					+ (notes ? "-NOTES" : ""));
		}

		Element elementH1 = document.createElement("h1");
		elementH1.setAttribute("id", "epb3sldrzr-title"
				+ (notes ? "-NOTES" : ""));
		elementDiv.appendChild(elementH1);
		elementH1.appendChild(document.createTextNode(title));

		if (subtitle != null) {
			if (slide == null
			// || notes
			) {
				Element elementLineBreak = document.createElement("br");
				elementH1.appendChild(elementLineBreak);
			}
			Element elementSpan = document.createElement("span");
			elementH1.appendChild(document.createTextNode(" "));
			elementH1.appendChild(elementSpan);
			elementSpan.setAttribute("id", "epb3sldrzr-subtitle"
					+ (notes ? "-NOTES" : ""));
			// elementSpan.setAttribute("class", "fade smaller");
			elementSpan.appendChild(document.createTextNode(subtitle));
		}

		if (notes) {
			Element elementA = document.createElement("a");
			elementA.setAttribute("href", XHTML.getFileName(i));
			elementA.setAttribute("id", "epb3sldrzr-link-noteback");
			elementA.appendChild(document.createTextNode("Back"));
			Element elementP = document.createElement("p");
			elementP.appendChild(elementA);
			elementDiv.appendChild(elementP);
		}

		Element elementSection = document.createElement("section");
		elementDiv.appendChild(elementSection);
		elementSection.setAttribute("id", "epb3sldrzr-content"
				+ (notes ? "-NOTES" : ""));

		return elementSection;
	}

	private static void fixRelativeReferences(Element element,
			Document document, String content, SlideShow slideShow,
			Slide slide, String pathEpubFolder, int verbosity) throws Exception {
		if (slide == null) {
			return;
		}

		String name = element.getLocalName();
		if (name == null) {
			name = element.getNodeName();
		}
		//
		// if (name.equals("svg")) {
		// slide.containsSVG = true;
		// }
		// if (name.equals("math")) {
		// slide.containsMATHML = true;
		// }

		if (name.equals("image") || name.equals("img")) {

			ArrayList<String> allReferences_IMG = slideShow
					.getAllReferences_IMG();

			NamedNodeMap attrs = element.getAttributes();
			for (int i = 0; i < attrs.getLength(); i++) {

				Node attr = attrs.item(i);

				String attrVal = attr.getNodeValue();

				String attrName = attr.getLocalName();
				if (attrName == null) {
					attrName = attr.getNodeName();
				}

				if (attrName != null
						&& (attrName.equals("xlink:href")
								|| attrName.equals("href") || attrName
									.equals("src"))) {

					System.out.println("###### " + attrVal);

					for (String path : allReferences_IMG) {
						if (attrVal.indexOf(path) >= 0) {
							attrVal = attrVal.replaceAll(path, "../"
									+ Epub3FileSet.FOLDER_IMG + "/"
									+ Epub3FileSet.FOLDER_CUSTOM + "/" + path);
						}
					}

					if (attrVal != attr.getNodeValue()) {
						attr.setNodeValue(attrVal);
					}
				}
			}
		}

		NodeList list = element.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			fixRelativeReferences((Element) node, document, content, slideShow,
					slide, pathEpubFolder, verbosity);
		}
	}

	static void create_Content(Element elementSection, Document document,
			String content, SlideShow slideShow, Slide slide,
			String pathEpubFolder, int verbosity) throws Exception {

		if (content == null) {
			return;
		}

		String wrappedContent = "<wrapper xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns:m=\"http://www.w3.org/1998/Math/MathML\">"
				+ content + "</wrapper>";

		boolean xmlSuccess = false;
		Document documentFragment = null;
		try {
			documentFragment = XmlDocument.parse(wrappedContent);
			xmlSuccess = true;
		} catch (Exception ex) {
			// ex.printStackTrace();
		}

		boolean soupedUp = false;
		if (documentFragment == null) {
			org.jsoup.nodes.Document soupDoc = null;
			try {
				soupDoc = Jsoup.parse(wrappedContent, "UTF-8");
				soupDoc.outputSettings().prettyPrint(false);
				soupDoc.outputSettings().charset(Charset.forName("UTF-8"));
				soupDoc.outputSettings().escapeMode(EscapeMode.xhtml);
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

			if (xmlSuccess) {
				elementSection.appendChild(document.createComment("XML"));
			} else {
				elementSection.appendChild(document.createComment("SOUP"));
			}

			NodeList list = docElement.getChildNodes();
			for (int j = 0; j < list.getLength(); j++) {
				Node node = list.item(j);
				// if (node.getNodeType() == Node.TEXT_NODE
				// && node.getTextContent().trim().isEmpty()) {
				// //if (true) throw new Exception("HERE");
				// elementSection.appendChild(document
				// .createComment("EMPTY_TEXT"));
				// continue;
				// }
				if (node.getNodeType() == Node.TEXT_NODE
						|| node.getNodeType() == Node.ELEMENT_NODE
						|| node.getNodeType() == Node.COMMENT_NODE
						|| node.getNodeType() == Node.CDATA_SECTION_NODE) {
					elementSection.appendChild(document.importNode(node, true));
				} else {
					throw new Exception("node.getNodeType() = "
							+ node.getNodeType());
				}
			}
			fixRelativeReferences(elementSection, document, content, slideShow,
					slide, pathEpubFolder, verbosity);
		} else {
			elementSection.appendChild(document
					.createComment("XML / SOUP FAIL"));

			elementSection.appendChild(document.createTextNode(content));

			throw new Exception("XML / SOUP FAIL");
		}
	}

	private static void create_Notes(String notes, SlideShow slideShow,
			Slide slide, int i, String pathEpubFolder, int verbosity)
			throws Exception {

		Document document = XmlDocument.create();

		Element elementSection = create_Boilerplate(document, slide, slideShow,
				pathEpubFolder, verbosity, true);

		create_Content(elementSection, document, notes, slideShow, slide,
				pathEpubFolder, verbosity);

		String fileName = XHTML.getFileName_Notes(i);
		XmlDocument.save(document, pathEpubFolder + "/"
				+ Epub3FileSet.FOLDER_HTML + "/" + fileName, verbosity);
	}

	private static void create(SlideShow slideShow, int i,
			String pathEpubFolder, int verbosity) throws Exception {

		Slide slide = slideShow.slides.get(i);
		i++;

		Document document = XmlDocument.create();

		Element elementSection = create_Boilerplate(document, slide, slideShow,
				pathEpubFolder, verbosity, false);

		create_Content(elementSection, document, slide.CONTENT, slideShow,
				slide, pathEpubFolder, verbosity);

		if (slide.NOTES != null) {
			create_Notes(slide.NOTES, slideShow, slide, i, pathEpubFolder,
					verbosity);

			Element elementNotesRef = document.createElement("a");
			elementSection.appendChild(elementNotesRef);
			elementNotesRef.appendChild(document.createTextNode("Notes"));
			elementNotesRef.setAttribute("id", "epb3sldrzr-link-notesref");
			elementNotesRef.setAttributeNS("http://www.idpf.org/2007/ops",
					"epub:type", "noteref");

			// elementNotesRef.setAttribute("href", "#epb3sldrzr-notes");
			elementNotesRef.setAttribute("href", getFileName_Notes(i));

			Element elementNotes = document.createElement("aside");
			elementSection.getParentNode().appendChild(elementNotes);
			elementNotes.setAttribute("id", "epb3sldrzr-notes");
			elementNotes.setAttributeNS("http://www.idpf.org/2007/ops",
					"epub:type", "footnote");

			create_Content(elementNotes, document, slide.NOTES, slideShow,
					slide, pathEpubFolder, verbosity);
		}

		String fileName = XHTML.getFileName(i);
		XmlDocument.save(document, pathEpubFolder + "/"
				+ Epub3FileSet.FOLDER_HTML + "/" + fileName, verbosity);
	}
}
