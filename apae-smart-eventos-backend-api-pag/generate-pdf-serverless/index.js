const express = require('express');
const fs = require('fs');
const { join } = require('path');
const handlebars = require('handlebars');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

app.post('/generate-ticket-pdf', async (req, res) => {
  try {
    if (!req.body || !req.body.qrCodeId) {
      return res.status(400).json({ message: 'Bad request. Missing info' });
    }
    const ticket = req.body;

    const qrCodeBase64 = await QRCode.toDataURL(ticket.qrCodeId);
    const templateHtml = await fs.promises.readFile(
      join(__dirname, './ticket-template.html'),
      'utf8'
    );
    const template = handlebars.compile(templateHtml);
    const html = template({
      ...ticket,
      formattedDate: formatDate(ticket.eventDateTime),
      qrCodeBase64,
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // required in Docker
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const uint8ArrayTicket = await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    const ticketPdfBuffer = Buffer.from(uint8ArrayTicket);

    await browser.close();

    res.contentType('application/pdf');
    res.send(ticketPdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
