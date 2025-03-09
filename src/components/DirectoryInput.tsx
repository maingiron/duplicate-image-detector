
import React from "react";
import { Search, FolderOpen } from "lucide-react";
import { useImageContext } from "@/context/ImageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DirectoryInput = () => {
  const { directory, setDirectory, scanDirectory, isLoading } = useImageContext();

  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col gap-2 mb-2">
        <label htmlFor="directory" className="text-sm font-medium text-muted-foreground">
          Diretório das imagens
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <FolderOpen className="w-5 h-5" />
          </div>
          <Input
            id="directory"
            type="text"
            placeholder="C:\Imagens\Minhas Fotos"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            className="pl-10 pr-4 py-3 transition-all border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Button 
        onClick={scanDirectory} 
        disabled={isLoading || !directory}
        className="w-full mt-2 py-6 transition-all"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin"></div>
            <span>Verificando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span>Verificar imagens duplicadas</span>
          </div>
        )}
      </Button>
    </div>
  );
};

export default DirectoryInput;
