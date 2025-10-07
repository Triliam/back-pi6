require('dotenv').config();
const express = require('express');

const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db/db');
const httpStatus = require('../constants/httpStatusesCodes');

// Habilita JSON apenas neste roteador (caso a app principal não tenha configurado)
router.use(express.json());

// Endpoint para criar um PaymentIntent (uso com Stripe Elements)
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      // Habilita métodos de pagamento automáticos.
      automatic_payment_methods: { enabled: true },
    });

    // Retorna o clientSecret para o frontend (ex.: app mobile/web com Elements)
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Endpoint para criar uma sessão do Stripe Checkout (redireciona para telas hospedadas pela Stripe)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      lineItems, // Ex.: [{ price: 'price_123', quantity: 1 }] OU [{ name, amount, currency, quantity }]
      mode = 'payment',
      customerEmail,
      metadata,
      successUrl,
      cancelUrl,
    } = req.body;

    const resolvedSuccessUrl = successUrl || process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/success';
    const resolvedCancelUrl = cancelUrl || process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/cancel';

    // Suporta tanto preços cadastrados (price) quanto itens dinâmicos (price_data)
    const normalizedLineItems = (lineItems || []).map((item) => {
      if (item.price) {
        return { price: item.price, quantity: item.quantity || 1 };
      }
      return {
        price_data: {
          currency: item.currency,
          product_data: { name: item.name },
          unit_amount: item.amount, // em centavos
        },
        quantity: item.quantity || 1,
      };
    });

    if (!normalizedLineItems.length) {
      return res.status(400).json({ error: 'lineItems é obrigatório e não pode ser vazio.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: normalizedLineItems,
      success_url: `${resolvedSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancelUrl,
      customer_email: customerEmail,
      metadata,
      // Para métodos populares no Brasil (ajuste conforme habilitado na conta Stripe)
      payment_method_types: ['card', 'boleto'],
      allow_promotion_codes: true,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// Endpoint para processar compra de ingressos de um evento
router.post('/create-event-checkout', async (req, res) => {
  try {
    const {
      eventId,
      tickets, // Array: [{ ticketTypeId, quantity }]
      customerEmail,
      successUrl,
      cancelUrl,
    } = req.body;

    // Validações básicas
    if (!eventId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'eventId e tickets são obrigatórios. tickets deve ser um array não vazio.'
      });
    }

    if (!customerEmail) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'customerEmail é obrigatório.'
      });
    }

    // 1. Verificar se o evento existe
    const [eventRows] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ error: 'Evento não encontrado.' });
    }
    const event = eventRows[0];

    // 2. Buscar tipos de ingressos do evento
    const [ticketTypes] = await db.query(
      'SELECT * FROM event_ticket_types WHERE event_id = ?',
      [eventId]
    );

    if (ticketTypes.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ error: 'Nenhum tipo de ingresso encontrado para este evento.' });
    }

    // 3. Validar e calcular totais
    const lineItems = [];
    let totalAmount = 0;
    const ticketDetails = [];

    for (const ticket of tickets) {
      const { ticketTypeId, quantity } = ticket;

      if (!ticketTypeId || !quantity || quantity <= 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: 'Cada ticket deve ter ticketTypeId e quantity válidos.'
        });
      }

      // Encontrar o tipo de ingresso
      const ticketType = ticketTypes.find(tt => tt.id === ticketTypeId);
      if (!ticketType) {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: `Tipo de ingresso com ID ${ticketTypeId} não encontrado para este evento.`
        });
      }

      // Verificar estoque
      if (quantity > ticketType.quantity) {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: `Quantidade solicitada (${quantity}) excede o estoque disponível (${ticketType.quantity}) para ${ticketType.name}.`
        });
      }

      const itemTotal = ticketType.price * quantity;
      totalAmount += itemTotal;

      // Adicionar ao lineItems do Stripe
      lineItems.push({
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${event.name} - ${ticketType.name}`,
            description: ticketType.description,
            metadata: {
              eventId: eventId.toString(),
              ticketTypeId: ticketTypeId.toString(),
              eventName: event.name,
            },
          },
          unit_amount: Math.round(ticketType.price * 100), // Stripe usa centavos
        },
        quantity: quantity,
      });

      // Salvar detalhes para metadata
      ticketDetails.push({
        ticketTypeId,
        ticketTypeName: ticketType.name,
        quantity,
        unitPrice: ticketType.price,
        totalPrice: itemTotal,
      });
    }

    if (totalAmount <= 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Valor total deve ser maior que zero.'
      });
    }

    // 4. Configurar URLs de retorno
    const resolvedSuccessUrl = successUrl || process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/success';
    const resolvedCancelUrl = cancelUrl || process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/cancel';

    // 5. Criar sessão do Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${resolvedSuccessUrl}?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: resolvedCancelUrl,
      customer_email: customerEmail,
      metadata: {
        eventId: eventId.toString(),
        eventName: event.name,
        totalAmount: totalAmount.toString(),
        ticketDetails: JSON.stringify(ticketDetails),
        customerEmail,
      },
      payment_method_types: ['card', 'boleto'],
      allow_promotion_codes: true,
      // Configurações específicas para o Brasil
      locale: 'pt-BR',
      currency: 'brl',
    });

    return res.status(200).json({
      id: session.id,
      url: session.url,
      event: {
        id: event.id,
        name: event.name,
        dateTime: event.date_time,
        location: event.location,
      },
      tickets: ticketDetails,
      totalAmount: totalAmount,
      currency: 'BRL',
    });

  } catch (error) {
    console.error('Erro ao criar checkout do evento:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Erro interno do servidor ao processar pagamento.'
    });
  }
});

// Endpoint para confirmar pagamento e gerar tickets
router.post('/confirm-payment', async (req, res) => {
  try {
    const { sessionId, associateId } = req.body;

    if (!sessionId || !associateId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'sessionId e associateId são obrigatórios.'
      });
    }

    // 1. Verificar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(httpStatus.BAD_REQUEST).json({
        error: 'Pagamento não foi confirmado.'
      });
    }

    // 2. Verificar se já processamos este pagamento
    const [existingTickets] = await db.query(
      'SELECT id FROM tickets WHERE qr_code_id = ?',
      [sessionId]
    );

    if (existingTickets.length > 0) {
      return res.status(httpStatus.CONFLICT).json({
        error: 'Este pagamento já foi processado.',
        tickets: existingTickets,
      });
    }

    // 3. Processar metadata e criar tickets
    const metadata = session.metadata;
    const ticketDetails = JSON.parse(metadata.ticketDetails);
    const createdTickets = [];

    for (const detail of ticketDetails) {
      for (let i = 0; i < detail.quantity; i++) {
        const [result] = await db.execute(
          `INSERT INTO tickets (ticket_type_id, associate_id, status, qr_code_id) 
           VALUES (?, ?, 'not used', ?)`,
          [detail.ticketTypeId, associateId, `${sessionId}_${detail.ticketTypeId}_${i}`]
        );

        createdTickets.push({
          id: result.insertId,
          ticketTypeId: detail.ticketTypeId,
          ticketTypeName: detail.ticketTypeName,
          qrCodeId: `${sessionId}_${detail.ticketTypeId}_${i}`,
        });
      }
    }

    return res.status(200).json({
      message: 'Pagamento confirmado e ingressos gerados com sucesso!',
      sessionId,
      tickets: createdTickets,
      event: {
        id: metadata.eventId,
        name: metadata.eventName,
      },
    });

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Erro interno do servidor ao confirmar pagamento.'
    });
  }
});

module.exports = router;