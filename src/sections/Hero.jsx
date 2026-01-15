import React from 'react';
import { content } from '../data/content';
import Button from '../components/ui/Button';
import logo from '../assets/Let2.png';

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 bg-hero-gradient rounded-br-[100px] rounded-bl-[50px] overflow-hidden min-h-[90vh] flex items-center">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-6 z-10">
          <h1 className="font-serif text-5xl md:text-6xl text-brand-primary leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-brand-text text-lg max-w-md leading-relaxed">
            {content.hero.subtitle}
          </p>
          <div className="pt-4">
            <Button onClick={() => window.location.href='#contato'}>
              {content.hero.cta}
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center">
           <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl transform scale-75"></div>
           <img 
             src={logo}
             alt="Cliente Feliz" 
             className="relative z-10 w-500 max-w-sm rounded-t-full rounded-b-3xl shadow-xl border-4 border-white/50"
           />
        </div>

      </div>
    </section>
  );
};

export default Hero;