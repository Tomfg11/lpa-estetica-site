import React from 'react';
import logo from '../../assets/logo-lpa.png';

const Footer = () => {
  return (
    <footer className="bg-brand-primary py-10 text-center text-white/80 text-sm flex flex-col items-center space-y-4 px-6">
      
      {/* CÍRCULO BRANCO DO FUNDO */}
      <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white shrink-0">
        <img 
          src={logo} 
          alt="LPA Estética Logo Footer" 
          className="w-full h-full object-cover scale-[1.8] transform-gpu" 
        />
      </div>

      <p>&copy; {new Date().getFullYear()} LPA Estética. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;