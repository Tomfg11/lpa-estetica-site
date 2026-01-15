import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './sections/Hero';
import Services from './sections/Services';
import About from './sections/About';
import Contact from './sections/Contact';
import Socials from './sections/Socials'; 

function App() {
  return (
    <div className="font-sans text-brand-text bg-white antialiased">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Contact />
        <Socials /> 
      </main>
      <Footer />
    </div>
  );
}

export default App;