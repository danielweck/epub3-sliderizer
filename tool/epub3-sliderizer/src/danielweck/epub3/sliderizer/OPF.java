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
		elementMeta_.appendChild(document.createTextNode(Epub3FileSet.THIS));

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
				false, Epub3FileSet.IMG_FOLDER_NAME, null);

		create_ManifestItem("back.png", document, elementManifest,
				"background", false, Epub3FileSet.IMG_FOLDER_NAME, null);

		create_ManifestItem(slideShow.COVER, document, elementManifest,
				COVER_ID, false, Epub3FileSet.IMG_FOLDER_NAME + "/"
						+ Epub3FileSet.CUSTOM_FOLDER_NAME, "cover-image");

		create_ManifestItem(
				slideShow.FAVICON,
				document,
				elementManifest,
				"ico",
				false,
				Epub3FileSet.IMG_FOLDER_NAME
						+ (slideShow.FAVICON.equals("favicon.ico") ? "" : "/"
								+ Epub3FileSet.CUSTOM_FOLDER_NAME), null);

		create_ManifestItem(Epub3FileSet.JS_DEFAULT_NAME, document,
				elementManifest, "js-default", false,
				Epub3FileSet.JS_FOLDER_NAME, null);

		create_ManifestItem(Epub3FileSet.JS_SCREENFULL_NAME, document,
				elementManifest, "js-screenfull", false,
				Epub3FileSet.JS_FOLDER_NAME, null);

		create_ManifestItem(Epub3FileSet.JS_CLASSLIST_NAME, document,
				elementManifest, "js-classList", false,
				Epub3FileSet.JS_FOLDER_NAME, null);

		// create_ManifestItem(Epub3FileSet.JS_HISTORY_NAME, document,
		// elementManifest, "js-history", false,
		// Epub3FileSet.JS_FOLDER_NAME, null);
		//
		// create_ManifestItem(Epub3FileSet.JS_JSON_NAME, document,
		// elementManifest, "js-json", false,
		// Epub3FileSet.JS_FOLDER_NAME, null);

		create_ManifestItem(Epub3FileSet.CSS_DEFAULT_NAME, document,
				elementManifest, "css-default", false,
				Epub3FileSet.CSS_FOLDER_NAME, null);

		create_ManifestItem(Epub3FileSet.CSS_ANIMATE_NAME, document,
				elementManifest, "css-animate", false,
				Epub3FileSet.CSS_FOLDER_NAME, null);

		create_ManifestItem(slideShow.LOGO, document, elementManifest, "logo",
				false, Epub3FileSet.IMG_FOLDER_NAME + "/"
						+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

		create_ManifestItem(slideShow.FILES_CSS, document, elementManifest,
				"css", true, Epub3FileSet.CSS_FOLDER_NAME + "/"
						+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

		create_ManifestItem(slideShow.FILES_JS, document, elementManifest,
				"js", true, Epub3FileSet.JS_FOLDER_NAME + "/"
						+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

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

		// int totalMODuration = 0;

		boolean left = true;
		int n = 0;
		for (Slide slide : slideShow.slides) {
			n++;
			// String nStr = String.format("0\1", n);
			String nStr = n <= 9 ? "0" + n : "" + n;
			String id = "page_" + nStr;

			create_ManifestItem(XHTML.getFileName(n), document,
					elementManifest, id, false, Epub3FileSet.HTML_FOLDER_NAME,
					"scripted");

			if (slide.NOTES != null) {
				create_ManifestItem(XHTML.getFileName_Notes(n), document,
						elementManifest, id.replaceAll("page_", "page_Notes"),
						false, Epub3FileSet.HTML_FOLDER_NAME, "scripted");
			}

			create_ManifestItem(slide.FILES_CSS, document, elementManifest,
					"css", true, Epub3FileSet.CSS_FOLDER_NAME + "/"
							+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

			create_ManifestItem(slide.FILES_JS, document, elementManifest,
					"js", true, Epub3FileSet.JS_FOLDER_NAME + "/"
							+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

			create_ManifestItem(slide.FILES_IMG, document, elementManifest,
					"img", true, Epub3FileSet.IMG_FOLDER_NAME + "/"
							+ Epub3FileSet.CUSTOM_FOLDER_NAME, null);

			//
			// if (slide.MO_SYNC != null) {
			// elementItem.setAttribute("media-overlay", "smil_" + nStr);
			//
			// elementItem = document.createElement("item");
			// elementManifest.appendChild(elementItem);
			// elementItem.setAttribute("id", "smil_" + nStr);
			// String smilFile = "s" + nStr + ".smil";
			// createSMIL(pathEpubFolder, smilFile, n, slide);
			// elementItem.setAttribute("href", "mo/" + smilFile);
			// elementItem.setAttribute("media-type", "application/smil+xml");
			// }
			//
			// if (slide.MO_AUDIO != null) {
			// elementItem = document.createElement("item");
			// elementManifest.appendChild(elementItem);
			// elementItem.setAttribute("id", "audio_" + nStr);
			// // TODO: copy audio file
			// String audioFile = "a" + nStr + "(" + slide.MO_AUDIO + ").mp3";
			// elementItem.setAttribute("href", "mo/" + audioFile);
			// elementItem.setAttribute("media-type", "audio/mpeg");
			// }
			//
			// if (slide.MO_DURATION != null) {
			// Element elementMeta1 = document.createElement("meta");
			// elementMetadata.appendChild(elementMeta1);
			// elementMeta1.setAttribute("property", "media:duration");
			// elementMeta1.setAttribute("refines", "#smil_" + nStr);
			// elementMeta1.appendChild(document
			// .createTextNode(slide.MO_DURATION));
			//
			// totalMODuration += 1000; // TODO
			// }

			elementItemRef = document.createElement("itemref");
			elementSpine.appendChild(elementItemRef);
			elementItemRef.setAttribute("idref", id);
			elementItemRef.setAttribute("properties", left ? "page-spread-left"
					: "page-spread-right");

			if (false && slide.NOTES != null) {
				elementItemRef = document.createElement("itemref");
				elementSpine.appendChild(elementItemRef);
				elementItemRef.setAttribute("idref",
						id.replaceAll("page_", "page_Notes"));
				elementItemRef.setAttribute("properties",
						"rendition:layout-reflowable");
				elementItemRef.setAttribute("linear", "no");
			}

			left = !left;
		}

		// if (totalMODuration > 0) {
		// Element elementMeta6 = document.createElement("meta");
		// elementMetadata.appendChild(elementMeta6);
		// elementMeta6.setAttribute("property", "media:duration");
		// elementMeta6.appendChild(document.createTextNode("0:0:0.000")); //
		// TODO:
		// // format
		// // totalMODuration
		// // (milliseconds)
		// }

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}

	//
	// private void createSMIL(String pathEpubFolder, String fileName, int n,
	// Slide slide) throws Exception {
	//
	// // String nStr = String.format("0\1", n);
	// String nStr = n <= 9 ? "0" + n : "" + n;
	//
	// Document document = XmlDocument.create();
	//
	// Element elementSmil = document.createElementNS(
	// "http://www.w3.org/ns/SMIL", "smil");
	// document.appendChild(elementSmil);
	//
	// elementSmil.setAttributeNS(XMLConstants.XMLNS_ATTRIBUTE_NS_URI,
	// XMLConstants.XMLNS_ATTRIBUTE + ":epub",
	// "http://www.idpf.org/2007/ops");
	//
	// elementSmil.setAttribute("version", "3.0");
	//
	// Element elementBody = document.createElement("body");
	// elementSmil.appendChild(elementBody);
	//
	// Element elementSeq = document.createElement("seq");
	// elementBody.appendChild(elementSeq);
	// elementSeq.setAttributeNS("http://www.idpf.org/2007/ops",
	// "epub:textref", "../"+Epub3FileSet.HTML_FOLDER_NAME+"/p" + nStr +
	// ".xhtml#body");
	//
	// // TODO: par + text/audio
	//
	// XmlDocument.save(document, pathEpubFolder + "/mo/" + fileName,
	// verbosity);
	// }

	private static ArrayList<String> alreadyAddedManifestItem = new ArrayList<String>();

	private static void create_ManifestItem(String paths, Document document,
			Element elementManifest, String id, boolean idPrefixOnly,
			String destFolder, String properties) {
		if (paths == null) {
			return;
		}

		ArrayList<String> array = Epub3FileSet.splitPaths(paths);
		for (String path : array) {

			String ref = destFolder + "/" + path;
			if (alreadyAddedManifestItem.contains(ref)) {
				continue;
			}
			alreadyAddedManifestItem.add(ref);

			Element elementItem = document.createElement("item");
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
	}

	private static int nNextID = 0;

	private static String getNextID(String prefix) {
		return (prefix == null ? "id" : prefix) + "_"
				+ String.format("%03d", nNextID++);
	}
}
