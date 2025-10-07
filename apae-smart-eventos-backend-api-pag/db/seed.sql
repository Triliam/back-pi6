-- cria usuário admin e 3 associados
INSERT INTO users (email, password, name, user_type) VALUES
('admin@gmail.com', '123', 'ADMIN', 'admin'),
('associado1@gmail.com', '123', 'Leonardo', 'associate'),
('associado2@gmail.com', '123', 'Tamara', 'associate'),
('associado3@gmail.com', '123', 'Bruno', 'associate');

INSERT INTO events (
  id,
  name, 
  description, 
  location, 
  date_time, 
  duration_minutes, 
  event_type, 
  created_at, 
  cover_image_bucket, 
  cover_image_path
) VALUES
  (1, 'Festa Junina', 'Prepare o chapéu de palha e venha celebrar conosco! A APAE de Itapira está organizando uma Festa Junina beneficente que promete muita alegria e solidariedade. Teremos comidas típicas deliciosas, brincadeiras para toda a família e a energia contagiante que só essa época do ano proporciona. Sua participação é essencial para nos ajudar a continuar oferecendo apoio e carinho aos nossos amigos excepcionais. Não perca!', 'APAE Itapira', '2025-05-26 18:00:00', 60, 'public', '2025-06-16 23:02:32', 'apae-smart-eventos-bucket', 'festa-junina-capa.jpg'),
  (2,'Bingo beneficente', 'Prepare sua cartela da sorte! A APAE de Itapira tem o prazer de convidar você para o nosso emocionante Bingo beneficente, uma tarde divertida cheia de prêmios e muita solidariedade. Será uma oportunidade fantástica para se reunir com amigos, testar sua sorte e, o mais importante, contribuir diretamente para os projetos que transformam a vida de muitas pessoas. Sua participação é fundamental para que a APAE continue oferecendo cuidado e apoio essenciais. Venha se divertir e fazer a diferença!', 'APAE Itapira', '2025-07-10 14:00:00', 120, 'public', '2025-06-17 21:31:33', 'apae-smart-eventos-bucket', 'bingo1.jfif'),
  (3, 'Festa das Nações', 'Prepare seu passaporte para uma jornada de sabores e culturas! A APAE de Itapira tem o prazer de convidar você para a nossa Festa das Nações beneficente, um evento incrível onde você poderá "viajar" por diversos países sem sair do lugar. Teremos uma explosão de aromas e sabores com comidas típicas de várias partes do mundo, além de apresentações culturais e muito mais. Sua presença é fundamental para apoiar os projetos da APAE e nos ajudar a transformar vidas. Não perca essa experiência global de solidariedade!', 'APAE Itapira', '2025-07-15 19:00:00', 120, 'public', '2025-06-17 21:30:52', 'apae-smart-eventos-bucket', 'nacoes.png'),
  (4, 'Noite de Caldos e Vinhos', 'Prepare-se para uma noite aconchegante e saborosa! A APAE de Itapira convida você para nossa "Noite de Caldos e Vinhos", um evento beneficente repleto de delícias para aquecer o corpo e a alma. Teremos uma variedade de caldos cremosos e vinhos selecionados para um clima agradável e solidário. Sua presença faz a diferença para continuarmos apoiando e desenvolvendo nossos assistidos. Venha saborear e ajudar!', 'APAE de Itapira', '2025-08-15 19:00:00', 180, 'public', '2025-06-25 21:16:37', 'apae-smart-eventos-b...', 'caldos-vinhos.png'),
  (5, 'Festival de Talentos APAE', 'Venha se emocionar e aplaudir! A APAE de Itapira orgulhosamente apresenta o "Festival de Talentos", um evento beneficente onde nossos assistidos e voluntários brilharão no palco. Prepare-se para um show inesquecível de música, dança, poesia e arte, mostrando a diversidade e o potencial de cada um. Sua participação é fundamental para valorizar esses talentos e apoiar as ações da nossa instituição. Não perca essa celebração de vida e arte!', 'Teatro Municipal de Itapira', '2025-09-05 19:30:00', 150, 'public', '2025-06-25 21:16:37', 'apae-smart-eventos-b...', 'talentos-apae.png'),
  (6, 'Caminhada Solidária APAE', 'Calce seu tênis e vista sua camiseta! A APAE de Itapira te convida para a "Caminhada Solidária", um evento que une saúde, bem-estar e muita solidariedade. Junte sua família e amigos para percorrer as belas paisagens do Parque Ecológico em prol de uma causa nobre. Sua inscrição e participação nos ajudam a manter e expandir nossos projetos de apoio. Vamos caminhar juntos por um futuro mais inclusivo e feliz!', 'Parque Ecológico J.B. Leme', '2025-09-21 08:00:00', 120, 'public', '2025-06-25 21:16:37', 'apae-smart-eventos-b...', 'caminhada-solidaria.png'),
  (7, 'Jantar Beneficente de Gala', 'Vista seu melhor sorriso e venha brilhar! A APAE de Itapira tem a honra de convidar você para o nosso "Jantar Beneficente de Gala", uma noite de requinte, sabor e solidariedade. Desfrute de um menu exclusivo, música ambiente sofisticada e a companhia de pessoas que apoiam nossa causa. Sua presença neste evento de alto nível é essencial para angariar fundos e continuar oferecendo atendimento de excelência aos nossos assistidos. Reserve sua mesa!', 'Salão de Festas Aconchego', '2025-10-18 20:00:00', 240, 'public', '2025-06-25 21:16:37', 'apae-smart-eventos-b...', 'jantar-gala.png'),
  (8, 'Bazar de Natal da APAE', 'Antecipe suas compras de fim de ano com um toque de solidariedade! A APAE de Itapira abre as portas para o nosso tradicional "Bazar de Natal", um evento beneficente repleto de produtos artesanais, presentes únicos e muitas surpresas. Encontre o presente perfeito enquanto contribui diretamente para as atividades da nossa instituição. Venha nos visitar, apoiar e sentir a magia do Natal com a gente!', 'Sede da APAE de Itapira', '2025-11-29 10:00:00', 360, 'public', '2025-06-25 21:16:37', 'apae-smart-eventos-b...', 'bazar-natal.png');

INSERT INTO event_ticket_types (
  event_id, 
  name, 
  description, 
  price, 
  quantity
) VALUES 
  (1, 'Padrão', 'Ingresso padrão', 50.0, 10),
  (1, 'Plus', 'Concede direito à participação em sorteios', 25.0, 10),
  (1, 'VIP', 'Ingresso VIP com benefícios exclusivos', 100.0, 5),
  (2, 'Meia-Entrada', 'Meia-entrada para estudantes, professores e crianças com menos de 12 anos de idade', 12.0, 10),
  (2, 'Comum', 'Ingresso comum', 24.0, 10),
  (2, 'Viajante', 'Com esse ingresso você concorre a uma viagem gratuita para o leste da Noruega', 50.0, 5),
  (3, 'Meia-Entrada', 'Meia-entrada para estudantes, professores e crianças com menos de 12 anos de idade', 30.0, 10),
  (3, 'Padrão', 'Ingresso comum para o bingo beneficente', 60.0, 10),
  (3, 'Rei do Bingo', 'Permissão para assistir uma partida do campeonato nacional de bingo', 80.0, 5),
  (4, 'Padrão', 'Acesso ao evento com direito a uma porção de caldo à escolha.', 50.00, 100),
  (4, 'Plus', 'Acesso ao evento, duas porções de caldo e um copo de vinho selecionado.', 80.00, 70),
  (4, 'VIP', 'Acesso prioritário, degustação ilimitada de caldos e vinhos, e acesso à área lounge.', 150.00, 30),
  (4, 'Meia-Entrada', 'Acesso ao evento para estudantes, idosos e pessoas com deficiência (mediante comprovação).', 25.00, 50),
  (4, 'Sommelier Experience', 'Degustação guiada com sommelier de três rótulos de vinhos especiais e petiscos harmonizados.', 100.00, 20),
  (5, 'Padrão', 'Acesso ao evento com lugar na plateia geral.', 35.00, 150),
  (5, 'Plus', 'Acesso ao evento, assento nas fileiras intermediárias e um programa do festival.', 55.00, 100),
  (5, 'VIP', 'Assento nas primeiras filas, acesso ao camarim para fotos com os artistas (mediante disponibilidade) e brinde exclusivo.', 120.00, 40),
  (5, 'Meia-Entrada', 'Acesso ao evento para estudantes, idosos e pessoas com deficiência (mediante comprovação).', 17.50, 75),
  (5, 'Artista Mirim', 'Ingresso para crianças com até 12 anos, com direito a um kit de pintura temático.', 20.00, 60),
  (6, 'Padrão', 'Inscrição para a caminhada e número de peito.', 40.00, 200),
  (6, 'Plus', 'Inscrição para a caminhada, número de peito e camiseta do evento.', 65.00, 150),
  (6, 'VIP', 'Inscrição para a caminhada, camiseta do evento, kit lanche pós-caminhada e acesso a tenda de alongamento.', 100.00, 50),
  (6, 'Meia-Entrada', 'Inscrição para estudantes, idosos e pessoas com deficiência (mediante comprovação), sem kit extra.', 20.00, 100),
  (6, 'Pé no Chão Solidário', 'Inscrição para a caminhada sem kit físico, com foco na contribuição 100% para a APAE.', 30.00, 80),
  (7, 'Padrão', 'Acesso ao jantar com lugar individual em mesa compartilhada.', 200.00, 80),
  (7, 'Plus', 'Acesso ao jantar, lugar em mesa privilegiada e uma bebida de cortesia.', 300.00, 50),
  (7, 'VIP', 'Mesa exclusiva para até 8 pessoas, garçom dedicado, e welcome drink com espumante.', 1800.00, 10),
  (7, 'Anfitrião da Noite', 'Ingresso que inclui uma doação extra e reconhecimento público durante o evento.', 500.00, 5),
  (8, 'Padrão', 'Entrada para o bazar.', 15.00, 300),
  (8, 'Plus', 'Entrada para o bazar e um voucher de desconto de R$10,00 para compras.', 25.00, 200),
  (8, 'VIP', 'Entrada antecipada (30 minutos antes da abertura ao público), voucher de desconto de R$25,00 e um brinde surpresa.', 50.00, 80),
  (8, 'Meia-Entrada', 'Entrada para estudantes, idosos e pessoas com deficiência (mediante comprovação).', 7.50, 150),
  (8, 'Duende Ajudante', 'Ingresso com entrada para a família (até 4 pessoas) e um kit de atividades natalinas para crianças.', 40.00, 100);