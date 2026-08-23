/**
 * PDF Generator & High-Def Renderer Module
 */

class PDFGenerator {
  constructor() {
    this.pdfLibraryLoaded = false;
    this.checkLibrary();
  }

  checkLibrary() {
    if (typeof html2pdf !== "undefined") {
      this.pdfLibraryLoaded = true;
    }
  }

  /**
   * Downloads an HTML element as high-definition PDF
   * @param {HTMLElement} element - Target bill element to render
   * @param {Object} options - Custom filename and layout options
   */
  async downloadPDF(element, options = {}) {
    const filename = options.filename || `Hospital_Bill_${Date.now()}.pdf`;
    
    // Create clean clone of the document
    const clone = element.cloneNode(true);

    // Strip out interactive UI buttons (+ Add Mode, Delete buttons)
    clone.querySelectorAll('.no-print').forEach(el => el.remove());

    // Strip out contenteditable outline attributes
    clone.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
    });

    // Enforce exact A4 pixel dimensions at 96 DPI (794px x 1123px = 210mm x 297mm)
    clone.style.width = "794px";
    clone.style.height = "1123px";
    clone.style.minHeight = "1123px";
    clone.style.maxHeight = "1123px";
    clone.style.margin = "0";
    clone.style.padding = "32px 40px 24px 40px";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.boxSizing = "border-box";
    clone.style.overflow = "hidden";
    clone.style.background = "#ffffff";

    // Place container at top-left origin (0,0) behind screen z-index so html2canvas renders exact layout without offset
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.zIndex = "-99999";
    container.style.opacity = "1";
    container.style.visibility = "visible";
    container.style.width = "794px";
    container.style.height = "1123px";
    container.style.pointerEvents = "none";
    container.appendChild(clone);
    document.body.appendChild(container);

    const pdfOptions = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    try {
      if (typeof html2pdf !== "undefined") {
        await html2pdf().set(pdfOptions).from(clone).save();
      } else {
        this.printNative(element);
      }
    } catch (e) {
      console.error("PDF generation failed, initiating native print fallback", e);
      this.printNative(element);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  }

  /**
   * Native Browser Print execution with print CSS styles
   */
  printNative(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll('.no-print').forEach(el => el.remove());
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Hospital Bill</title>
          <link rel="stylesheet" href="css/pdf-templates.css">
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              background: #ffffff !important;
              overflow: hidden !important;
            }
            .pdf-paper {
              margin: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              box-shadow: none !important;
              padding: 10mm 12mm !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${clone.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}

window.pdfGenerator = new PDFGenerator();
