import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-light text-stone-primary tracking-wider">
          Johana Escobar
        </h1>
        <p className="text-sm text-stone-secondary">Controle Financeiro & Agenda</p>
      </div>
    </header>
  );
};

export default Header;