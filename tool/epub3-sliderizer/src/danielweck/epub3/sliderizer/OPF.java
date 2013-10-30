package danielweck.epub3.sliderizer;

import java.util.ArrayList;

import javax.xml.XMLConstants;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import danielweck.epub3.sliderizer.model.Slide;
import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class OPF {

	public static String getFileName() {
		return "package.opf";
	}

	public static void create(SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		alreadyAddedManifestItem.clear();
		nNextID = 0;

		final String UID = "UID";
		final String COVER_ID = "cover";

		Document document = XmlDocument.create();

		Element elementPackage = document.createElementNS(
				"http://www.idpf.org/2007/opf", "package");
		document.appendChild(elementPackage);

		elementPackage.setAttribute("version", "3.0");

		if (slideShow.LANGUAGE != null) {
			elementPackage.setAttributeNS(XMLConstants.XML_NS_URI,
					XMLConstants.XML_NS_PREFIX + ":lang", slideShow.LANGUAGE);
		}
		// element_package.setAttribute("dir", "ltr");

		elementPackage
				.setAttribute(
						"prefix",
						"cc: http://creativecommons.org/ns# rendition: http://www.idpf.org/vocab/rendition/# ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/");
		elementPackage.setAttribute("unique-identifier", UID);

		Element elementMetadata = document.createElement("metadata");
		elementPackage.appendChild(elementMetadata);

		elementMetadata.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":dc",
				"http://purl.org/dc/elements/1.1/");
		elementMetadata.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":dcterms",
				"http://purl.org/dc/terms/");

		Element elementMeta_ = document.createElement("meta");
		elementMetadata.appendChild(elementMeta_);
		elementMeta_.setAttribute("property", "dcterms:contributor");
		elementMeta_.appendChild(document
				.createTextNode(Epub3FileSet.GENERATOR));

		if (slideShow.MO_DUR != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("property", "media:duration");
			elementMeta.appendChild(document.createTextNode(slideShow.MO_DUR));
		}

		if (slideShow.MO_ACTIVE != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("property", "media:active-class");
			elementMeta.appendChild(document
					.createTextNode(slideShow.MO_ACTIVE));
		}

		if (slideShow.MO_PLAYBACK_ACTIVE != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("property", "media:playback-active-class");
			elementMeta.appendChild(document
					.createTextNode(slideShow.MO_PLAYBACK_ACTIVE));
		}

		if (slideShow.MO_NARRATOR != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("property", "media:narrator");
			elementMeta.appendChild(document
					.createTextNode(slideShow.MO_NARRATOR));
		}

		if (slideShow.DATE != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("property", "dcterms:modified");
			elementMeta.appendChild(document.createTextNode(slideShow.DATE));
		}

		if (slideShow.COVER != null) {
			Element elementMeta = document.createElement("meta");
			elementMetadata.appendChild(elementMeta);
			elementMeta.setAttribute("name", "cover");
			elementMeta.setAttribute("content", COVER_ID);
		}

		if (slideShow.IDENTIFIER != null) {
			Element elementId = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:identifier");
			elementMetadata.appendChild(elementId);
			elementId.setAttribute("id", UID);
			elementId
					.appendChild(document.createTextNode(slideShow.IDENTIFIER));
		}

		if (slideShow.LANGUAGE != null) {
			Element elementLang = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:language");
			elementMetadata.appendChild(elementLang);
			elementLang
					.appendChild(document.createTextNode(slideShow.LANGUAGE));
		}

		if (slideShow.TITLE != null) {
			Element elementTitle = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:title");
			elementMetadata.appendChild(elementTitle);
			elementTitle.appendChild(document.createTextNode(slideShow.TITLE));
		}

		if (slideShow.SUBJECT != null) {
			Element elementSubject = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:subject");
			elementMetadata.appendChild(elementSubject);
			elementSubject.appendChild(document
					.createTextNode(slideShow.SUBJECT));
		}

		if (slideShow.DESCRIPTION != null) {
			Element elementDesc = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:description");
			elementMetadata.appendChild(elementDesc);
			elementDesc.appendChild(document
					.createTextNode(slideShow.DESCRIPTION));
		}

		if (slideShow.CREATOR != null) {
			Element elementCreator = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:creator");
			elementMetadata.appendChild(elementCreator);
			elementCreator.appendChild(document
					.createTextNode(slideShow.CREATOR));
		}

		if (slideShow.PUBLISHER != null) {
			Element elementPub = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:publisher");
			elementMetadata.appendChild(elementPub);
			elementPub
					.appendChild(document.createTextNode(slideShow.PUBLISHER));
		}

		if (slideShow.RIGHTS != null) {
			Element elementRights = document.createElementNS(
					"http://purl.org/dc/elements/1.1/", "dc:rights");
			elementMetadata.appendChild(elementRights);
			elementRights
					.appendChild(document.createTextNode(slideShow.RIGHTS));
		}

		if (slideShow.LICENSE != null) {
			Element elementLink = document.createElement("link");
			elementMetadata.appendChild(elementLink);
			elementLink.setAttribute("rel", "cc:license");
			elementLink.setAttribute("href", slideShow.LICENSE);
		}

		Element elementMeta = document.createElement("meta");
		elementMetadata.appendChild(elementMeta);
		elementMeta.setAttribute("property", "rendition:layout");
		elementMeta.appendChild(document.createTextNode("pre-paginated"));

		Element elementMeta2 = document.createElement("meta");
		elementMetadata.appendChild(elementMeta2);
		elementMeta2.setAttribute("property", "rendition:orientation");
		elementMeta2.appendChild(document.createTextNode("auto"));

		Element elementMeta3 = document.createElement("meta");
		elementMetadata.appendChild(elementMeta3);
		elementMeta3.setAttribute("property", "rendition:spread");
		elementMeta3.appendChild(document.createTextNode("auto"));

		Element elementMeta4 = document.createElement("meta");
		elementMetadata.appendChild(elementMeta4);
		elementMeta4.setAttribute("property", "media:active-class");
		elementMeta4.appendChild(document
				.createTextNode("-epub-media-overlay-active"));

		Element elementMeta5 = document.createElement("meta");
		elementMetadata.appendChild(elementMeta5);
		elementMeta5.setAttribute("property", "media:narrator");
		elementMeta5.appendChild(document.createTextNode(slideShow.CREATOR)); // TODO

		Element elementMeta6 = document.createElement("meta");
		elementMetadata.appendChild(elementMeta6);
		elementMeta6.setAttribute("property", "ibooks:binding");
		elementMeta6.appendChild(document.createTextNode("false"));

		Element elementManifest = document.createElement("manifest");
		elementPackage.appendChild(elementManifest);

		create_ManifestItem(NavDoc.getFileName(), document, elementManifest,
				"nav", false, ".", "nav scripted");

		create_ManifestItem(NCX.getFileName(), document, elementManifest,
				"ncx", false, ".", null);

		create_ManifestItem("600px.png", document, elementManifest, "px600",
				false, Epub3FileSet.FOLDER_IMG, null);

		create_ManifestItem("back.png", document, elementManifest,
				"background", false, Epub3FileSet.FOLDER_IMG, null);

		create_ManifestItem(slideShow.COVER, document, elementManifest,
				COVER_ID, false, Epub3FileSet.FOLDER_IMG + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, "cover-image");

		create_ManifestItem(
				slideShow.FAVICON,
				document,
				elementManifest,
				"ico",
				false,
				Epub3FileSet.FOLDER_IMG
						+ (slideShow.FAVICON.equals("favicon.ico") ? "" : "/"
								+ Epub3FileSet.FOLDER_CUSTOM), null);

		for (int i = 0; i < Epub3FileSet.JSs.length; i++) {
			String filename = Epub3FileSet.JSs[i].FILE;
			String id = Epub3FileSet.JSs[i].ID;

			create_ManifestItem(filename, document, elementManifest, id, false,
					Epub3FileSet.FOLDER_JS, null);
		}

		for (int i = 0; i < Epub3FileSet.JSs_OPF_ONLY.length; i++) {
			String filename = Epub3FileSet.JSs_OPF_ONLY[i].FILE;
			String id = Epub3FileSet.JSs_OPF_ONLY[i].ID;

			create_ManifestItem(filename, document, elementManifest, id, false,
					Epub3FileSet.FOLDER_JS, null);
		}

		for (int i = 0; i < Epub3FileSet.FONT_FILENAMES.length; i++) {
			String filename = Epub3FileSet.FONT_FILENAMES[i][0];
			String id = Epub3FileSet.FONT_FILENAMES[i][1];

			create_ManifestItem(filename, document, elementManifest, id, false,
					Epub3FileSet.FOLDER_HTML + "/" + Epub3FileSet.FOLDER_FONTS,
					null);
		}

		for (int i = 0; i < Epub3FileSet.CSSs.length; i++) {
			String filename = Epub3FileSet.CSSs[i].FILE;
			String id = Epub3FileSet.CSSs[i].ID;

			create_ManifestItem(filename, document, elementManifest, id, false,
					Epub3FileSet.FOLDER_CSS, null);
		}

		create_ManifestItem(Epub3FileSet.CSS_NAVDOC.FILE, document,
				elementManifest, Epub3FileSet.CSS_NAVDOC.ID, false,
				Epub3FileSet.FOLDER_CSS, null);

		create_ManifestItem(Epub3FileSet.CSS_FONTS.FILE, document,
				elementManifest, Epub3FileSet.CSS_FONTS.ID, false,
				Epub3FileSet.FOLDER_HTML + "/" + Epub3FileSet.FOLDER_FONTS,
				null);

		create_ManifestItem(slideShow.LOGO, document, elementManifest, "logo",
				false, Epub3FileSet.FOLDER_IMG + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.TOUCHICON, document, elementManifest,
				"touchicon", false, Epub3FileSet.FOLDER_IMG + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.FILES_CSS, document, elementManifest,
				"css", true, Epub3FileSet.FOLDER_CSS + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.FILES_JS, document, elementManifest,
				"js", true, Epub3FileSet.FOLDER_JS + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.FILES_IMG, document, elementManifest,
				"img", true, Epub3FileSet.FOLDER_IMG + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.FILES_FONT, document, elementManifest,
				"font", true, Epub3FileSet.FOLDER_HTML + "/"
						+ Epub3FileSet.FOLDER_FONTS + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		create_ManifestItem(slideShow.BACKGROUND_IMG, document,
				elementManifest, "img", true, Epub3FileSet.FOLDER_IMG + "/"
						+ Epub3FileSet.FOLDER_CUSTOM, null);

		Element elementSpine = document.createElement("spine");
		elementPackage.appendChild(elementSpine);
		elementSpine.setAttribute("toc", "ncx");
		if (slideShow.PAGE_DIR != null) {
			elementSpine.setAttribute("page-progression-direction",
					slideShow.PAGE_DIR);
		}

		// TODO
		Element elementItemRef = document.createElement("itemref");
		elementSpine.appendChild(elementItemRef);
		elementItemRef.setAttribute("idref", "nav");
		elementItemRef.setAttribute("properties", "page-spread-right");

		if (slideShow.MO_AUDIO_FILES != null) {
			create_ManifestItem(slideShow.MO_AUDIO_FILES, document,
					elementManifest, "mo-audio", true, Epub3FileSet.FOLDER_MO,
					null);
			Epub3FileSet
					.handleFiles(slideShow, pathEpubFolder,
							Epub3FileSet.FOLDER_MO, slideShow.MO_AUDIO_FILES,
							verbosity);
		}

		boolean left = true;
		int n = 0;
		for (Slide slide : slideShow.slides) {
			n++;
			// String nStr = String.format("0\1", n);
			String nStr = n <= 9 ? "0" + n : "" + n;
			String id = "page_" + nStr;

			String htmlFileName = XHTML.getFileName(n);

			Element elementItem = create_ManifestItem(htmlFileName, document,
					elementManifest, id, false, Epub3FileSet.FOLDER_HTML,
					"scripted" + (slide.containsSVG ? " svg" : "")
							+ (slide.containsMATHML ? " math" : ""));

			String smilId = id + "_mo";

			if (slide.MO_SMIL != null) {
				String smilFile = id + ".smil";

				elementItem.setAttribute("media-overlay", smilId);

				create_ManifestItem(smilFile, document, elementManifest,
						smilId, false, Epub3FileSet.FOLDER_MO, null);

				createSMIL(htmlFileName, pathEpubFolder, smilFile, slideShow,
						slide, verbosity);
			}

			if (slide.MO_DUR != null) {
				Element elementMeta7 = document.createElement("meta");
				elementMetadata.appendChild(elementMeta7);
				elementMeta7.setAttribute("property", "media:duration");
				elementMeta7.setAttribute("refines", "#" + smilId);
				elementMeta7.appendChild(document.createTextNode(slide.MO_DUR));
			}

			if (slide.NOTES != null) {
				create_ManifestItem(XHTML.getFileName_Notes(n), document,
						elementManifest, id.replaceAll("page_", "page_Notes"),
						false, Epub3FileSet.FOLDER_HTML, "scripted");
			}

			create_ManifestItem(slide.FILES_CSS, document, elementManifest,
					"css", true, Epub3FileSet.FOLDER_CSS + "/"
							+ Epub3FileSet.FOLDER_CUSTOM, null);

			create_ManifestItem(slide.FILES_JS, document, elementManifest,
					"js", true, Epub3FileSet.FOLDER_JS + "/"
							+ Epub3FileSet.FOLDER_CUSTOM, null);

			create_ManifestItem(slide.FILES_IMG, document, elementManifest,
					"img", true, Epub3FileSet.FOLDER_IMG + "/"
							+ Epub3FileSet.FOLDER_CUSTOM, null);

			create_ManifestItem(slide.FILES_FONT, document, elementManifest,
					"img", true, Epub3FileSet.FOLDER_HTML + "/"
							+ Epub3FileSet.FOLDER_FONTS + "/"
							+ Epub3FileSet.FOLDER_CUSTOM, null);

			create_ManifestItem(slide.BACKGROUND_IMG, document,
					elementManifest, "img", true, Epub3FileSet.FOLDER_IMG + "/"
							+ Epub3FileSet.FOLDER_CUSTOM, null);

			elementItemRef = document.createElement("itemref");
			elementSpine.appendChild(elementItemRef);
			elementItemRef.setAttribute("idref", id);
			elementItemRef.setAttribute("properties", left ? "page-spread-left"
					: "page-spread-right");
			//
			// if (false && slide.NOTES != null) {
			// elementItemRef = document.createElement("itemref");
			// elementSpine.appendChild(elementItemRef);
			// elementItemRef.setAttribute("idref",
			// id.replaceAll("page_", "page_Notes"));
			// elementItemRef.setAttribute("properties",
			// "rendition:layout-reflowable");
			// elementItemRef.setAttribute("linear", "no");
			// }

			left = !left;
		}

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}

	private static void createSMIL(String htmlFileName, String pathEpubFolder,
			String smilFile, SlideShow slideShow, Slide slide, int verbosity)
			throws Exception {

		if (slide.MO_SMIL == null) {
			return;
		}

		Document document = XmlDocument.create();

		Element elementSmil = document.createElementNS(
				"http://www.w3.org/ns/SMIL", "smil");
		document.appendChild(elementSmil);

		elementSmil.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
				XMLConstants.XMLNS_ATTRIBUTE + ":epub",
				"http://www.idpf.org/2007/ops");

		elementSmil.setAttribute("version", "3.0");

		Element elementBody = document.createElement("body");
		elementSmil.appendChild(elementBody);

		// elementSeq.setAttributeNS("http://www.idpf.org/2007/ops",
		// "epub:textref", "../" + Epub3FileSet.HTML_FOLDER_NAME + "/p"
		// + nStr + ".xhtml#body");

		final String MARK_TEXT = "TXT ";
		final String MARK_AUDIO = "AUDIO ";
		final String MARK_BEGIN = "BEGIN ";
		final String MARK_END = "END ";

		String currentText = null;
		String currentAudio = null;
		String currentBegin = "0";
		String currentEnd = null;

		// ArrayList<String> array = Epub3FileSet.splitPaths(slide.MO_SMIL);
		String[] array = slide.MO_SMIL.split("\n");
		for (int i = 0; i < array.length; i++) {
			String line = array[i];
			if (line.trim().isEmpty()) {
				continue;
			}

			if (line.startsWith(MARK_AUDIO)) {
				currentAudio = line.substring(MARK_AUDIO.length(),
						line.length());
			}
			if (line.startsWith(MARK_TEXT)) {
				currentText = line.substring(MARK_TEXT.length(), line.length());
			}
			if (line.startsWith(MARK_BEGIN)) {
				currentBegin = line.substring(MARK_BEGIN.length(),
						line.length());
			}
			if (line.startsWith(MARK_END)) {
				currentEnd = line.substring(MARK_END.length(), line.length());
			}

			if (currentText != null && currentAudio != null
					&& currentBegin != null && currentEnd != null) {
				Element elementPar = document.createElement("par");
				elementBody.appendChild(elementPar);

				Element elementText = document.createElement("text");
				elementPar.appendChild(elementText);

				Element elementAudio = document.createElement("audio");
				elementPar.appendChild(elementAudio);

				elementText.setAttribute("src", "../"
						+ Epub3FileSet.FOLDER_HTML + '/' + htmlFileName
						+ currentText);

				elementAudio.setAttribute("src", currentAudio);

				elementAudio.setAttribute("clipBegin", currentBegin);
				elementAudio.setAttribute("clipEnd", currentEnd);

				currentText = null;
				currentBegin = currentEnd;
				currentEnd = null;
				// currentAudio = null;
			}
		}

		XmlDocument.save(document, pathEpubFolder + '/'
				+ Epub3FileSet.FOLDER_MO + '/' + smilFile, verbosity);
	}

	private static ArrayList<String> alreadyAddedManifestItem = new ArrayList<String>();

	private static Element create_ManifestItem(String paths, Document document,
			Element elementManifest, String id, boolean idPrefixOnly,
			String destFolder, String properties) {
		if (paths == null) {
			return null;
		}

		Element elementItem = null;

		ArrayList<String> array = Epub3FileSet.splitPaths(paths);
		for (String path : array) {

			String ref = path;
			if (destFolder != null && !destFolder.equals(".")) {
				ref = destFolder + "/" + path;
			}

			if (alreadyAddedManifestItem.contains(ref)) {
				continue;
			}
			alreadyAddedManifestItem.add(ref);

			elementItem = document.createElement("item");
			elementManifest.appendChild(elementItem);
			elementItem.setAttribute("id", id == null ? getNextID(null)
					: (idPrefixOnly ? getNextID(id) : id));
			elementItem.setAttribute("href", ref);
			elementItem.setAttribute("media-type",
					Epub3FileSet.getMediaType(path));

			if (properties != null) {
				elementItem.setAttribute("properties", properties);
			}
		}

		return elementItem;
	}

	private static int nNextID = 0;

	private static String getNextID(String prefix) {
		return (prefix == null ? "id" : prefix) + "_"
				+ String.format("%03d", nNextID++);
	}
}
