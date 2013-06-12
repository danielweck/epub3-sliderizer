package danielweck.epub3.sliderizer.model;

import java.io.File;
import java.util.ArrayList;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import danielweck.xml.XmlDocument;

public final class EPubImporter {

	public static void parse(SlideShow slideShow, File file, int verbosity)
			throws Exception {
		Document xmlDocument = XmlDocument.parse(file);

		NodeList list = xmlDocument.getElementsByTagName("metadata");
		Node metadata = list.item(0);

		list = metadata.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			String trimmed = node.getTextContent();
			if (trimmed != null) {
				trimmed = trimmed.trim();

				if (trimmed.isEmpty()) {
					continue;
				}
			} else {
				continue;
			}

			if (node.getNamespaceURI().equals(
					"http://purl.org/dc/elements/1.1/")) {

				if (node.getLocalName().equals("title")) {
					slideShow.TITLE = trimmed;
				} else if (node.getLocalName().equals("creator")) {
					slideShow.CREATOR = trimmed;
				} else if (node.getLocalName().equals("identifier")) {
					slideShow.IDENTIFIER = trimmed;
				} else if (node.getLocalName().equals("language")) {
					slideShow.LANGUAGE = trimmed;
				}
			} else if (node.getNodeName().equals("meta")) {

				Node property = node.getAttributes().getNamedItem("property");
				if (property != null) {
					if (property.getNodeValue().equals("dcterms:modified")) {
						slideShow.DATE = trimmed;
					}
				}
			}
		}

		ArrayList<String> idrefs = new ArrayList<String>();

		ArrayList<String> images = new ArrayList<String>();

		list = xmlDocument.getElementsByTagName("spine");
		Node spine = list.item(0);
		list = spine.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			if (!node.getNodeName().equals("itemref")) {
				continue;
			}

			Node idref = node.getAttributes().getNamedItem("idref");
			if (idref != null) {
				idrefs.add(idref.getNodeValue());
			}
		}

		list = xmlDocument.getElementsByTagName("manifest");
		Node manifest = list.item(0);
		list = manifest.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			if (!node.getNodeName().equals("item")) {
				continue;
			}

			Node href = node.getAttributes().getNamedItem("href");
			if (href == null) {
				continue;
			}

			Node properties = node.getAttributes().getNamedItem("properties");
			if (properties != null) {
				if (properties.getNodeValue().contains("nav")) {
					continue;
				}
				if (properties.getNodeValue().contains("cover-image")) {
					slideShow.COVER = href.getNodeValue();
					continue;
				}
			}

			Node mediaType = node.getAttributes().getNamedItem("media-type");
			if (mediaType != null) {
				if (mediaType.getNodeValue().equals("text/css")) {
					if (slideShow.FILES_CSS == null) {
						slideShow.FILES_CSS = "";
					}
					slideShow.FILES_CSS += '\n' + href.getNodeValue();
					continue;
				}
				if (mediaType.getNodeValue().equals("text/javascript")) {
					if (slideShow.FILES_JS == null) {
						slideShow.FILES_JS = "";
					}
					slideShow.FILES_JS += '\n' + href.getNodeValue();
					continue;
				}
				if (mediaType.getNodeValue().equals("image/png")
						|| mediaType.getNodeValue().equals("image/jpeg")
						|| mediaType.getNodeValue().equals("image/gif")) {

					images.add(href.getNodeValue());
					continue;
				}
				if (mediaType.getNodeValue().equals("image/vnd.microsoft.icon")) {

					slideShow.FAVICON = href.getNodeValue();
					continue;
				}
			}

			Node id = node.getAttributes().getNamedItem("id");
			if (id != null) {
				int i = idrefs.indexOf(id.getNodeValue());
				if (i >= 0) {
					idrefs.set(i, href.getNodeValue());
				}
			}
		}

		int width = -1;
		int height = -1;

		for (String path : idrefs) {
			String xhtmlPath = slideShow.getBaseFolderPath() + '/' + path;
			File xhtmlFile = new File(xhtmlPath);
			if (xhtmlFile.exists()) {

				StringBuilder content = new StringBuilder();

				Document xhtmlDocument = XmlDocument.parse(xhtmlFile);

				Slide slide = new Slide();

				list = xhtmlDocument.getElementsByTagNameNS(
						"http://www.w3.org/2000/svg", "svg");
				if (list != null && list.getLength() > 0) {
					slide.containsSVG = true;
				}

				list = xhtmlDocument.getElementsByTagNameNS(
						"http://www.w3.org/1998/Math/MathML", "math");
				if (list != null && list.getLength() > 0) {
					slide.containsMATHML = true;
				}

				if (width == -1 || height == -1) {
					list = xhtmlDocument.getDocumentElement().getChildNodes();
					for (int j = 0; j < list.getLength(); j++) {
						Node node = list.item(j);

						if (node.getNodeType() != Node.ELEMENT_NODE) {
							continue;
						}

						if (!node.getNodeName().equals("head")) {
							continue;
						}

						list = node.getChildNodes();
						for (int i = 0; i < list.getLength(); i++) {
							node = list.item(i);

							if (node.getNodeType() != Node.ELEMENT_NODE) {
								continue;
							}
							if (!node.getNodeName().equals("meta")) {
								continue;
							}

							boolean viewport = false;

							NamedNodeMap attrs = node.getAttributes();
							for (int k = 0; k < attrs.getLength(); k++) {

								Node attr = attrs.item(k);

								String attrVal = attr.getNodeValue();

								String attrName = attr.getLocalName();
								if (attrName == null) {
									attrName = attr.getNodeName();
								}

								if (attrName.equals("name")
										&& attrVal.equals("viewport")) {
									viewport = true;
									break;
								}
							}

							if (!viewport) {
								continue;
							}

							for (int k = 0; k < attrs.getLength(); k++) {

								Node attr = attrs.item(k);

								String attrVal = attr.getNodeValue();

								String attrName = attr.getLocalName();
								if (attrName == null) {
									attrName = attr.getNodeName();
								}

								if (attrName.equals("content")) {

									String[] vals = attrVal.split(",");

									for (String val : vals) {

										if (val.contains("width")) {

											val = val.replaceAll("width", "");
											val = val.replace('=', ' ');
											val = val.trim();
											width = Integer
													.parseInt(val.trim());
										} else if (val.contains("height")) {
											val = val.replaceAll("height", "");
											val = val.replace('=', ' ');
											val = val.trim();
											height = Integer.parseInt(val
													.trim());
										}
									}

									break;
								}
							}
						}
					}
				}

				list = xhtmlDocument.getElementsByTagName("body");
				Node body = list.item(0);
				list = body.getChildNodes();
				for (int j = 0; j < list.getLength(); j++) {
					Node node = list.item(j);

					// if (node.getNodeType() != Node.ELEMENT_NODE) {
					// continue;
					// }

					String fragment = XmlDocument.toString(node, verbosity);
					fragment = fragment.replace(
							"<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");
					content.append(fragment);
				}

				slide.CONTENT = content.toString();

				slideShow.slides.add(slide);

				// TODO: parse inline head CSS 
				// TODO: IMG, CSS, JS references (need to match OPF relative
				// location)
			}
		}

		if (width != -1 && height != -1) {

			int originalWidth = Integer.parseInt(slideShow.VIEWPORT_WIDTH);

			float ratio = originalWidth / (float) width;

			int originalFontSize = Integer.parseInt(slideShow.FONT_SIZE);

			float size = originalFontSize / ratio;

			slideShow.FONT_SIZE = "" + Math.ceil(size);

			slideShow.VIEWPORT_WIDTH = "" + width;
			slideShow.VIEWPORT_HEIGHT = "" + height;
		}
		//
		// for (Slide slide : slideShow.slides) {
		// if (slide.CSS_STYLE == null) {
		// slide.CSS_STYLE = "";
		// }
		// slide.CSS_STYLE +=
		// "\n\nh1#epb3sldrzr-title,\nh1#epb3sldrzr-title-NOTES\n{\nposition: absolute; left: 0; top: 0; right: 0; display: none; \n}\n\n";
		// slide.CSS_STYLE += "\n\nbody{font-size: " + slideShow.FONT_SIZE
		// + "px !important;}\n\n";
		// slide.CSS_STYLE +=
		// "\n\n#epb3sldrzr-content,#epb3sldrzr-content-NOTES{font-size: 100% !important;}h1#epb3sldrzr-title,h1#epb3sldrzr-title-NOTES{font-size: 150% !important;}a#epb3sldrzr-link-noteback,a#epb3sldrzr-link-notesref,a#epb3sldrzr-link-previous,a#epb3sldrzr-link-next,a#epb3sldrzr-link-toc,a#epb3sldrzr-link-epubReadingSystem{	font-size: 50% !important;}ol li:before{font-size: 70% !important;}#epb3sldrzr-content div.boxed > h3,#epb3sldrzr-content-NOTES div.boxed > h3{font-size: 80% !important;}.code{font-size: 70% !important;}\n\n";
		// slide.CSS_STYLE +=
		// "\n\ndiv#epb3sldrzr-root-NOTES,div#epb3sldrzr-root{overflow:hidden;}\n\n";
		// }

		Slide slide = slideShow.slides.get(0);
		if (slide != null) {
			for (String path : images) {
				String imagePath = slideShow.getBaseFolderPath() + '/' + path;
				File imageFile = new File(imagePath);
				if (imageFile.exists()) {
					if (slide.FILES_IMG == null) {
						slide.FILES_IMG = "";
					}
					slide.FILES_IMG += '\n' + path;
				}
			}
		}

		slideShow.importedConverted = true;
	}
}
