package danielweck.epub3.sliderizer;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.StringWriter;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class NavDoc {

	public static String getFileName() {
		return "nav.xhtml";
	}

	public static void create(MustacheFactory mustacheFactory,
			File template_Nav, SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		if (template_Nav != null && !template_Nav.exists()) {
			throw new FileNotFoundException(template_Nav.getAbsolutePath());
		}

		Mustache mustacheNav = null;
		if (template_Nav != null) {
			try {
				Mustache mustache = mustacheFactory
						.compile(Epub3FileSet.TEMPLATE_NAV);
				mustacheNav = mustache;
			} catch (Exception ex) {
				System.out.println(" ");
				System.out.println("}}}}} INVALID MUSTACHE TEMPLATE!!!! "
						+ template_Nav.getAbsolutePath());
				ex.printStackTrace();
			}
		}

		Document document = null;

		if (mustacheNav != null) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE OK [NAV DOC]: "
						+ template_Nav.getAbsolutePath());
			}
			StringWriter stringWriter = new StringWriter();
			try {
				mustacheNav.execute(stringWriter, slideShow);
			} catch (Exception ex) {
				stringWriter = null;
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE ERROR!!!! "
						+ template_Nav.getAbsolutePath());
				ex.printStackTrace();
			}
			if (stringWriter != null) {
				stringWriter.flush();
				String src = stringWriter.toString();
				document = XmlDocument.parse(src);
			}
		}

		if (document == null) {
			throw new FileNotFoundException(Epub3FileSet.FOLDER_TEMPLATES + "/"
					+ Epub3FileSet.TEMPLATE_NAV);
			//
			// document = XmlDocument.create();
			//
			// Element elementSection = XHTML.create_Boilerplate(document, null,
			// slideShow, pathEpubFolder, verbosity, false);
			//
			// create_ContentFragment(elementSection, document, slideShow,
			// pathEpubFolder, verbosity);
			//
			// if (slideShow.NOTES != null) {
			// Element elementNotes = document.createElement("div");
			// elementSection.getParentNode().appendChild(elementNotes);
			// elementNotes.setAttribute("id", "epb3sldrzr-notes");
			// //
			// elementNotes.appendChild(document.createTextNode("SLIDE NOTES:"));
			// XHTML.create_Content(elementNotes, document, slideShow.NOTES,
			// slideShow, null, pathEpubFolder, verbosity);
			// }
		}

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}
	//
	// private static void create_ContentFragment(Element elementSection,
	// Document document, SlideShow slideShow, String pathEpubFolder,
	// int verbosity) throws Exception {
	//
	// Element elementNavToc = document.createElement("nav");
	// elementSection.appendChild(elementNavToc);
	// elementNavToc.setAttribute("id", "epb3sldrzr-toc");
	// elementNavToc.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:type", "toc");
	//
	// Element elementOlToc = document.createElement("ol");
	// elementNavToc.appendChild(elementOlToc);
	//
	// Element elementNavPageList = document.createElement("nav");
	// elementSection.appendChild(elementNavPageList);
	// elementNavPageList.setAttribute("id", "epb3sldrzr-pageList");
	// elementNavPageList.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:type", "page-list");
	//
	// Element elementOlPageList = document.createElement("ol");
	// elementNavPageList.appendChild(elementOlPageList);
	//
	// int i = 0;
	// for (Slide slide : slideShow.slides) {
	// i++;
	//
	// Element elementLiToc = document.createElement("li");
	// elementOlToc.appendChild(elementLiToc);
	// elementLiToc.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:type", "chapter");
	//
	// Element elementAToc = document.createElement("a");
	// elementLiToc.appendChild(elementAToc);
	// elementAToc.setAttribute("href", Epub3FileSet.FOLDER_HTML + "/"
	// + XHTML.getFileName(i));
	// elementAToc.appendChild(document.createTextNode(slide.TITLE));
	//
	// if (slide.SUBTITLE != null) {
	// Element elementSpan = document.createElement("span");
	// elementAToc.appendChild(document.createTextNode(" "));
	// elementAToc.appendChild(elementSpan);
	// // elementSpan.setAttribute("class", "fade");
	// elementSpan
	// .appendChild(document.createTextNode(slide.SUBTITLE));
	// }
	//
	// Element elementLiPageList = document.createElement("li");
	// elementOlPageList.appendChild(elementLiPageList);
	// elementLiPageList.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:type", "pagebreak");
	//
	// Element elementAPageList = document.createElement("a");
	// elementLiPageList.appendChild(elementAPageList);
	// elementAPageList.setAttribute("href", Epub3FileSet.FOLDER_HTML
	// + "/" + XHTML.getFileName(i) + "#epb3sldrzr-title");
	// elementAPageList.appendChild(document.createTextNode("" + i));
	// }
	// }
}
