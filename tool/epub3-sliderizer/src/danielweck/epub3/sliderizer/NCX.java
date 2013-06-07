package danielweck.epub3.sliderizer;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class NCX {

	public static String getFileName() {
		return "nav.ncx";
	}

	public static void create(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {
		Document document = XmlDocument.create();

		Element elementNcx = document.createElementNS(
				"http://www.daisy.org/z3986/2005/ncx/", "ncx");
		document.appendChild(elementNcx);

		elementNcx.setAttribute("version", "2005-1");

		Element elementHead = document.createElement("head");
		elementNcx.appendChild(elementHead);

		Element elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("name", "dtb:depth");
		elementMeta.setAttribute("content", "1");

		elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("name", "dtb:totalPageCount");
		elementMeta.setAttribute("content", "" + slideShow.slides.size());

		elementMeta = document.createElement("meta");
		elementHead.appendChild(elementMeta);
		elementMeta.setAttribute("name", "dtb:maxPageNumber");
		elementMeta.setAttribute("content", "" + slideShow.slides.size());

		if (slideShow.IDENTIFIER != null) {
			elementMeta = document.createElement("meta");
			elementHead.appendChild(elementMeta);
			elementMeta.setAttribute("name", "dtb:uid");
			elementMeta.setAttribute("content", slideShow.IDENTIFIER);
		}

		if (slideShow.TITLE != null) {
			Element elementDocTitle = document.createElement("docTitle");
			elementNcx.appendChild(elementDocTitle);
			Element elementText = document.createElement("text");
			elementDocTitle.appendChild(elementText);
			elementText.appendChild(document.createTextNode(slideShow.TITLE));
		}

		if (slideShow.CREATOR != null) {
			Element elementAuthor = document.createElement("docAuthor");
			elementNcx.appendChild(elementAuthor);
			Element elementText = document.createElement("text");
			elementAuthor.appendChild(elementText);
			elementText.appendChild(document.createTextNode(slideShow.CREATOR));
		}

		Element elementNavMap = document.createElement("navMap");
		elementNcx.appendChild(elementNavMap);

		Element elementPageList = document.createElement("pageList");
		elementNcx.appendChild(elementPageList);

		Element elementNavLabel = document.createElement("navLabel");
		elementPageList.appendChild(elementNavLabel);
		Element elementText = document.createElement("text");
		elementNavLabel.appendChild(elementText);
		elementText.appendChild(document.createTextNode("List of slides"));
		
		int i = 0;
		int playOrder = 0;
		for (Slide slide : slideShow.slides) {
			i++;

			Element elementNavPoint = document.createElement("navPoint");
			elementNavMap.appendChild(elementNavPoint);

			elementNavPoint.setAttribute("id", "s" + i);
			elementNavPoint.setAttribute("playOrder", "" + ++playOrder);

			elementNavLabel = document.createElement("navLabel");
			elementNavPoint.appendChild(elementNavLabel);
			elementText = document.createElement("text");
			elementNavLabel.appendChild(elementText);
			if (slide.TITLE != null) {
				elementText.appendChild(document.createTextNode(slide.TITLE
						+ (slide.SUBTITLE != null ? " -- " + slide.SUBTITLE
								: "")));
			}

			Element elementContent = document.createElement("content");
			elementNavPoint.appendChild(elementContent);
			elementContent.setAttribute("src", Epub3FileSet.HTML_FOLDER_NAME
					+ "/" + XHTML.getFileName(i));

			Element elementPageTarget = document.createElement("pageTarget");
			elementPageList.appendChild(elementPageTarget);

			elementPageTarget.setAttribute("type", "normal");
			elementPageTarget.setAttribute("value", "" + i);
			elementPageTarget.setAttribute("playOrder", "" + ++playOrder);
			elementPageTarget.setAttribute("id", "p" + i);

			elementNavLabel = document.createElement("navLabel");
			elementPageTarget.appendChild(elementNavLabel);
			elementText = document.createElement("text");
			elementNavLabel.appendChild(elementText);
			elementText.appendChild(document.createTextNode("" + i));

			elementContent = document.createElement("content");
			elementPageTarget.appendChild(elementContent);
			elementContent.setAttribute("src", Epub3FileSet.HTML_FOLDER_NAME
					+ "/" + XHTML.getFileName(i) + "#body");
		}

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}
}
