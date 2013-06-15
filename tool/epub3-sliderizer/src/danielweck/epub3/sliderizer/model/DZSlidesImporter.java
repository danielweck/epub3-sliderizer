package danielweck.epub3.sliderizer.model;

import java.io.File;
import java.nio.charset.Charset;
import java.util.ArrayList;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Entities.EscapeMode;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import danielweck.epub3.sliderizer.Epub3FileSet;
import danielweck.xml.XmlDocument;

public class DZSlidesImporter {

	public static void parse(SlideShow slideShow, File file, int verbosity)
			throws Exception {

		boolean xmlSuccess = false;
		Document xmlDocument = null;
		try {
			xmlDocument = XmlDocument.parse(file);
			xmlSuccess = true;
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		boolean soupedUp = false;
		if (xmlDocument == null) {

			StringBuilder strBuilder = XmlDocument.readFileLines(file);
			String wrappedContent = strBuilder.toString();

			org.jsoup.nodes.Document soupDoc = null;
			try {
				soupDoc = Jsoup.parse(wrappedContent,
						"file://" + file.getAbsolutePath());

				soupDoc.outputSettings().prettyPrint(false);
				soupDoc.outputSettings().charset(Charset.forName("UTF-8"));
				soupDoc.outputSettings().escapeMode(EscapeMode.xhtml);
				wrappedContent = soupDoc.outerHtml();
				try {
					xmlDocument = XmlDocument.parse(wrappedContent);
					soupedUp = true;
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		}

		if (xmlDocument == null) {
			throw new Exception(file.getAbsolutePath());
		}

		slideShow.setDimensions(800, 600);

		NodeList list = xmlDocument.getElementsByTagName("title");
		Node title = list.item(0);
		slideShow.TITLE = title.getTextContent();

		list = xmlDocument.getElementsByTagName("link");
		for (int j = 0; j < list.getLength(); j++) {
			Node link = list.item(j);

			Node href_ = link.getAttributes().getNamedItem("href");
			if (href_ == null) {
				continue;
			}
			String href = href_.getNodeValue();

			String ext = Epub3FileSet.getFileExtension(href);
			if (!ext.equalsIgnoreCase("css")) {
				continue;
			}

			if (href.contains("dz-core.css") || href.contains("animate.css")
					|| href.contains("animate.css")) {
				continue;
			}
			if (slideShow.FILES_CSS == null) {
				slideShow.FILES_CSS = "";
			}
			slideShow.FILES_CSS += '\n' + href;
		}

		list = xmlDocument.getElementsByTagName("script");
		for (int j = 0; j < list.getLength(); j++) {
			Node link = list.item(j);

			Node src_ = link.getAttributes().getNamedItem("href");
			if (src_ == null) {
				continue;
			}
			String src = src_.getNodeValue();

			String ext = Epub3FileSet.getFileExtension(src);
			if (!ext.equalsIgnoreCase("js")) {
				continue;
			}

			if (src.contains("dz-core.js") || src.contains("dz-helper.js")
					|| src.contains("highlight.pack.js")) {
				continue;
			}
			if (slideShow.FILES_JS == null) {
				slideShow.FILES_JS = "";
			}
			slideShow.FILES_JS += '\n' + src;
		}

		list = xmlDocument.getElementsByTagName("body");
		Node body = list.item(0);

		list = body.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node section = list.item(j);

			if (section.getNodeType() != Node.ELEMENT_NODE
					|| !section.getNodeName().equals("section")) {
				continue;
			}

			Slide slide = new Slide();
			slideShow.slides.add(slide);

			title = fetchHeading(section);
			if (title != null) {
				slide.TITLE = title.getTextContent();
			}

			ArrayList<String> images = new ArrayList<String>();
			fetchImages(section, images);
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

			StringBuilder content = new StringBuilder();

			NodeList list_ = section.getChildNodes();
			for (int k = 0; k < list_.getLength(); k++) {
				Node node = list_.item(k);

				String fragment = XmlDocument.toString(node, verbosity);
				fragment = fragment.replace(
						"<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "");
				content.append(fragment);
			}

			slide.CONTENT = content.toString();
		}

		slideShow.importedConverted = true;
	}

	private static void fetchImages(Node root, ArrayList<String> images) {
		String name = root.getNodeName();
		if (name.equals("img")) {
			Node src_ = root.getAttributes().getNamedItem("src");
			if (src_ != null) {
				String src = src_.getNodeValue();
				if (!images.contains(src)) {
					images.add(src);
				}
			}
		}

		NodeList list = root.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			fetchImages(node, images);
		}
	}

	private static Node fetchHeading(Node root) {
		String name = root.getNodeName();
		if (name.equals("h1") || name.equals("h2") || name.equals("h3")
				|| name.equals("h4")) {

			return root;
		}

		NodeList list = root.getChildNodes();
		for (int j = 0; j < list.getLength(); j++) {
			Node node = list.item(j);

			if (node.getNodeType() != Node.ELEMENT_NODE) {
				continue;
			}

			Node heading = fetchHeading(node);
			if (heading != null) {
				return heading;
			}
		}

		return null;
	}
}
