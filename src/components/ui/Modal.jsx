import React, { useEffect } from 'react';

/**
 * Modal — Componente modal reutilizável com overlay e animação.
 * Mobile-first: ocupa tela toda no mobile, centralizado no desktop.
 *
 * @param {boolean} isOpen - Controla visibilidade
 * @param {function} onClose - Callback ao fechar
 * @param {string} title - Título do modal
 * @param {ReactNode} children - Conteúdo do modal
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Bloqueia scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fecha com tecla Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay escuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Conteúdo do modal */}
      <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between z-10">
          {/* Indicador de arraste no mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden" />

          <h2 className="font-serif text-xl text-brand-primary font-bold mt-2 sm:mt-0">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-primary transition-colors p-1 -mr-1"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
