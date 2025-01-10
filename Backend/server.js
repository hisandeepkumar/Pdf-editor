const express = require('express');
const fileUpload = require('express-fileupload');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware for file upload
app.use(fileUpload());

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint to handle PDF uploads and edits
app.post('/edit-pdf', async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send('No PDF file uploaded.');
  }

  try {
    const uploadedPdf = req.files.pdf.data;
    const pdfDoc = await PDFDocument.load(uploadedPdf);

    // Sample edit: Add text to the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText('Edited using PDF Editor', {
      x: 50,
      y: 700,
      size: 20,
      color: pdfDoc.context.obj('0 0 0 rg'),
    });

    // Save the edited PDF
    const editedPdf = await pdfDoc.save();
    const outputPath = path.join(__dirname, 'edited.pdf');
    fs.writeFileSync(outputPath, editedPdf);

    res.download(outputPath, 'edited.pdf', () => {
      fs.unlinkSync(outputPath); // Clean up
    });
  } catch (err) {
    res.status(500).send('Error processing the PDF.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
