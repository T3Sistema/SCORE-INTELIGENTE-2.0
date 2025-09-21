import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-light-background dark:bg-dark-background text-center py-5 border-t border-light-border dark:border-dark-border">
      <div className="container mx-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by: <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Triad3 Inteligência Digital</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;