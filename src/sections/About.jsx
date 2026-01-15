import React from 'react';
import { content } from '../data/content';
import logo from '../assets/Let.png';

const About = () => {
  return (
    <section id="sobre" className="py-24 bg-brand-light/30">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Imagem com formato diferenciado */}
        <div className="relative order-2 md:order-1">
          <div className="absolute inset-0 bg-brand-accent/10 rounded-full transform -translate-x-4 translate-y-4"></div>
          <img 
            src={logo} 
            alt="Profissional Estética" 
            className="relative z-10 w-full rounded-t-[200px] rounded-b-2xl shadow-lg border-4 border-white"
          />
        </div>

        <div className="order-1 md:order-2">
          <h2 className="font-serif text-4xl text-brand-primary mb-6">
            {content.about.title}
          </h2>
          <div className="space-y-4 text-brand-text leading-relaxed">
            <p>{content.about.text}</p>
            <p>{content.about.text2}</p>
          </div>
          
          <div className="mt-8 font-serif italic text-2xl text-brand-primary/80">
            {content.about.signature}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;