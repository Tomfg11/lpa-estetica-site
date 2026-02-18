import React, { useState } from 'react';

const Card = ({ title, description, images, items, actionLabel = "Agendar Agora", onAction }) => {
  // 1. INICIALIZAÇÃO SEGURA:
  // Começamos o estado já com a primeira imagem. Sem useEffect.
  const [currentImage, setCurrentImage] = useState(images && images.length > 0 ? images[0] : '');
  
  // Estado para marcar qual item está selecionado (para ficar azulzinho/destacado)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  // Função para trocar a foto quando clica no serviço
  const handleItemClick = (image, index) => {
    // Só troca a foto se o item tiver uma imagem configurada no content.js
    if (image) {
      setCurrentImage(image);
    }
    // Marca o item como selecionado de qualquer forma (feedback visual)
    setSelectedItemIndex(index);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden relative">
      
      {/* ÁREA DA IMAGEM */}
      <div className="h-64 w-full overflow-hidden relative bg-gray-100"> 
        <img 
          src={currentImage} 
          alt={title} 
          className="w-full h-full object-cover transition-all duration-500 ease-in-out" 
        />
        {/* Gradiente para dar leitura caso tenha texto em cima */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        
        {/* Dica visual flutuante */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
           Ver resultado acima
        </div>
      </div>
      
      {/* CONTEÚDO */}
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <h3 className="font-serif text-2xl text-brand-primary mb-2 font-semibold">
          {title}
        </h3>
        
        <p className="text-brand-text text-sm mb-6 leading-relaxed">
          {description}
        </p>

        {/* LISTA DE PREÇOS INTERATIVA */}
        {items && (
          <div className="w-full mb-6 space-y-2 bg-gray-50 p-3 rounded-xl flex-grow">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
              Toque nos itens para ver fotos
            </p>
            
            {items.map((item, index) => (
              <div 
                key={index}
                // AÇÃO DE CLIQUE:
                onClick={() => handleItemClick(item.image, index)}
                className={`flex justify-between items-center text-sm p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedItemIndex === index 
                    ? 'bg-white border-brand-primary shadow-sm ring-1 ring-brand-primary/20' // Estilo Selecionado
                    : 'border-transparent hover:bg-white hover:border-gray-200' // Estilo Normal
                }`}
              >
                <div className="text-left flex items-center gap-2">
                    {/* Ícone condicional: Mostra câmera se tiver foto, ou bolinha se não tiver */}
                    <div className={`p-1.5 rounded-full ${selectedItemIndex === index ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {item.image ? (
                        /* Ícone de Câmera */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                          <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                          <path fillRule="evenodd" d="M9.344 3.071a4.988 4.988 0 011.65-.945A24.89 24.89 0 0112 2c.983 0 1.948.096 2.888.277.633.123 1.205.446 1.65.945l.233.26c.38.423.916.67 1.485.684.975.023 1.93.181 2.834.463A4.542 4.542 0 0124 9.07v6.621a4.544 4.544 0 01-3.69 4.417A25.106 25.106 0 0112 21c-1.348 0-2.668-.086-3.953-.251a4.545 4.545 0 01-3.69-4.417V9.07a4.543 4.543 0 012.947-4.239c.904-.282 1.86-.44 2.834-.463.568-.014 1.104-.26 1.485-.683l.233-.26zM5.5 12a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        /* Bolinha simples para itens sem foto */
                        <div className="w-3 h-3 rounded-full bg-current opacity-50" />
                      )}
                    </div>

                    <div>
                      <span className={`font-medium block ${selectedItemIndex === index ? 'text-brand-primary' : 'text-gray-700'}`}>
                        {item.name}
                      </span>
                    </div>
                </div>
                <span className="text-brand-primary font-bold whitespace-nowrap ml-2">{item.price}</span>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={onAction}
          className="mt-auto w-full py-3 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/30 hover:bg-brand-accent hover:scale-[1.02] active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default Card;