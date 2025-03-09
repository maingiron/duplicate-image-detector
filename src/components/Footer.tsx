
import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto py-4 px-6 text-center text-sm text-muted-foreground animate-fade-in">
      <p>© {new Date().getFullYear()} Detector de Imagens Duplicadas</p>
    </footer>
  );
};

export default Footer;
