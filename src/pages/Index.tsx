import React from "react";
import { ImageProvider } from "@/context/ImageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DuplicateImageFinder } from "@/components/DuplicateImageFinder";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <ImageProvider>
      <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />

        <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
          <section className="grid grid-cols-1 gap-12">
            <div className="space-y-6 animate-slide-in">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Duplicate Image Detector
                </h1>
                <p className="mt-4 text-gray-500 md:text-xl">
                  Select a directory to find duplicate images using perceptual
                  hashing.
                </p>
              </div>

              <Card className="p-6">
                <DuplicateImageFinder />
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ImageProvider>
  );
};

export default Index;
