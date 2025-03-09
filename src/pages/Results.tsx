
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { ImageProvider, useImageContext } from "@/context/ImageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DuplicateCarousel from "@/components/DuplicateCarousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ResultsContent = () => {
  const { duplicatePairs, directory } = useImageContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resultados da análise</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <FolderOpen className="w-4 h-4" />
            <span className="truncate max-w-md">{directory}</span>
          </div>
        </div>
        
        <Button variant="outline" onClick={() => navigate("/")} className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Button>
      </div>

      {duplicatePairs.length > 0 ? (
        <Card className="p-6 shadow-sm">
          <DuplicateCarousel />
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <h3 className="text-xl font-medium mb-2">Nenhuma duplicata encontrada</h3>
          <p className="text-muted-foreground">
            Não foram encontradas imagens duplicadas no diretório selecionado.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Verificar outro diretório
          </Button>
        </Card>
      )}
    </div>
  );
};

const Results = () => {
  return (
    <ImageProvider>
      <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        
        <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
          <ResultsContent />
        </main>
        
        <Footer />
      </div>
    </ImageProvider>
  );
};

export default Results;
