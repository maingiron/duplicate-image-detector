
import React from "react";
import { Image } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b py-4 px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-10 animate-fade-in">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md">
              <Image className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              Detector de Imagens Duplicadas
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
