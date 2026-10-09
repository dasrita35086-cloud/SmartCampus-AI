/**
 * Utility to extract text from PDF files in the browser
 */
export async function extractTextFromPdf(file: File): Promise<{
  text: string;
  pageCount: number;
  hasText: boolean;
  error?: string;
}> {
  // Validate file size (10MB limit as required)
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return {
      text: '',
      pageCount: 0,
      hasText: false,
      error: 'File exceeds the 10 MB maximum upload limit.',
    };
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return {
      text: '',
      pageCount: 0,
      hasText: false,
      error: 'Invalid file format. Please upload a valid PDF document.',
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist to optimize bundle loading
    const pdfjs = await import('pdfjs-dist');
    
    // Set worker source if available or use disableWorker fallback
    try {
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.0.379'}/pdf.worker.min.mjs`;
      }
    } catch {
      // Ignore worker setting if in restricted environment
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= Math.min(pageCount, 50); pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter((str: string) => str.trim().length > 0);

      if (pageStrings.length > 0) {
        fullText += `\n--- Page ${pageNum} ---\n` + pageStrings.join(' ');
      }
    }

    const trimmed = fullText.trim();
    if (!trimmed || trimmed.length < 30) {
      return {
        text: '',
        pageCount,
        hasText: false,
        error:
          'This PDF appears to be a scanned image or contains no selectable digital text. OCR is not available for purely scanned bitmaps. Please paste text directly or upload a digital PDF.',
      };
    }

    return {
      text: trimmed,
      pageCount,
      hasText: true,
    };
  } catch (err: any) {
    console.error('[PDF Extraction Error]', err);
    return {
      text: '',
      pageCount: 0,
      hasText: false,
      error: `Could not extract text from this PDF (${err.message || 'Malformed document'}). You can paste your lecture notes directly into the text editor.`,
    };
  }
}
