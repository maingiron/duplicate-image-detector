
import React from "react";
import { ImageProvider } from "@/context/ImageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DirectoryInput from "@/components/DirectoryInput";
import DuplicateCarousel from "@/components/DuplicateCarousel";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <ImageProvider>
      <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        
        <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
          <section className="grid grid-cols-1 gap-12">
            <div className="space-y-6 animate-slide-in">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-3">
                  Encontre e gerencie imagens duplicadas
                </h2>
                <p className="text-muted-foreground">
                  Otimize seu espaço de armazenamento identificando e organizando imagens duplicadas
                  de forma rápida e eficiente.
                </p>
              </div>
              
              <Card className="max-w-2xl mx-auto p-6 shadow-sm">
                <DirectoryInput />
              </Card>
            </div>
            
            <AnaliseDuplicatas />
          </section>
        </main>
        
        <Footer />
      </div>
    </ImageProvider>
  );
};

const AnaliseDuplicatas = () => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="space-y-6">
      <Separator className="my-2" />
      <Card className="max-w-4xl mx-auto p-6 shadow-sm">
        <DuplicateCarousel />
      </Card>
    </div>
  );
};

export default Index;
