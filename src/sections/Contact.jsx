import React, { useState } from 'react';
import { content } from '../data/content';
import Button from '../components/ui/Button';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let text;
    
    // LÓGICA INTELIGENTE:
    // Verifica se o usuário preencheu o nome E a mensagem
    const hasName = formData.name.trim().length > 0;
    const hasMessage = formData.message.trim().length > 0;

    if (hasName && hasMessage) {
      // Se preencheu tudo, usa o texto dele
      text = `Olá, me chamo ${formData.name}. ${formData.message}`;
    } else {
      // Se deixou algo em branco, usa a mensagem padrão do site
      text = content.global.defaultMessage;
    }

    const url = `${content.global.whatsappLink}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="contato" className="py-24 bg-gradient-to-t from-brand-light to-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-4xl text-brand-primary text-center mb-16">
          Entre em Contato
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-brand-peach/40">
          
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Seu Nome</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                placeholder="Como podemos te chamar?"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                // Removi o 'required' para permitir enviar a mensagem padrão se estiver vazio
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">Mensagem</label>
              <textarea 
                rows="4" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none transition-all"
                placeholder="Gostaria de agendar um horário..."
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                // Removi o 'required' aqui também
              ></textarea>
            </div>
            <Button type="submit" className="w-full shadow-lg">
              Enviar Mensagem pelo WhatsApp
            </Button>
          </form>

          {/* Informações */}
          <div className="flex flex-col justify-center space-y-8 pl-0 md:pl-10 border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0">
            <div className="flex items-start gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <h4 className="font-serif text-lg text-brand-primary font-bold">Localização</h4>
                <p className="text-brand-text">{content.global.address}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="text-2xl">📞</span>
              <div>
                <h4 className="font-serif text-lg text-brand-primary font-bold">Telefone</h4>
                <p className="text-brand-text">{content.global.phone}</p>
              </div>
            </div>

            {/* <div className="flex items-start gap-4">
              <span className="text-2xl">✉️</span>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-lg text-brand-primary font-bold">E-mail</h4>
                <p className="text-brand-text break-all">
                  {content.global.email}
                </p>
              </div>
            </div> */}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;