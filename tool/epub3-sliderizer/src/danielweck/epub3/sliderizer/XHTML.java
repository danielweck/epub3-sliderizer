package danielweck.epub3.sliderizer;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintStream;
import java.io.StringWriter;
import java.nio.charset.Charset;
import java.util.ArrayList;

import javax.xml.XMLConstants;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Entities.EscapeMode;
import org.pegdown.PegDownProcessor;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.google.common.base.Function;

import danielweck.VoidPrintStream;
import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class XHTML {

	static VoidPrintStream m_VoidPrintStream = new VoidPrintStream();

	public static String getFileName(int i) {
		// String nStr = String.format("0\1", n);
		String nStr = i <= 9 ? "0" + i : "" + i;

		String htmlFile = "slide_" + nStr + ".xhtml";
		return htmlFile;
	}

	public static String getFileName_Notes(int i) {
		return getFileName(i).replace(".xhtml", "_NOTES.xhtml");
	}

	public static void createAll(MustacheFactory mustacheFactory,
			File template_Slide, File template_SlideNotes,
			File template_BackImgCSS, SlideShow slideShow,
			String pathEpubFolder, int verbosity) throws Exception {

		if (template_Slide != null && !template_Slide.exists()) {
			throw new FileNotFoundException(template_Slide.getAbsolutePath());
		}
		if (template_SlideNotes != null && !template_SlideNotes.exists()) {
			throw new FileNotFoundException(
					template_SlideNotes.getAbsolutePath());
		}
		if (template_BackImgCSS != null && !template_BackImgCSS.exists()) {
			throw new FileNotFoundException(
					template_BackImgCSS.getAbsolutePath());
		}

		Mustache mustacheSlide = null;
		if (template_Slide != null) {
			try {
				Mustache mustache = mustacheFactory
						.compile(Epub3FileSet.TEMPLATE_SLIDE);
				mustacheSlide = mustache;
			} catch (Exception ex) {
				System.out.println(" ");
				System.out.println("}}}}} INVALID MUSTACHE TEMPLATE!!!! "
						+ template_Slide.getAbsolutePath());
				ex.printStackTrace();
			}
		}

		Mustache mustacheSlideNotes = null;
		if (template_SlideNotes != null) {
			try {
				Mustache mustache = mustacheFactory
						.compile(Epub3FileSet.TEMPLATE_SLIDE_NOTES);
				mustacheSlideNotes = mustache;
			} catch (Exception ex) {
				System.out.println(" ");
				System.out.println("}}}}} INVALID MUSTACHE TEMPLATE!!!! "
						+ template_SlideNotes.getAbsolutePath());
				ex.printStackTrace();
			}
		}

		Mustache mustacheBackImgCss = null;
		if (template_Slide != null) {
			try {
				Mustache mustache = mustacheFactory
						.compile(Epub3FileSet.TEMPLATE_BACK_IMG_CSS);
				mustacheBackImgCss = mustache;
			} catch (Exception ex) {
				System.out.println(" ");
				System.out.println("}}}}} INVALID MUSTACHE TEMPLATE!!!! "
						+ template_BackImgCSS.getAbsolutePath());
				ex.printStackTrace();
			}
		}

		if (mustacheSlide != null) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE OK [SLIDE]: "
						+ template_Slide.getAbsolutePath());
			}
		}
		if (mustacheSlideNotes != null) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE OK [SLIDE NOTES]: "
						+ template_SlideNotes.getAbsolutePath());
			}
		}
		if (mustacheBackImgCss != null) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out
						.println("}}}}} MUSTACHE TEMPLATE OK [BACKGROUND IMG CSS]: "
								+ template_BackImgCSS.getAbsolutePath());
			}
		}

		int n = slideShow.slides.size();
		for (int i = 0; i < n; i++) {
			XHTML.create(mustacheSlide, mustacheSlideNotes, mustacheBackImgCss,
					slideShow, i, pathEpubFolder, verbosity);
		}
	}

	// private static ArrayList<String> alreadyAddedHeadLinks = new
	// ArrayList<String>();
	//
	// private static void create_HeadLinks(String paths, Document document,
	// Element elementHead, String linkRel, String linkType,
	// String destFolder) {
	// if (paths == null) {
	// return;
	// }
	//
	// ArrayList<String> array = Epub3FileSet.splitPaths(paths);
	// for (String path : array) {
	//
	// String ref = path;
	// if (destFolder != null && !destFolder.equals(".")) {
	// ref = destFolder + "/" + path;
	// }
	// if (alreadyAddedHeadLinks.contains(ref)) {
	// continue;
	// }
	// alreadyAddedHeadLinks.add(ref);
	//
	// Element elementLink = document.createElement("link");
	// elementHead.appendChild(elementLink);
	// elementLink.setAttribute("rel", linkRel);
	// elementLink.setAttribute("href", ref);
	// if (linkType != null) {
	// elementLink.setAttribute("type", linkType);
	// }
	// }
	// }

	// private static ArrayList<String> alreadyAddedHeadScripts = new
	// ArrayList<String>();

	//
	// private static void create_HeadScripts(String paths, Document document,
	// Element elementHead, String linkType, String destFolder) {
	// if (paths == null) {
	// return;
	// }
	//
	// ArrayList<String> array = Epub3FileSet.splitPaths(paths);
	// for (String path : array) {
	//
	// String ref = path;
	// if (destFolder != null && !destFolder.equals(".")) {
	// ref = destFolder + "/" + path;
	// }
	// if (alreadyAddedHeadScripts.contains(ref)) {
	// continue;
	// }
	// alreadyAddedHeadScripts.add(ref);
	//
	// Element elementScript = document.createElement("script");
	// elementHead.appendChild(elementScript);
	// elementScript.setAttribute("src", ref);
	// elementScript.appendChild(document.createTextNode(" "));
	//
	// if (linkType != null) {
	// elementScript.setAttribute("type", linkType);
	// }
	// }
	// }

	//
	// static Element create_Boilerplate(Document document, Slide slide,
	// SlideShow slideShow, String pathEpubFolder, int verbosity,
	// boolean notes) throws Exception {
	//
	// int i = slide == null ? -1 : slideShow.slides.indexOf(slide) + 1;
	//
	// alreadyAddedHeadScripts.clear();
	// alreadyAddedHeadLinks.clear();
	//
	// String PATH_PREFIX = slide == null ? "" : "../";
	//
	// Element elementHtml = document.createElementNS(
	// "http://www.w3.org/1999/xhtml", "html");
	// document.appendChild(elementHtml);
	// if (slide == null) {
	// elementHtml.setAttribute("id", "epb3sldrzr-NavDoc");
	// } else {
	// elementHtml.setAttribute("id", "epb3sldrzr-Slide"
	// + (notes ? "Notes" : "") + "_" + i);
	// }
	//
	// elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
	// XMLConstants.XMLNS_ATTRIBUTE + ":epub",
	// "http://www.idpf.org/2007/ops");
	//
	// elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
	// XMLConstants.XMLNS_ATTRIBUTE + ":m",
	// "http://www.w3.org/1998/Math/MathML");
	//
	// elementHtml.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
	// XMLConstants.XMLNS_ATTRIBUTE + ":svg",
	// "http://www.w3.org/2000/svg");
	//
	// elementHtml
	// .setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
	// XMLConstants.XMLNS_ATTRIBUTE + ":"
	// + XMLConstants.XML_NS_PREFIX,
	// XMLConstants.XML_NS_URI);
	//
	// elementHtml.setAttributeNS(XMLConstants.XML_NS_URI,
	// XMLConstants.XML_NS_PREFIX + ":lang", slideShow.LANGUAGE);
	// elementHtml.setAttribute("lang", slideShow.LANGUAGE);
	//
	// Element elementHead = document.createElement("head");
	// elementHtml.appendChild(elementHead);
	//
	// Element elementMeta = document.createElement("meta");
	// elementHead.appendChild(elementMeta);
	// elementMeta.setAttribute("charset", "UTF-8");
	//
	// elementMeta = document.createElement("meta");
	// elementHead.appendChild(elementMeta);
	// elementMeta.setAttribute("name", "description");
	// elementMeta.setAttribute("content", Epub3FileSet.GENERATOR);
	//
	// elementMeta = document.createElement("meta");
	// elementHead.appendChild(elementMeta);
	// elementMeta.setAttribute("name", "keywords");
	// elementMeta.setAttribute("content", Epub3FileSet.KEYWORDS);
	//
	// String title = slide == null ? slideShow.TITLE : slide.TITLE;
	// if (title == null || title.isEmpty()) {
	// title = "NO TITLE!";
	// }
	//
	// String subtitle = slide == null ? slideShow.SUBTITLE : slide.SUBTITLE;
	//
	// String htmlTitle = (slideShow.TITLE != null ? slideShow.TITLE : "")
	// + (slideShow.SUBTITLE != null ? " - " + slideShow.SUBTITLE : "")
	// + (slide == null ? ""
	// : " / "
	// + (slide.TITLE != null ? slide.TITLE : "")
	// + (slide.SUBTITLE != null ? " - "
	// + slide.SUBTITLE : ""));
	// if (notes) {
	// htmlTitle = htmlTitle + " (NOTES)";
	// }
	//
	// htmlTitle = "(" + (i == -1 ? 0 : i) + "/" + slideShow.slides.size()
	// + ") " + htmlTitle;
	//
	// Element elementTitle = document.createElement("title");
	// elementHead.appendChild(elementTitle);
	// elementTitle.appendChild(document.createTextNode(htmlTitle));
	//
	// create_HeadLinks(slideShow.FAVICON, document, elementHead,
	// "shortcut icon", null, PATH_PREFIX + slideShow.FAVICON_FOLDER());
	//
	// create_HeadLinks(slideShow.TOUCHICON, document, elementHead,
	// "apple-touch-icon", null, PATH_PREFIX + Epub3FileSet.FOLDER_IMG
	// + "/" + Epub3FileSet.FOLDER_CUSTOM);
	//
	// if (// !notes &&
	// slideShow.VIEWPORT_WIDTH != null && slideShow.VIEWPORT_HEIGHT != null) {
	// Element elementMeta2 = document.createElement("meta");
	// elementHead.appendChild(elementMeta2);
	// elementMeta2.setAttribute("name", "viewport");
	// elementMeta2.setAttribute("content", "width="
	// + slideShow.VIEWPORT_WIDTH + ", height="
	// + slideShow.VIEWPORT_HEIGHT
	// // +
	// //
	// ", user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1"
	// );
	// }
	//
	// if (!slideShow.importedConverted) {
	//
	// for (int k = 0; k < Epub3FileSet.CSSs.length; k++) {
	// String filename = Epub3FileSet.CSSs[k].FILE;
	// // String id = Epub3FileSet.CSS_FILENAMES[k][1];
	//
	// create_HeadLinks(filename, document, elementHead, "stylesheet",
	// "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS);
	// }
	// if (slide == null) {
	// create_HeadLinks(Epub3FileSet.CSS_NAVDOC.FILE, document,
	// elementHead, "stylesheet", "text/css", PATH_PREFIX
	// + Epub3FileSet.FOLDER_CSS);
	// }
	//
	// // Element elementStyle = document.createElement("style");
	// // elementHead.appendChild(elementStyle);
	// // elementStyle.setAttribute("type", "text/css");
	// // elementStyle.appendChild(document.createTextNode("\n"));
	// // File cssFile = new File(pathEpubFolder, Epub3FileSet.FOLDER_CSS
	// // + "/" + Epub3FileSet.CSS_DEFAULT);
	// // StringBuilder strBuilder = XmlDocument.readFileLines(cssFile);
	// // String css = Epub3FileSet.processCssStyle(slideShow,
	// // strBuilder.toString());
	// // css = css.replaceAll("url\\('", "url('" + PATH_PREFIX
	// // + Epub3FileSet.FOLDER_CSS + "/");
	// // elementStyle.appendChild(document.createTextNode(css));
	// // elementStyle.appendChild(document.createTextNode("\n"));
	// }
	//
	// create_HeadLinks(slideShow.FILES_CSS, document, elementHead,
	// "stylesheet", "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS
	// + "/" + Epub3FileSet.FOLDER_CUSTOM);
	//
	// if (slide != null) {
	// create_HeadLinks(slide.FILES_CSS, document, elementHead,
	// "stylesheet", "text/css", PATH_PREFIX
	// + Epub3FileSet.FOLDER_CSS + "/"
	// + Epub3FileSet.FOLDER_CUSTOM);
	// }
	//
	// if (slideShow.importedConverted) {
	//
	// for (int k = 0; k < Epub3FileSet.CSSs.length; k++) {
	// String filename = Epub3FileSet.CSSs[k].FILE;
	// // String id = Epub3FileSet.CSS_FILENAMES[k][1];
	//
	// create_HeadLinks(filename, document, elementHead, "stylesheet",
	// "text/css", PATH_PREFIX + Epub3FileSet.FOLDER_CSS);
	// }
	// if (slide == null) {
	// create_HeadLinks(Epub3FileSet.CSS_NAVDOC.FILE, document,
	// elementHead, "stylesheet", "text/css", PATH_PREFIX
	// + Epub3FileSet.FOLDER_CSS);
	// }
	// }
	//
	// for (int k = 0; k < Epub3FileSet.JSs.length; k++) {
	// String filename = Epub3FileSet.JSs[k].FILE;
	// // String id = Epub3FileSet.JS_FILENAMES[k][1];
	//
	// create_HeadScripts(filename, document, elementHead, null, //
	// "text/javascript",
	// PATH_PREFIX + Epub3FileSet.FOLDER_JS);
	// }
	//
	// create_HeadScripts(slideShow.FILES_JS, document, elementHead, null, //
	// "text/javascript",
	// PATH_PREFIX + Epub3FileSet.FOLDER_JS + "/"
	// + Epub3FileSet.FOLDER_CUSTOM);
	//
	// if (slide != null) {
	// create_HeadScripts(slide.FILES_JS, document, elementHead, null, //
	// "text/javascript",
	// PATH_PREFIX + Epub3FileSet.FOLDER_JS + "/"
	// + Epub3FileSet.FOLDER_CUSTOM);
	// }
	//
	// if (slide == null) {
	// create_HeadLinks(XHTML.getFileName(1), document, elementHead,
	// "next", null, Epub3FileSet.FOLDER_HTML);
	//
	// create_HeadLinks(slideShow.EPUB_FILE(), document, elementHead,
	// "epub", null, "../..");
	// } else if (!notes) {
	//
	// String prev = "../" + NavDoc.getFileName();
	// if (i > 1) {
	// prev = XHTML.getFileName(i - 1);
	// }
	// create_HeadLinks(prev, document, elementHead, "prev", null, ".");
	//
	// if (i < slideShow.slides.size()) {
	// String next = XHTML.getFileName(i + 1);
	//
	// create_HeadLinks(next, document, elementHead, "next", null, ".");
	// }
	//
	// create_HeadLinks(slideShow.EPUB_FILE(), document, elementHead,
	// "epub", null, "../../..");
	// }
	//
	// if (slideShow.CSS_STYLE != null) {
	// Element elementStyle = document.createElement("style");
	// elementHead.appendChild(elementStyle);
	// elementStyle.setAttribute("type", "text/css");
	// elementStyle.appendChild(document.createTextNode("\n"));
	// String css = Epub3FileSet.processCssStyle(slideShow,
	// slideShow.CSS_STYLE);
	// elementStyle.appendChild(document.createTextNode(css));
	// elementStyle.appendChild(document.createTextNode("\n"));
	// }
	//
	// if (slide != null && slide.CSS_STYLE != null) {
	// Element elementStyle = document.createElement("style");
	// elementHead.appendChild(elementStyle);
	// elementStyle.setAttribute("type", "text/css");
	// elementStyle.appendChild(document.createTextNode("\n"));
	// String css = Epub3FileSet.processCssStyle(slideShow,
	// slide.CSS_STYLE);
	// elementStyle.appendChild(document.createTextNode(css));
	// elementStyle.appendChild(document.createTextNode("\n"));
	// }
	//
	// if (slideShow.importedConverted) {
	// Element elementStyle = document.createElement("style");
	// elementHead.appendChild(elementStyle);
	// elementStyle.setAttribute("type", "text/css");
	// elementStyle.appendChild(document.createTextNode("\n"));
	//
	// String css =
	// "\n\nh1#epb3sldrzr-title\n{\nposition: absolute; left: 0; top: 0; right: 0; display: none; \n}\n\n";
	// css += "\n\ndiv#epb3sldrzr-root{overflow:hidden;}\n\n";
	//
	// elementStyle.appendChild(document.createTextNode(css));
	// elementStyle.appendChild(document.createTextNode("\n"));
	// }
	//
	// if (slideShow.JS_SCRIPT != null) {
	// Element elementScript = document.createElement("script");
	// elementHead.appendChild(elementScript);
	// // elementScript.setAttribute("type", "text/javascript");
	// elementScript.appendChild(document.createTextNode("\n//"));
	// elementScript.appendChild(document.createCDATASection("\n"
	// + slideShow.JS_SCRIPT + "\n//"));
	// elementScript.appendChild(document.createTextNode("\n"));
	// }
	//
	// if (slide != null && slide.JS_SCRIPT != null) {
	//
	// Element elementScript = document.createElement("script");
	// elementHead.appendChild(elementScript);
	// // elementScript.setAttribute("type", "text/javascript");
	// elementScript.appendChild(document.createTextNode("\n//"));
	// elementScript.appendChild(document.createCDATASection("\n"
	// + slide.JS_SCRIPT + "\n//"));
	// elementScript.appendChild(document.createTextNode("\n"));
	// }
	//
	// Element elementBody_ = document.createElement("body");
	// elementHtml.appendChild(elementBody_);
	// elementBody_.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:type", "bodymatter");
	// // elementBody_.setAttribute("class", "epb3sldrzr-epubReadingSystem");
	//
	// Element elementBody = null;
	// if (false && notes) {
	// elementBody = elementBody_;
	// } else {
	// elementBody = document.createElement("div");
	// elementBody.setAttribute("id", "epb3sldrzr-body");
	// elementBody_.appendChild(elementBody);
	// // elementBody_.appendChild(document.createTextNode("TEST"));
	// }
	//
	// Element elementDiv = null;
	// if (false && notes) {
	// elementDiv = elementBody_;
	// } else {
	// elementDiv = document.createElement("div");
	// elementBody.appendChild(elementDiv);
	// elementDiv.setAttribute("id", "epb3sldrzr-root");
	// }
	//
	// if (// !notes &&
	// slideShow.LOGO != null) {
	// String relativeDestinationPath = PATH_PREFIX
	// + Epub3FileSet.FOLDER_IMG + "/"
	// + Epub3FileSet.FOLDER_CUSTOM + '/' + slideShow.LOGO;
	//
	// Element elementImg = document.createElement("img");
	// elementDiv.appendChild(elementImg);// elementBody
	// elementImg.setAttribute("id", "epb3sldrzr-logo");
	// elementImg.setAttribute("alt", "");
	// elementImg.setAttribute("src", relativeDestinationPath);
	// }
	//
	// Element elementH1 = document.createElement("h1");
	// elementH1.setAttribute("id", "epb3sldrzr-title");
	// elementDiv.appendChild(elementH1);
	// elementH1.appendChild(document.createTextNode(title));
	//
	// if (subtitle != null) {
	// if (slide == null
	// // || notes
	// ) {
	// Element elementLineBreak = document.createElement("br");
	// elementH1.appendChild(elementLineBreak);
	// }
	// Element elementSpan = document.createElement("span");
	// elementH1.appendChild(document.createTextNode(" "));
	// elementH1.appendChild(elementSpan);
	// elementSpan.setAttribute("id", "epb3sldrzr-subtitle");
	// // elementSpan.setAttribute("class", "fade smaller");
	// elementSpan.appendChild(document.createTextNode(subtitle));
	// }
	//
	// if (notes) {
	// Element elementA = document.createElement("a");
	// elementA.setAttribute("href", XHTML.getFileName(i));
	// elementA.setAttribute("id", "epb3sldrzr-link-noteback");
	// elementA.appendChild(document.createTextNode("Back"));
	// Element elementP = document.createElement("p");
	// elementP.appendChild(elementA);
	// elementDiv.appendChild(elementP);
	// }
	//
	// Element elementSection = document.createElement("section");
	// elementDiv.appendChild(elementSection);
	// elementSection.setAttribute("id", "epb3sldrzr-content");
	//
	// // return elementSection;
	//
	// Element divAnimOverflow = document.createElement("div");
	// elementSection.appendChild(divAnimOverflow);
	// divAnimOverflow.setAttribute("id", "epb3sldrzr-anim-overflow");
	//
	// return divAnimOverflow;
	// }

	private static void injectIncrementals(String increments, Element element,
			Document document, String content, SlideShow slideShow,
			Slide slide, String pathEpubFolder, int verbosity) throws Exception {
		if (slide == null) {
			return;
		}

		String name = element.getLocalName();
		if (name == null) {
			name = element.getNodeName();
		}

		if (name.equals("ul") || name.equals("ol")) {
			Node attrClass = null;
			NamedNodeMap attrs = element.getAttributes();
			for (int i = 0; i < attrs.getLength(); i++) {

				Node attr = attrs.item(i);

				String attrName = attr.getLocalName();
				if (attrName == null) {
					attrName = attr.getNodeName();
				}

				if (attrName != null && attrName.equals("class")) {
					attrClass = attr;
					break;
				}
			}
			if (attrClass == null) {
				element.setAttribute("class", increments);
			} else {
				String attrVal = attrClass.getNodeValue();
				attrClass.setNodeValue(attrVal + " " + increments);
			}
		}

		NodeList list = element.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			injectIncrementals(increments, (Element) node, document, content,
					slideShow, slide, pathEpubFolder, verbosity);
		}
	}

	private static void fixImageRelativeReferences(Element element,
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

					if (verbosity > 0) {
						System.out.println("###### " + attrVal);
					}

					if (attrVal.indexOf("http://") == 0
							|| attrVal.indexOf("https://") == 0) {
						continue;
					}

					boolean found = false;
					for (String path : allReferences_IMG) {

						if (attrVal.indexOf(path) >= 0) {
							found = true;
							attrVal = attrVal.replaceAll(path, "../"
									+ Epub3FileSet.FOLDER_IMG + "/"
									+ Epub3FileSet.FOLDER_CUSTOM + "/" + path);
						}
					}
					if (!found) {
						if (verbosity > 0) {
							System.out.println("###### ADDING IMAGE: "
									+ attrVal);
						}

						Epub3FileSet.handleFile(slideShow, pathEpubFolder,
								Epub3FileSet.FOLDER_IMG + "/"
										+ Epub3FileSet.FOLDER_CUSTOM, attrVal,
								verbosity);
						if (slide.FILES_IMG == null) {
							slide.FILES_IMG = "";
						} else {
							slide.FILES_IMG += "\n";
						}
						slide.FILES_IMG += attrVal;

						slideShow.addReferences_IMG(attrVal);
						allReferences_IMG = slideShow.getAllReferences_IMG();

						attrVal = "../" + Epub3FileSet.FOLDER_IMG + "/"
								+ Epub3FileSet.FOLDER_CUSTOM + "/" + attrVal;
					}

					if (!attrVal.equals(attr.getNodeValue())) {
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

			fixImageRelativeReferences((Element) node, document, content,
					slideShow, slide, pathEpubFolder, verbosity);
		}
	}

	final static PegDownProcessor m_PegDownProcessor = new PegDownProcessor();
	public final static String MARKDOWN = "MARKDOWN";
	public final static String NOMARKDOWN = "NO-MARKDOWN";
	public final static String MARKDOWN_SRC = "MARKDOWN_SRC";

	public static String massage(String content, SlideShow slideShow,
			Slide slide, String pathEpubFolder, int verbosity) throws Exception {

		if (content == null) {
			return null;
		}

		Document document = XmlDocument.create();
		Element rootElement = document.createElementNS(
				"http://www.w3.org/1999/xhtml", "html");
		document.appendChild(rootElement);

		rootElement.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":epub",
				"http://www.idpf.org/2007/ops");

		rootElement.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":m",
				"http://www.w3.org/1998/Math/MathML");

		rootElement.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":svg",
				"http://www.w3.org/2000/svg");

		rootElement
				.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
						XMLConstants.XMLNS_ATTRIBUTE + ":"
								+ XMLConstants.XML_NS_PREFIX,
						XMLConstants.XML_NS_URI);

		XHTML.create_Content(rootElement, document, content, slideShow, slide,
				pathEpubFolder, verbosity);

		return XmlDocument.toString(rootElement, -1)
				.replaceAll("<\\?xml[^>]*\\?>", "")
				.replaceAll("<html[^>]*>", "").replaceAll("</html>", "");
	}

	public static void create_Content(Element elementSection,
			Document document, String content, SlideShow slideShow,
			Slide slide, String pathEpubFolder, int verbosity) throws Exception {

		if (content == null) {
			return;
		}

		boolean skipMarkdown = false;

		if (content.indexOf(MARKDOWN_SRC) == 0) {
			content = "<pre>"
					+ content.substring(MARKDOWN_SRC.length())
							.replace("&", "&amp;").replace("<", "&lt;")
							.replace(">", "&gt;") + "</pre>";
			skipMarkdown = true;
		} else if (content.indexOf(MARKDOWN) == 0) {
			content = content.substring(MARKDOWN.length());
		} else if (content.indexOf(NOMARKDOWN) == 0) {
			content = content.substring(NOMARKDOWN.length());
			skipMarkdown = true;
		}

		if (!skipMarkdown) {
			try {
				content = m_PegDownProcessor.markdownToHtml(content);
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		}

		String wrappedContent = "<wrapper xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns:m=\"http://www.w3.org/1998/Math/MathML\">"
				+ content + "</wrapper>";

		// PrintStream sysOut = System.out;
		PrintStream sysErr = System.err;

		// System.setOut(m_VoidPrintStream);
		System.setErr(m_VoidPrintStream);

		boolean xmlSuccess = false;
		Document documentFragment = null;
		try {
			documentFragment = XmlDocument.parse(wrappedContent);
			xmlSuccess = true;
		} catch (Exception ex) {
			System.setErr(sysErr);
			// ex.printStackTrace();
		} finally {
			// System.setOut(sysOut);
			System.setErr(sysErr);
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
			fixImageRelativeReferences(elementSection, document, content,
					slideShow, slide, pathEpubFolder, verbosity);

			if (slide != null) {
				String increments = "";
				if (slide.incrementalsAuto()) {
					increments = "auto incremental";
				} else if (slide.incrementalsManual()) {
					increments = "incremental";
				} else if (slide.incrementalsNO()) {
					increments = "";
				} else if (slideShow.incrementalsAuto()) {
					increments = "auto incremental";
				} else if (slideShow.incrementalsManual()) {
					increments = "incremental";
				}
				if (increments.length() > 0) {
					injectIncrementals(increments, elementSection, document,
							content, slideShow, slide, pathEpubFolder,
							verbosity);
				}
			}
		} else {
			elementSection.appendChild(document
					.createComment("XML / SOUP FAIL"));

			elementSection.appendChild(document.createTextNode(content));

			throw new Exception("XML / SOUP FAIL");
		}
	}

	//
	// private static void create_Notes(String notes, SlideShow slideShow,
	// Slide slide, int i, String pathEpubFolder, int verbosity)
	// throws Exception {
	//
	// Document document = XmlDocument.create();
	//
	// Element elementSection = create_Boilerplate(document, slide, slideShow,
	// pathEpubFolder, verbosity, true);
	//
	// create_Content(elementSection, document, notes, slideShow, slide,
	// pathEpubFolder, verbosity);
	//
	// String fileName = XHTML.getFileName_Notes(i);
	// XmlDocument.save(document, pathEpubFolder + "/"
	// + Epub3FileSet.FOLDER_HTML + "/" + fileName, verbosity);
	// }

	private static Mustache _mustacheBackImgCss = null;
	private static SlideShow _slideShow = null;
	public final static Function<String, String> backgroundImageCss = new Function<String, String>() {
		@Override
		public String apply(String input) {
			if (_mustacheBackImgCss == null) {
				return null;
			}
			if (_slideShow == null) {
				return null;
			}

			int slideNumber = 0;
			try {
				slideNumber = Integer.parseInt(input);
			} catch (Exception ex) {
				System.err.println(ex.getMessage());
				ex.printStackTrace();
				return null;
			}
			slideNumber--;

			if (slideNumber < 0 || slideNumber > _slideShow.slides.size() - 1) {
				System.err.println("!! Invalid slide number #" + slideNumber);
				return null;
			}

			Slide slide = _slideShow.slides.get(slideNumber);

			if (_slideShow.BACKGROUND_IMG == null
					&& slide.BACKGROUND_IMG == null) {
				return null;
			}

			// TODO: yuck! Hack (should be handled in Mustache syntax...if then
			// else).
			String backup = null;
			if (slide.BACKGROUND_IMG != null
					&& _slideShow.BACKGROUND_IMG != null) {
				backup = _slideShow.BACKGROUND_IMG;
				_slideShow.BACKGROUND_IMG = null;
			}

			StringWriter stringWriter = new StringWriter();
			try {
				_mustacheBackImgCss.execute(stringWriter, slide);
			} catch (Exception ex) {
				stringWriter = null;
				System.out.println(" ");
				System.out
						.println("}}}}} MUSTACHE TEMPLATE ERROR!!!! (BACKGROUND IMG CSS)");
				ex.printStackTrace();
			} finally {
				if (backup != null) {
					_slideShow.BACKGROUND_IMG = backup;
				}
			}
			if (stringWriter != null) {
				stringWriter.flush();
				String css = stringWriter.toString();
				try {
					css = Epub3FileSet.processCssStyle(_slideShow, css);
				} catch (Exception ex) {
					System.err.println(ex.getMessage());
					ex.printStackTrace();
					return null;
				}
				return "<style type=\"text/css\">\n" + css + "\n</style>";
			}

			return null;
		}
	};

	private static void create(Mustache mustacheSlide,
			Mustache mustacheSlideNotes, Mustache mustacheBackImgCss,
			SlideShow slideShow, int i, String pathEpubFolder, int verbosity)
			throws Exception {

		// TODO: HORRIBLE HACK!!!! (see backgroundImageCss Function above)
		_slideShow = slideShow;
		_mustacheBackImgCss = mustacheBackImgCss;

		Slide slide = slideShow.slides.get(i);
		i++;

		if (slide.NOTES != null) {
			Document documentNotes = null;

			if (mustacheSlideNotes != null) {
				StringWriter stringWriter = new StringWriter();
				try {
					mustacheSlideNotes.execute(stringWriter, slide);
				} catch (Exception ex) {
					stringWriter = null;
					System.out.println(" ");
					System.out
							.println("}}}}} MUSTACHE TEMPLATE ERROR!!!! (SLIDE NOTES)");
					ex.printStackTrace();
				}
				if (stringWriter != null) {
					stringWriter.flush();
					String src = stringWriter.toString();
					documentNotes = XmlDocument.parse(src);
				}

				String fileName = XHTML.getFileName_Notes(i);
				XmlDocument.save(documentNotes, pathEpubFolder + "/"
						+ Epub3FileSet.FOLDER_HTML + "/" + fileName, verbosity);
			}

			if (documentNotes == null) {
				throw new FileNotFoundException(Epub3FileSet.FOLDER_TEMPLATES
						+ "/" + Epub3FileSet.TEMPLATE_SLIDE_NOTES);

				// create_Notes(slide.NOTES, slideShow, slide, i,
				// pathEpubFolder,
				// verbosity);
			}
		}

		Document document = null;

		if (mustacheSlide != null) {
			StringWriter stringWriter = new StringWriter();
			try {
				mustacheSlide.execute(stringWriter, slide);
			} catch (Exception ex) {
				stringWriter = null;
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE ERROR!!!! (SLIDE)");
				ex.printStackTrace();
			}
			if (stringWriter != null) {
				stringWriter.flush();
				String src = stringWriter.toString();
				document = XmlDocument.parse(src);
			}
		}

		if (document == null) {
			throw new Exception(Epub3FileSet.FOLDER_TEMPLATES + "/"
					+ Epub3FileSet.TEMPLATE_SLIDE);
			//
			// document = XmlDocument.create();
			//
			// Element elementSection = create_Boilerplate(document, slide,
			// slideShow, pathEpubFolder, verbosity, false);
			//
			// create_Content(elementSection, document, slide.CONTENT,
			// slideShow,
			// slide, pathEpubFolder, verbosity);
			//
			// if (slide.NOTES != null) {
			//
			// Element elementNotesRef = document.createElement("a");
			// elementSection.appendChild(elementNotesRef);
			// elementNotesRef.appendChild(document.createTextNode("Notes"));
			// elementNotesRef.setAttribute("id", "epb3sldrzr-link-notesref");
			// elementNotesRef.setAttributeNS("http://www.idpf.org/2007/ops",
			// "epub:type", "noteref");
			//
			// // elementNotesRef.setAttribute("href", "#epb3sldrzr-notes");
			// elementNotesRef.setAttribute("href", getFileName_Notes(i));
			//
			// Element elementNotes = document.createElement("aside");
			// elementSection.getParentNode().appendChild(elementNotes);
			// elementNotes.setAttribute("id", "epb3sldrzr-notes");
			// elementNotes.setAttributeNS("http://www.idpf.org/2007/ops",
			// "epub:type", "footnote");
			//
			// create_Content(elementNotes, document, slide.NOTES, slideShow,
			// slide, pathEpubFolder, verbosity);
			// }
		}

		String fileName = XHTML.getFileName(i);
		XmlDocument.save(document, pathEpubFolder + "/"
				+ Epub3FileSet.FOLDER_HTML + "/" + fileName, verbosity);
	}
}
