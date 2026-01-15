import React from 'react';
import { content } from '../data/content';

const Socials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-brand-light to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        
        <h2 className="font-serif text-3xl md:text-4xl text-brand-primary mb-4">
          {content.socials.title}
        </h2>
        <p className="text-brand-text mb-12 max-w-lg mx-auto">
          {content.socials.subtitle}
        </p>

        {/* ALTERAÇÃO: Mudei para md:grid-cols-3 para caber os 3 lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. INSTAGRAM */}
          <a 
            href={content.socials.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
          >
            <div className="relative z-10 flex flex-col items-center text-white">
              <svg className="w-12 h-12 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <h3 className="text-xl font-bold mb-1">Instagram</h3>
              <p className="text-sm opacity-90">Resultados diários</p>
            </div>
          </a>

          {/* 2. TIKTOK (NOVO) */}
          <a 
            href={content.socials.tiktok} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-black"
          >
            <div className="relative z-10 flex flex-col items-center text-white">
              {/* Ícone TikTok */}
              <svg className="w-12 h-12 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <h3 className="text-xl font-bold mb-1">TikTok</h3>
              <p className="text-sm opacity-90">Vídeos dos bastidores</p>
            </div>
            {/* Efeito decorativo ciano/magenta atrás */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#25F4EE] blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#FE2C55] blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </a>

          {/* 3. GRUPO VIP */}
          <a 
            href={content.socials.vipGroup} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-green-500"
          >
            <div className="relative z-10 flex flex-col items-center text-white">
              <svg className="w-12 h-12 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <h3 className="text-xl font-bold mb-1">Grupo VIP</h3>
              <p className="text-sm opacity-90">Ofertas exclusivas</p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
};

export default Socials;