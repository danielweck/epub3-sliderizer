import com.adobe.epubcheck.util.Archive;

public final class zipEpub {

	public static void main(String[] args) throws Exception {
		System.out.print('\n');
		System.out.print(args[0]);
		System.out.print('\n');
        
        Archive epub = new Archive(args[0], true);
        epub.createArchive();
    }
}