package danielweck.epub3.sliderizer;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.StringWriter;

import org.w3c.dom.Document;

import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;

import danielweck.epub3.sliderizer.model.SlideShow;
import danielweck.xml.XmlDocument;

public final class Print {

	public static String getFileName() {
		return "print" + Epub3FileSet.XHTML_EXT;
	}

	public static void create(MustacheFactory mustacheFactory,
			File template_Print, SlideShow slideShow, String pathEpubFolder,
			int verbosity) throws Exception {

		if (template_Print != null && !template_Print.exists()) {
			throw new FileNotFoundException(template_Print.getAbsolutePath());
		}

		Mustache mustachePrint = null;
		if (template_Print != null) {
			try {
				Mustache mustache = mustacheFactory
						.compile(Epub3FileSet.TEMPLATE_PRINT);
				mustachePrint = mustache;
			} catch (Exception ex) {
				System.out.println(" ");
				System.out.println("}}}}} INVALID MUSTACHE TEMPLATE!!!! "
						+ template_Print.getAbsolutePath());
				ex.printStackTrace();
			}
		}

		Document document = null;

		if (mustachePrint != null) {
			if (verbosity > 0) {
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE OK [PRINT DOC]: "
						+ template_Print.getAbsolutePath());
			}
			StringWriter stringWriter = new StringWriter();
			try {
				mustachePrint.execute(stringWriter, slideShow);
			} catch (Exception ex) {
				stringWriter = null;
				System.out.println(" ");
				System.out.println("}}}}} MUSTACHE TEMPLATE ERROR!!!! "
						+ template_Print.getAbsolutePath());
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
					+ Epub3FileSet.TEMPLATE_PRINT);
		}

		XmlDocument.save(document, pathEpubFolder + '/' + getFileName(),
				verbosity);
	}
}
