import React from 'react';

/**
 * FidelityCard — Cartão fidelidade visual com animação de preenchimento.
 * Mobile-first: projetado para telas de celular.
 *
 * @param {number} currentPoints - Pontos atuais da cliente
 * @param {number} maxPoints - Máximo de pontos (default: 10)
 */
const FidelityCard = ({ currentPoints = 0, maxPoints = 10 }) => {
  const isComplete = currentPoints >= maxPoints;

  return (
    <div className={`relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${
      isComplete 
        ? 'ring-2 ring-yellow-400 shadow-yellow-400/30' 
        : 'shadow-brand-primary/10'
    }`}>
      {/* Fundo gradiente do cartão */}
      <div className={`p-6 ${
        isComplete
          ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500'
          : 'bg-gradient-to-br from-brand-primary via-[#8B3A47] to-[#5C1E28]'
      }`}>
        {/* Header do cartão */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white/90 text-xs font-sans uppercase tracking-widest">
              Cartão Fidelidade
            </h3>
            <p className="text-white font-serif text-lg font-bold mt-0.5">
              LPA Estética
            </p>
          </div>
          <div className="text-3xl">
            {isComplete ? '🏆' : '💳'}
          </div>
        </div>

        {/* Grid de pontos — 2 fileiras de 5 */}
        <div className="grid grid-cols-5 gap-2.5 mb-5">
          {Array.from({ length: maxPoints }, (_, index) => {
            const isFilled = index < currentPoints;
            return (
              <div
                key={index}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isFilled
                    ? isComplete
                      ? 'bg-white/30 backdrop-blur-sm scale-100'
                      : 'bg-white/25 backdrop-blur-sm scale-100'
                    : 'bg-white/10 scale-95'
                }`}
                style={{
                  animationDelay: isFilled ? `${index * 80}ms` : '0ms',
                }}
              >
                {isFilled ? (
                  <svg
                    className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-brand-accent'} drop-shadow-sm`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-white/30 text-xs font-bold">
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-white/15 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete
                ? 'bg-white'
                : 'bg-gradient-to-r from-brand-accent to-brand-peach'
            }`}
            style={{ width: `${(currentPoints / maxPoints) * 100}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <p className="text-white/80 text-xs font-sans">
            {isComplete
              ? '🎉 Recompensa liberada!'
              : `${currentPoints} de ${maxPoints} marcações`}
          </p>
          <p className="text-white font-bold text-sm font-sans">
            {Math.round((currentPoints / maxPoints) * 100)}%
          </p>
        </div>
      </div>

      {/* Efeito de brilho quando completo */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
};

export default FidelityCard;
