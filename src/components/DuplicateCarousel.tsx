
import React from "react";
import { ChevronLeft, ChevronRight, Trash2, Info } from "lucide-react";
import { useImageContext } from "@/context/ImageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";

const DuplicateCarousel = () => {
  const { 
    duplicatePairs, 
    currentPairIndex, 
    setCurrentPairIndex, 
    removeDuplicate,
    isLoading 
  } = useImageContext();

  if (duplicatePairs.length === 0) {
    return null;
  }

  const currentPair = duplicatePairs[currentPairIndex];
  const totalPairs = duplicatePairs.length;

  const goToNextPair = () => {
    setCurrentPairIndex((currentPairIndex + 1) % totalPairs);
  };

  const goToPrevPair = () => {
    setCurrentPairIndex((currentPairIndex - 1 + totalPairs) % totalPairs);
  };

  const handleRemoveDuplicate = () => {
    removeDuplicate(currentPair.duplicate);
  };

  const renderImageInfo = (image: typeof currentPair.original) => (
    <div className="flex flex-col gap-1 text-sm mt-2">
      <p className="text-muted-foreground"><span className="font-medium text-foreground">Nome:</span> {image.name}</p>
      <p className="text-muted-foreground"><span className="font-medium text-foreground">Tamanho:</span> {formatBytes(image.size)}</p>
      <p className="text-muted-foreground"><span className="font-medium text-foreground">Dimensões:</span> {image.dimensions.width}x{image.dimensions.height} px</p>
      <p className="text-muted-foreground truncate"><span className="font-medium text-foreground">Caminho:</span> {image.path}</p>
    </div>
  );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Duplicatas encontradas
        </h2>
        <span className="text-sm text-muted-foreground">
          {currentPairIndex + 1} de {totalPairs}
        </span>
      </div>
      
      <div className="relative flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 z-10 opacity-90 hover:opacity-100 bg-white shadow-md"
          onClick={goToPrevPair}
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-hidden">
          <Card className="overflow-hidden bg-white shadow-md animate-scale-in p-4">
            <div className="relative aspect-square bg-secondary/50 rounded-md overflow-hidden">
              <div className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded-md shadow-sm">
                Original
              </div>
              <img 
                src="/placeholder.svg" 
                alt="Imagem original" 
                className="w-full h-full object-contain"
              />
            </div>
            {renderImageInfo(currentPair.original)}
          </Card>
          
          <Card className="overflow-hidden bg-white shadow-md animate-scale-in p-4">
            <div className="relative aspect-square bg-secondary/50 rounded-md overflow-hidden">
              <div className="absolute top-2 left-2 bg-destructive/80 text-destructive-foreground text-xs px-2 py-1 rounded-md shadow-sm">
                Duplicada
              </div>
              <img 
                src="/placeholder.svg" 
                alt="Imagem duplicada" 
                className="w-full h-full object-contain"
              />
            </div>
            {renderImageInfo(currentPair.duplicate)}
          </Card>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 z-10 opacity-90 hover:opacity-100 bg-white shadow-md"
          onClick={goToNextPair}
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <Button
        variant="destructive"
        className="w-full mt-6"
        onClick={handleRemoveDuplicate}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-t-transparent border-destructive-foreground rounded-full animate-spin"></div>
            <span>Processando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            <span>Remover imagem duplicada</span>
          </div>
        )}
      </Button>
      
      <p className="text-sm text-muted-foreground mt-2 text-center">
        A imagem será movida para a pasta "imagens duplicadas" no diretório selecionado
      </p>
    </div>
  );
};

export default DuplicateCarousel;
