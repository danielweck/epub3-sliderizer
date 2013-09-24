package danielweck;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;

public class VoidPrintStream extends PrintStream {

	public VoidPrintStream() {
		super(new VoidByteArrayOutputStream());
	}

	private static class VoidByteArrayOutputStream extends
			ByteArrayOutputStream {

		@Override
		public void write(int b) {
			// NOOP
		}

		@Override
		public void write(byte[] b, int off, int len) {
			// NOOP
		}

		@Override
		public void writeTo(OutputStream out) throws IOException {
			// NOOP
		}
	}
}