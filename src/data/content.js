import Sobrancelha1 from '../assets/Sobrancelha1.png';
import Sobrancelha2 from '../assets/Sobrancelha2.png';
import Cilios1 from '../assets/Cilios1.png';
import Cilios2 from '../assets/Cilios2.png';
import Cilios3 from '../assets/glamour.png';
import Cilios4 from '../assets/foxeyes.png';
import Cilios5 from '../assets/Cilios5.png';
import VolumeEgipicio from '../assets/VolumeEgipicio.png';
import VolumeGlamour1 from '../assets/VolumeGlamour1.png';
import VolumeGlamour2 from '../assets/VolumeGlamour2.png';
import Depilacao1 from '../assets/Depilacao1.png';
import Depilacao2 from '../assets/Depilacao2.png';

export const content = {
  global: {
    phone: "(21) 97889-0411",
    whatsappLink: "https://wa.me/5521978890411",
    defaultMessage: "Olá! Vim pelo site e gostaria de agendar um horário.",
    email: "contato@lpaestetica.com",
    address: "R. Américo Salvatori, 192 - Rocha, São Gonçalo - RJ",
  },
  nav: [
    { label: "Início", href: "#home" },
    { label: "Serviços", href: "#servicos" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],
  hero: {
    title: "Realce Sua Beleza Natural com LPA Estética.",
    subtitle: "Especialista em embelezamento facial há mais de 5 anos. Aqui você é valorizada como merece!",
    cta: "Agendar Horário"
  },
  services: [
    {
      id: 1,
      title: "Extensão de Cílios",
      description: "Do natural ao marcante. Trabalhamos com técnicas que valorizam seu olhar.",
      images: [
        Cilios1,
        Cilios2
      ],
      items: [
        { 
          name: "Volume Brasileiro", 
          price: "R$ 100,00",
          image: Cilios2 
        },
        { 
          name: "Volume Egípcio", 
          price: "R$ 100,00",
          image: VolumeEgipicio 
        },
        { 
          name: "Volume Glamour", 
          price: "R$ 110,00",
          image: VolumeGlamour1 
        },
        { 
          name: "Fox Eyes", 
          price: "R$ 120,00",
          image: Cilios4 
        },
        { 
          name: "Volume Mega Brasileiro", 
          price: "R$ 150,00",
          image: Cilios5 
        },
        { 
          name: "Manutenção", 
          price: "a partir de R$ 80",
        },
      ],
      icon: "👁️"
    },
    {
      id: 2,
      title: "Sobrancelhas",
      description: "Design personalizado baseado na harmonia do seu rosto, preservando fios naturais.",
      images: [
        Sobrancelha1,
        Sobrancelha2  
      ],
      items: [
        { 
          name: "Design Simples", 
          price: "R$ 30,00",
          image: Sobrancelha2
        },
        { 
          name: "Design com Henna", 
          price: "R$ 40,00",
          image: Sobrancelha1
        },
        { name: "Combo (Design + Buço)", price: "a partir de R$ 45,00" }
      ],
      icon: "✨"
    },
    {
      id: 3,
      title: "Depilação Facial",
      description: "Depilação com cera quente e finalização relaxante com esfera de jade.",
      images: [
        Depilacao2
      ],
      items: [
        { name: "Buço", price: "R$ 20,00" },
        { name: "Buço + Queixo", price: "R$ 25,00" },
        { name: "Rosto Completo", price: "R$ 35,00" }
      ],
      icon: "💆‍♀️"
    }
  ],
  about: {
    title: "Quem eu sou?",
    text: "Olá, é um prazer lhe receber aqui! Me chamo Letícia, e minha missão é valorizar e realçar o que há de melhor nas minhas clientes.",
    text2: "Sou especialista em embelezamento facial há mais de 5 anos. Estou aqui para fazê-la brilhar e se enxergar com um olhar de amor e carinho.",
    signature: "Com carinho, Letícia (LPA)."
  },
  socials: {
    title: "Fique por dentro das novidades",
    subtitle: "Acompanhe nosso trabalho diário e receba promoções relâmpago exclusivas.",
    instagram: "https://www.instagram.com/lpa_estetica/",
    vipGroup: "https://chat.whatsapp.com/H93NNTOjHFO5cV9QJtryrD?mode=wwt&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnYnK10b9eFcjs0c0_KanoaLUqPG7gPbP2qtxQ45w_pGA74nak3hVUgzydTKo_aem_VVu9Cx3tyaUAEFtq3rPzCg",
    tiktok: "https://www.tiktok.com/@lpa_estetica"
  }
};