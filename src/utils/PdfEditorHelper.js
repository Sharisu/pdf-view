import {PDFDocument, rgb} from 'pdf-lib';
import {saveBytesToDocuments, saveBytesToFile} from "./FileManagerHelper";
import {getImageScaledDimensions, resizeImage} from "./ImageHelper";
import {Dimensions} from "react-native";

const PDF_SIZE_WIDTH = 600;
const PDF_SIZE_HEIGHT = 846;

const addLabelsToPdf = async (uri, pages) => {
  const existingPDFBytes = await fetch(uri).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPDFBytes);

  for (const item of pages) {
    const page = pdfDoc.getPage(item.pageNumber - 1);

    if (item.labels && item.labels.length > 0) {
      item.labels.forEach(label => {
        const x = label.labelX * page.getWidth();
        const y = page.getHeight() - (label.labelY * page.getHeight());
        // I haven't made font and size adjustments, so it might not display correctly at different page sizes
        page.drawText(label.title, {
          x: x,
          y: y - 20,
          size: 24,
          color: rgb(0.05, 0.05, 0.05),
        });
      });
    }

    if (item.images && item.images.length > 0) {
      for (const image of item.images) {
        const newImageUri = await resizeImage(image.imageUri);
        const imageBytes = await fetch(newImageUri).then(res => res.arrayBuffer());
        const extension = newImageUri.split('.').pop().toLowerCase();

        let embeddedImage;
        if (extension === 'png') {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        } else if (extension === 'jpg' || extension === 'jpeg') {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          throw new Error('Unsupported image type');
        }

        const {width: originalWidth, height: originalHeight} = embeddedImage;
        let {width: scaledWidth, height: scaledHeight} = getImageScaledDimensions(originalWidth, originalHeight, 200);

        const imageScaleAspect = page.getWidth() / Dimensions.get('window').width;
        scaledWidth = scaledWidth * imageScaleAspect;
        scaledHeight = scaledHeight * imageScaleAspect;

        const x = image.imageX * page.getWidth();
        const y = page.getHeight() - (image.imageY * page.getHeight()) - scaledHeight;

        page.drawImage(embeddedImage, {
          x: x,
          y: y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
    }

  }

  const pdfBytes = await pdfDoc.save();
  await saveBytesToDocuments(pdfBytes, uri);
};

const addNewPageToPdf = async (uri) => {
  const existingPDFBytes = await fetch(uri).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPDFBytes);
  pdfDoc.addPage([PDF_SIZE_WIDTH, PDF_SIZE_HEIGHT]);
  const pdfBytes = await pdfDoc.save();
  await saveBytesToDocuments(pdfBytes, uri);
}

const removePageFromPdf = async (uri, pageIndex) => {
  const existingPDFBytes = await fetch(uri).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPDFBytes);
  pdfDoc.removePage(pageIndex);
  const pdfBytes = await pdfDoc.save();
  await saveBytesToDocuments(pdfBytes, uri);
}

const createPdfFile = async (fileName) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PDF_SIZE_WIDTH, PDF_SIZE_HEIGHT]);
  page.drawText('Created PDF Document', {
    x: 50,
    y: 350,
    size: 50,
    color: rgb(0.05, 0.05, 0.05),
  });
  const pdfBytes = await pdfDoc.save();
  await saveBytesToFile(pdfBytes, fileName);
}

export {addLabelsToPdf, addNewPageToPdf, removePageFromPdf, createPdfFile};
