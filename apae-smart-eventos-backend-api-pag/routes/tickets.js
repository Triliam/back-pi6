const express = require('express');
const router = express.Router();
const db = require('../db/db');
const httpStatus = require('../constants/httpStatusesCodes');
const uuid = require('uuid');
const ticketsServices = require('../services/tickets');
const { getTicketByQrCodeId } = require('../models/tickets');

// Get ticket by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Ticket Not Found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

// get ticket info by qrCodeId for printing
router.get('/:qrCodeId/printTicket', async (req, res) => {
  try {
    if (!req.params.qrCodeId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Inform the ticket QR Code' });
    }

    const ticket = await getTicketByQrCodeId(req.params.qrCodeId);
    if (!ticket) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Ticket Not Found.' });
    }

    const USE_SERVERLESS_FUNCTION = true;

    let ticketPdf;
    if (USE_SERVERLESS_FUNCTION) {
      console.log('Using serverless function to generate PDF');
      const response = await fetch(`${process.env.GENERATE_PDF_SERVERLESS_URL}`, {
        method: 'POST',
        body: JSON.stringify(ticket),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      ticketPdf = Buffer.from(arrayBuffer);
    } else {
      console.log('Using local service to generate PDF');
      ticketPdf = await ticketsServices.generateTicketPdf(ticket);
    }

    res.contentType('application/pdf');
    res.send(ticketPdf);
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

// purchase ticket
router.post('/purchase', async (req, res) => {
  /* EXPECTED REQUEST BODY
  {
    "associateId": 1,
    "tickets": [
      {"ticketTypeId": 3},
      {"ticketTypeId": 3}
    ]
  }*/

  try {
    if (!req.body.associateId) {
      console.error('Request missing the "associateId".');
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: 'Inform the associate responsible for the purchase' });
    }

    const [rows] = await db.query('SELECT id, user_type FROM users WHERE id = ?', [
      req.body.associateId,
    ]);
    if (rows.length === 0 || rows[0].user_type !== 'associate') {
      console.error('Invalid "associateId" or user is not an associate.');
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: 'Invalid associate or user is not an associate.' });
    }

    if (!req.body.tickets || !Array.isArray(req.body.tickets) || req.body.tickets.length === 0) {
      console.error('"tickets" must bt an array with at least one ticket.');
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: 'Inform the list of tickets to purchase' });
    }

    const tickets = req.body.tickets;
    const associateId = req.body.associateId;
    try {
      const listOfTicketsToInsert = [];
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (!ticket.ticketTypeId) {
          console.error('Each ticket must have a "ticketTypeId".');
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: 'Inform the ticket type for each ticket' });
        }

        const ticketQrCodeUuid = uuid.v4();
        const ticketStatus = 'not used';
        listOfTicketsToInsert.push([
          associateId,
          ticket.ticketTypeId,
          ticketQrCodeUuid,
          ticketStatus,
        ]);
      }

      await db.query(
        'INSERT INTO tickets (associate_id, ticket_type_id, qr_code_id, status) VALUES ?',
        [listOfTicketsToInsert]
      );
    } catch (error) {
      console.error('Transaction error:', error);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error.' });
    }

    res.status(httpStatus.CREATED).json({ message: 'Tickets purchased successfully.' });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

router.get('/:qrCodeId/validateTicket', async (req, res) => {
  try {
    if (!req.params.qrCodeId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Inform the ticket QR Code' });
    }

    //already used ticket is considered invalid
    const [rows] = await db.query(
      `SELECT (IF(t.status = 'used', 'invalid', 'valid')) AS isTicketValid
        FROM tickets t WHERE t.qr_code_id = ?`,
      [req.params.qrCodeId]
    );

    let isTicketValid;
    if (rows.length > 0) {
      isTicketValid = rows[0].isTicketValid === 'valid';
    } else {
      console.log('invalid ticket code');
      isTicketValid = false;
    }

    res.json({ isTicketValid });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error.' });
  }
});

// --- NOVA ROTA: Rota para usar/invalidar um ticket por qrCodeId ---
// Ex: POST /tickets/XYZ789/useTicket
router.post('/:qrCodeId/useTicket', async (req, res) => {
  try {
    const qrCodeId = req.params.qrCodeId;
    if (!qrCodeId) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Informe o QR Code do ticket.' });
    }

    // 1. Verificar a validade atual do ticket
    const [ticketRows] = await db.query(`SELECT id, status FROM tickets WHERE qr_code_id = ?`, [
      qrCodeId,
    ]);

    if (ticketRows.length === 0) {
      console.log(`Tentativa de usar ticket com QR Code '${qrCodeId}' que não existe.`);
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Ticket não encontrado.' });
    }

    const ticket = ticketRows[0];

    if (ticket.status === 'used') {
      console.log(`Tentativa de usar ticket com QR Code '${qrCodeId}' que já foi usado.`);
      return res.status(httpStatus.CONFLICT).json({ message: 'Ticket já utilizado.' });
    }

    // 2. Atualizar o status do ticket para 'used' (ou 'invalidado')
    const dataAtual = new Date();
    const [updateResult] = await db.query(
      `UPDATE tickets SET status = 'used', used_at = ? WHERE qr_code_id = ?`,
      [dataAtual, qrCodeId]
    );

    if (updateResult.affectedRows === 0) {
      // Isso raramente deve acontecer se a verificação anterior foi bem-sucedida,
      // mas é uma boa prática verificar se a atualização realmente afetou alguma linha.
      console.error(`Falha ao atualizar o status do ticket com QR Code '${qrCodeId}'.`);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Erro ao invalidar o ticket.' });
    }

    // 3. Responder com sucesso
    res.json({ message: 'Ticket utilizado com sucesso!', qrCodeId: qrCodeId });
  } catch (error) {
    console.error('Erro na rota useTicket:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Erro interno ao processar a requisição.' });
  }
});

module.exports = router;
