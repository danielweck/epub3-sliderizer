package danielweck.xml;

import java.io.File;
import java.io.FileOutputStream;
import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;

public final class XmlDocument {

	private static DocumentBuilder documentBuilder = null;

	public static DocumentBuilder getDocumentBuilder() throws Exception {
		if (documentBuilder == null) {
			DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory
					.newInstance();
			documentBuilderFactory.setNamespaceAware(true);
			// documentBuilderFactory.setIgnoringElementContentWhitespace(true);

			documentBuilder = documentBuilderFactory.newDocumentBuilder();
		}
		return documentBuilder;
	}

	public static Document parse(String xmlStr) throws Exception {
		DocumentBuilder documentBuilder = getDocumentBuilder();

		// new ByteArrayInputStream("<node>value</node>".getBytes())
		InputSource inputSource = new InputSource(new StringReader(xmlStr));
		Document document = documentBuilder.parse(inputSource);
		return document;
	}

	public static Document create() throws Exception {
		DocumentBuilder documentBuilder = getDocumentBuilder();

		Document document = documentBuilder.newDocument();
		return document;
	}

	private static Transformer transformer = null;

	public static Transformer getTransformer(int verbosity) throws Exception {
		if (transformer == null) {
			TransformerFactory transformerFactory = TransformerFactory
					.newInstance();
			transformerFactory.setAttribute("indent-number", new Integer(2));

			transformer = transformerFactory.newTransformer();

			// transformer.setOutputProperty(OutputKeys.DOCTYPE_SYSTEM,
			// "testing.dtd");
			transformer.setOutputProperty(OutputKeys.INDENT,
					verbosity > 2 ? "yes" : "no");
			transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			transformer.setOutputProperty(OutputKeys.METHOD, "xml");
			transformer.setOutputProperty(
					"{http://xml.apache.org/xslt}indent-amount", "2");
		}
		return transformer;
	}

	public static void save(Document document, String filePath, int verbosity)
			throws Exception {

		if (verbosity > 0) {
			System.out.println("----- XML file created: " + filePath);
		}

		Transformer transformer = getTransformer(verbosity);

		DOMSource domSource = new DOMSource(document);

		FileOutputStream fileOutputStream = null;
		try {
			File fileDst = new File(filePath);
			fileDst.getParentFile().mkdirs();

			fileOutputStream = new FileOutputStream(filePath);
			StreamResult streamResult = new StreamResult(fileOutputStream);

			transformer.transform(domSource, streamResult);
		} finally {
			if (fileOutputStream != null) {
				fileOutputStream.close();
			}
		}

		if (verbosity > 2) {
			// new OutputStreamWriter(out, "utf-8")
			StreamResult streamResultDEBUG = new StreamResult(System.out);
			transformer.transform(domSource, streamResultDEBUG);
		}
	}
}
