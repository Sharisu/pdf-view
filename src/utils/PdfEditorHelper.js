import {PDFDocument, rgb} from 'pdf-lib';
import {savePdfToFile} from "./FileManagerHelper";

const addLabelsToPdf = async (uri, pages) => {
  const existingPDFBytes = await fetch(uri).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPDFBytes);

  pages.forEach(item => {
    if (item.labels.length > 0) {
      const page = pdfDoc.getPage(item.pageNumber - 1);

      item.labels.forEach(label => {
        const x = label.labelX * page.getWidth();
        const y = page.getHeight() - (label.labelY * page.getHeight());
        // I haven't made font and size adjustments, so it might not display correctly at different page sizes
        page.drawText(label.title, {
          x: x,
          y: y - 20,
          size: 24,
          color: rgb(0.98, 0.15, 0.15),
        });
      });
    }
  });

  const pdfBytes = await pdfDoc.save();
  await savePdfToFile(pdfBytes, uri);
};

export default addLabelsToPdf;
