/**
 * procedureDefaults.js
 * Configurações de procedimentos, prazos médios de manutenção recomendados, preços e templates de mensagens.
 */

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'Pix', icon: '⚡' },
  { id: 'credit', label: 'Cartão de Crédito', icon: '💳' },
  { id: 'debit', label: 'Cartão de Débito', icon: '💳' },
  { id: 'cash', label: 'Dinheiro', icon: '💵' },
  { id: 'other', label: 'Outro', icon: '💰' },
];

export const PROCEDURE_CATEGORIES = [
  {
    id: 'cilios',
    name: 'Extensão de Cílios',
    icon: '👁️',
    defaultDays: 20,
    services: [
      { name: 'Volume Brasileiro', defaultDays: 20, defaultPrice: 115 },
      { name: 'Volume Egípcio', defaultDays: 20, defaultPrice: 110 },
      { name: 'Efeito Rímel', defaultDays: 20, defaultPrice: 115 },
      { name: 'Volume Glamour', defaultDays: 20, defaultPrice: 125 },
      { name: 'Fox Eyes', defaultDays: 20, defaultPrice: 140 },
      { name: 'Volume Mega Brasileiro', defaultDays: 20, defaultPrice: 160 },
      { name: 'Manutenção de Cílios', defaultDays: 20, defaultPrice: 85 },
      { name: 'Outra Técnica de Cílios', defaultDays: 20, defaultPrice: 115 },
    ],
    whatsappTemplate: (name, serviceName, daysAgo) => 
      `Olá, ${name}! Tudo bem com você? \nAqui é a Letícia da *LPA Estética*. Já se passaram ${daysAgo} dias desde a sua aplicação de *${serviceName}*. \nQue tal garantirmos o seu horário de manutenção para manter seu olhar impecável e volumoso? \n\n(Após deste prazo predomina o valor de uma nova colocação)`
  },
  {
    id: 'sobrancelhas',
    name: 'Sobrancelhas',
    icon: '✨',
    defaultDays: 15,
    services: [
      { name: 'Design com Henna', defaultDays: 15, defaultPrice: 45 },
      { name: 'Design Simples', defaultDays: 20, defaultPrice: 35 },
      { name: 'Brow Lamination', defaultDays: 35, defaultPrice: 110 },
      { name: 'Design + Buço', defaultDays: 20, defaultPrice: 50 },
    ],
    whatsappTemplate: (name, serviceName, daysAgo) => 
      `Olá, ${name}! Tudo bem? ✨ Aqui é a Letícia da *LPA Estética* 💕\n\nJá faz ${daysAgo} dias que fizemos seu *${serviceName}*! Que tal renovarmos o design para manter suas sobrancelhas alinhadas e com aquele desenho perfeito? 🥰\n\nVamos agendar seu horário? Me avise qual período você prefere!`
  },
  {
    id: 'depilacao',
    name: 'Depilação Facial',
    icon: '💆‍♀️',
    defaultDays: 25,
    services: [
      { name: 'Depilação de Buço', defaultDays: 25, defaultPrice: 20 },
      { name: 'Depilação Buço + Queixo', defaultDays: 25, defaultPrice: 25 },
      { name: 'Depilação Rosto Completo', defaultDays: 25, defaultPrice: 35 },
    ],
    whatsappTemplate: (name, serviceName, daysAgo) => 
      `Olá, ${name}! Tudo bem? ✨ Aqui é a Letícia da *LPA Estética* 🌸\nPassando para lembrar que está na hora de renovar sua *${serviceName}* para manter sua pele macia e lisinha! ✨\n\nVamos agendar um momento de autocuidado para você essa semana?`
  },
  {
    id: 'outro',
    name: 'Outro Procedimento',
    icon: '💖',
    defaultDays: 20,
    services: [
      { name: 'Procedimento Personalizado', defaultDays: 20, defaultPrice: 50 },
    ],
    whatsappTemplate: (name, serviceName, daysAgo) => 
      `Olá, ${name}! Tudo bem? ✨ Aqui é a Letícia da *LPA Estética* 💖\nPassando para saber como você está e se já gostaria de agendar seu retorno para *${serviceName}*! 🥰\n\nQuando fica melhor para você vir cuidar de si?`
  }
];

/**
 * Busca o preço padrão sugerido para um serviço
 */
export const getDefaultPriceForService = (serviceName) => {
  if (!serviceName) return 0;
  const clean = serviceName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const cat of PROCEDURE_CATEGORIES) {
    const srv = cat.services.find(s => {
      const sName = s.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sName === clean || sName.includes(clean) || clean.includes(sName);
    });
    if (srv && srv.defaultPrice) return srv.defaultPrice;
  }

  // Preços padrões por palavra-chave se for personalizado
  if (clean.includes('cilios') || clean.includes('volume') || clean.includes('fox')) return 115;
  if (clean.includes('sobrancelha') || clean.includes('henna') || clean.includes('design')) return 45;
  if (clean.includes('lamination') || clean.includes('brow')) return 110;
  if (clean.includes('depilacao') || clean.includes('buco')) return 25;

  return 50; // valor padrão genérico
};

/**
 * Retorna o template padrão de mensagem para WhatsApp de acordo com a categoria ou genérico.
 */
export const getWhatsAppMessage = (categoryName, clientName, serviceName, daysAgo) => {
  const firstName = clientName ? clientName.trim().split(' ')[0] : 'Cliente';
  const category = PROCEDURE_CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());

  if (category && typeof category.whatsappTemplate === 'function') {
    return category.whatsappTemplate(firstName, serviceName || 'Procedimento', daysAgo);
  }

  return `Olá, ${firstName}! Tudo bem? ✨ Aqui é a Letícia da *LPA Estética* 💖\n\nJá faz ${daysAgo} dias desde o seu *${serviceName}*! Que tal agendarmos sua manutenção/retorno para manter seu resultado perfeito? 🥰\n\nQual dia e horário fica melhor para você?`;
};
