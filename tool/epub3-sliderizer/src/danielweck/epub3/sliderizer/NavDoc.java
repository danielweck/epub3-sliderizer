package danielweck.epub3.sliderizer;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class NavDoc {

	public static String getFileName() {
		return "nav.xhtml";
	}

	public static void create(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		Document document = XmlDocument.create();

		Element elementSection = XHTML.create_Boilerplate(document, null,
				slideShow, pathEpubFolder, verbosity);

		create_ContentFragment(elementSection, document, slideShow,
				pathEpubFolder, verbosity);

		if (slideShow.NOTES != null) {
			Element elementNotes = document.createElement("div");
			elementSection.getParentNode().appendChild(elementNotes);
			elementNotes.setAttribute("id", "notes");
			// elementNotes.appendChild(document.createTextNode("SLIDE NOTES:"));
			XHTML.create_Content(elementNotes, document, slideShow.NOTES,
					slideShow, pathEpubFolder, verbosity);
		}

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}

	private static void create_ContentFragment(Element elementSection,
			Document document, SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		Element elementNavToc = document.createElement("nav");
		elementSection.appendChild(elementNavToc);
		elementNavToc.setAttribute("id", "toc");
		elementNavToc.setAttributeNS("http://www.idpf.org/2007/ops",
				"epub:type", "toc");

		Element elementOlToc = document.createElement("ol");
		elementNavToc.appendChild(elementOlToc);

		Element elementNavPageList = document.createElement("nav");
		elementSection.appendChild(elementNavPageList);
		elementNavPageList.setAttribute("id", "pageList");
		elementNavPageList.setAttributeNS("http://www.idpf.org/2007/ops",
				"epub:type", "page-list");

		Element elementOlPageList = document.createElement("ol");
		elementNavPageList.appendChild(elementOlPageList);

		int i = 0;
		for (Slide slide : slideShow.slides) {
			i++;

			Element elementLiToc = document.createElement("li");
			elementOlToc.appendChild(elementLiToc);
			elementLiToc.setAttributeNS("http://www.idpf.org/2007/ops",
					"epub:type", "chapter");

			Element elementAToc = document.createElement("a");
			elementLiToc.appendChild(elementAToc);
			elementAToc.setAttribute("href", Epub3FileSet.HTML_FOLDER_NAME
					+ "/" + XHTML.getFileName(i));
			elementAToc.appendChild(document.createTextNode(slide.TITLE));

			if (slide.SUBTITLE != null) {
				Element elementSpan = document.createElement("span");
				elementAToc.appendChild(document.createTextNode(" "));
				elementAToc.appendChild(elementSpan);
				elementSpan.setAttribute("class", "fade smaller");
				elementSpan
						.appendChild(document.createTextNode(slide.SUBTITLE));
			}

			Element elementLiPageList = document.createElement("li");
			elementOlPageList.appendChild(elementLiPageList);
			elementLiPageList.setAttributeNS("http://www.idpf.org/2007/ops",
					"epub:type", "pagebreak");

			Element elementAPageList = document.createElement("a");
			elementLiPageList.appendChild(elementAPageList);
			elementAPageList.setAttribute("href", Epub3FileSet.HTML_FOLDER_NAME
					+ "/" + XHTML.getFileName(i) + "#body");
			elementAPageList.appendChild(document.createTextNode("" + i));
		}
	}
}
