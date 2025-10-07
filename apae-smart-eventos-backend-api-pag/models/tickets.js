const db = require('../db/db');

const ticketFullInfoSelectQuery = `
    SELECT
        t.id ticketId,
        t.ticket_type_id ticketTypeId,
        t.associate_id userId,
        (CASE
            WHEN t.status = 'not used' THEN 'Não utilizado'
            WHEN t.status = 'used' THEN "Utilizado"
            WHEN t.status = 'expired' THEN "Expirado"
            WHEN t.status = 'waiting payment' THEN "Aguardando Pagamento"
            ELSE '...'
        END) AS status,
        t.used_at usedAt,
        t.purchased_at purchasedAt,
        t.qr_code_id qrCodeId,
        u.name userName,
        etp.name ticketType,
        etp.description ticketTypeDescription,
        etp.price price,
        e.id eventId,
        e.name eventName,
        e.location eventLocation,
        e.date_time eventDateTime
    FROM tickets t
    INNER JOIN users u ON u.id = t.associate_id
    INNER JOIN event_ticket_types etp ON etp.id = t.ticket_type_id
    INNER JOIN events e ON e.id = etp.event_id`;

const getTicketByQrCodeId = async (ticketQrCodeId) => {
  const [rows] = await db.query(
    `${ticketFullInfoSelectQuery}
    WHERE qr_code_id = ?`,
    [ticketQrCodeId]
  );

  const ticket = rows[0] ?? null;
  return ticket;
};

const getTicketsOfAssociate = async (associateId) => {
  const [rows] = await db.query(
    `${ticketFullInfoSelectQuery} 
    WHERE t.associate_id = ?`,
    [associateId]
  );
  return rows;
};

module.exports = { getTicketByQrCodeId, getTicketsOfAssociate };
