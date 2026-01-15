import React, { useState, useEffect } from 'react';
import { content } from '../../data/content';
import Button from '../ui/Button';
import logo from '../../assets/logo-lpa.png';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // --- NOVA FUNÇÃO DE ENVIO ---
  const handleWhatsApp = () => {
    // Pega a mensagem padrão, codifica para URL e abre o link
    const text = encodeURIComponent(content.global.defaultMessage);
    const url = `${content.global.whatsappLink}?text=${text}`;
    window.open(url, '_blank');
    setIsMobileMenuOpen(false); // Garante que fecha o menu se estiver no mobile
  };

  return (
    <>
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          
          <a href="#home" className="flex items-center gap-3 group z-50 relative">
            <img 
              src={logo} 
              alt="LPA Estética Logo" 
              className="h-16 w-auto md:h-16 rounded-full transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
               <span className="font-serif text-xl md:text-1xl font-bold text-brand-primary leading-none">
                 LPA
               </span>
               <span className="font-sans text-[0.6rem] md:text-[0.65rem] font-medium text-brand-text tracking-[0.3em] uppercase ml-0.5">
                 Estética
               </span>
            </div>
          </a>

          <nav className="hidden md:flex gap-8 items-center">
            {content.nav.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-brand-text hover:text-brand-primary font-medium transition-colors text-sm uppercase tracking-wide"
              >
                {item.label}
              </a>
            ))}
            {/* Botão Desktop usando a nova função */}
            <Button onClick={handleWhatsApp} className="text-sm px-6 py-2">
              Agendar
            </Button>
          </nav>
          
          <button 
            className="md:hidden text-brand-primary text-3xl focus:outline-none z-50 relative p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <div 
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center gap-8 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {content.nav.map((item) => (
          <a 
            key={item.label} 
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-brand-primary font-serif text-3xl font-bold hover:text-brand-accent transition-colors"
          >
            {item.label}
          </a>
        ))}
        
        <div className="mt-4">
          {/* Botão Mobile usando a nova função */}
          <Button 
            onClick={handleWhatsApp} 
            className="text-lg px-8 py-4 shadow-xl"
          >
            Agendar Horário
          </Button>
        </div>

        <div className="absolute bottom-10 text-center text-brand-text text-sm opacity-60">
          <p>{content.global.address}</p>
        </div>
      </div>
    </>
  );
};

export default Header;