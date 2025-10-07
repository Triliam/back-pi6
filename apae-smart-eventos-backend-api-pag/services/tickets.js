const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

const generateTicketPdf = async (ticket) => {
  try {
    if (!ticket) {
      console.error('error generating the pdf: invalid ticket object');
      return null;
    }

    const qrCodeBase64 = await QRCode.toDataURL(ticket.qrCodeId);
    const templateHtml = await fs.promises.readFile(
      path.join(__dirname, '../templates/ticket-template.html'),
      'utf8'
    );
    const template = handlebars.compile(templateHtml);
    const html = template({
      ...ticket,
      formattedDate: formatDate(ticket.eventDateTime),
      qrCodeBase64,
    });

    const browser = await puppeteer.launch({ headless: 'new' });
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
    await browser.close();
    const ticketPdfBuffer = Buffer.from(uint8ArrayTicket);
    return ticketPdfBuffer;
  } catch (error) {
    console.error('error generating the pdf: ', error);
    return null;
  }
};

module.exports = { generateTicketPdf };
