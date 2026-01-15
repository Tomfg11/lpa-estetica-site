import React from 'react';
import { content } from '../data/content';
import Card from '../components/ui/Card';

const Services = () => {
  
  const handleCardClick = () => {
    const text = encodeURIComponent("Olá! Vi os serviços no site e gostaria de agendar.");
    window.open(`${content.global.whatsappLink}?text=${text}`, '_blank');
  };

  return (
    <section id="servicos" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-accent font-medium uppercase tracking-wider text-sm">O que oferecemos</span>
          <h2 className="font-serif text-4xl md:text-5xl text-brand-primary mt-2">
            Nossos Serviços
          </h2>
        </div>
        
        {/* Adicionei 'items-stretch' para os cards terem a mesma altura */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {content.services.map((service) => (
            <div key={service.id} onClick={handleCardClick} className="cursor-pointer h-full">
              <Card {...service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;