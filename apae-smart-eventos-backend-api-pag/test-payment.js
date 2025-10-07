const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPayment() {
  try {
    console.log('🧪 Iniciando testes de pagamento...\n');

    // Teste 1: Criar checkout
    console.log('1️⃣ Testando criação de checkout...');
    const checkoutResponse = await axios.post(`${BASE_URL}/payment/create-event-checkout`, {
      eventId: 1, // Festa Junina
      tickets: [
        {
          ticketTypeId: 1, // Padrão
          quantity: 2
        }
      ],
      customerEmail: 'teste@email.com',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    });

    console.log('✅ Checkout criado com sucesso!');
    console.log('📋 Dados do checkout:', {
      sessionId: checkoutResponse.data.id,
      url: checkoutResponse.data.url,
      event: checkoutResponse.data.event.name,
      totalAmount: checkoutResponse.data.totalAmount
    });

    // Teste 2: Verificar tipos de ingresso
    console.log('\n2️⃣ Verificando tipos de ingresso disponíveis...');
    const ticketTypesResponse = await axios.get(`${BASE_URL}/events/1/ticketTypes`);
    console.log('🎫 Tipos de ingresso disponíveis:', ticketTypesResponse.data);

    // Teste 3: Verificar evento
    console.log('\n3️⃣ Verificando dados do evento...');
    const eventResponse = await axios.get(`${BASE_URL}/events/1`);
    console.log('🎪 Dados do evento:', {
      name: eventResponse.data.name,
      location: eventResponse.data.location,
      dateTime: eventResponse.data.date_time
    });

    console.log('\n🎉 Todos os testes passaram!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse a URL do checkout:', checkoutResponse.data.url);
    console.log('2. Use o cartão de teste: 4242 4242 4242 4242');
    console.log('3. Após o pagamento, use o sessionId para confirmar');
    console.log('4. SessionId:', checkoutResponse.data.id);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testPayment();
