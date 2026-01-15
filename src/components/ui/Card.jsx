import React, { useState } from 'react';

// 1. Recebemos 'onAction' aqui nas propriedades
const Card = ({ title, description, images, items, actionLabel = "Agendar Agora", onAction }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e) => {
    // Não precisa mais de stopPropagation pois o card não tem clique geral,
    // mas mal não faz manter.
    e.stopPropagation(); 
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    // Removi 'group' e hovers de clique para não parecer um botão gigante, 
    // mas mantive a sombra e o translate para ficar bonito.
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden relative">
      
      {/* ÁREA DA IMAGEM */}
      <div className="h-48 w-full overflow-hidden relative bg-gray-100 group"> 
      {/* Adicionei 'group' aqui na imagem para as setas aparecerem só ao passar o mouse na FOTO (no desktop) */}
        
        <img 
          src={images[currentImageIndex]} 
          alt={`${title} - Foto ${currentImageIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-500" 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>

        {/* CONTROLES DO CARROSSEL */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-primary rounded-full p-1.5 shadow-md backdrop-blur-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Foto Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-primary rounded-full p-1.5 shadow-md backdrop-blur-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Próxima Foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${
                    idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* CONTEÚDO DO TEXTO */}
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <h3 className="font-serif text-2xl text-brand-primary mb-3 font-semibold">
          {title}
        </h3>
        
        <p className="text-brand-text text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {items && (
          <div className="w-full mb-6 space-y-3 bg-gray-50 p-4 rounded-lg">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                <span className="text-gray-600 font-medium text-left">{item.name}</span>
                <span className="text-brand-primary font-bold whitespace-nowrap ml-2">{item.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* 2. O CLIQUE AGORA É AQUI NO BOTÃO */}
        <button 
          onClick={onAction}
          className="mt-auto text-brand-primary text-sm font-medium border-b border-brand-accent pb-1 hover:text-brand-accent transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default Card;