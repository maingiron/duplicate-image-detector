
import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { DuplicatePair, ImageInfo } from "@/types";

interface ImageContextProps {
  directory: string;
  setDirectory: (directory: string) => void;
  duplicatePairs: DuplicatePair[];
  setDuplicatePairs: (pairs: DuplicatePair[]) => void;
  currentPairIndex: number;
  setCurrentPairIndex: (index: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  scanDirectory: () => void;
  removeDuplicate: (duplicate: ImageInfo) => void;
}

const ImageContext = createContext<ImageContextProps | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [directory, setDirectory] = useState<string>("");
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>([]);
  const [currentPairIndex, setCurrentPairIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulated scan function (in a real app, this would be connected to a backend)
  const scanDirectory = async () => {
    if (!directory) {
      toast.error("Por favor, insira um diretório válido.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call / processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration (in a real app, this would come from the backend)
      const mockDuplicates: DuplicatePair[] = [
        {
          original: {
            path: `${directory}/image1.jpg`,
            name: "image1.jpg",
            size: 1024000,
            dimensions: { width: 1920, height: 1080 }
          },
          duplicate: {
            path: `${directory}/subfolder/image1_copy.jpg`,
            name: "image1_copy.jpg",
            size: 1024000,
            dimensions: { width: 1920, height: 1080 }
          }
        },
        {
          original: {
            path: `${directory}/image2.png`,
            name: "image2.png",
            size: 2048000,
            dimensions: { width: 3840, height: 2160 }
          },
          duplicate: {
            path: `${directory}/backup/image2_duplicate.png`,
            name: "image2_duplicate.png",
            size: 2048000,
            dimensions: { width: 3840, height: 2160 }
          }
        },
        {
          original: {
            path: `${directory}/profile.jpg`,
            name: "profile.jpg",
            size: 512000,
            dimensions: { width: 800, height: 800 }
          },
          duplicate: {
            path: `${directory}/old/profile_copy.jpg`,
            name: "profile_copy.jpg",
            size: 512000,
            dimensions: { width: 800, height: 800 }
          }
        }
      ];
      
      setDuplicatePairs(mockDuplicates);
      setCurrentPairIndex(0);
      
      if (mockDuplicates.length > 0) {
        toast.success(`Encontradas ${mockDuplicates.length} imagens duplicadas.`);
      } else {
        toast.info("Nenhuma imagem duplicada encontrada.");
      }
    } catch (error) {
      toast.error("Erro ao verificar imagens duplicadas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated remove function
  const removeDuplicate = async (duplicate: ImageInfo) => {
    try {
      setIsLoading(true);
      
      // Simulate API call / processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPairs = [...duplicatePairs];
      newPairs.splice(currentPairIndex, 1);
      
      setDuplicatePairs(newPairs);
      
      if (currentPairIndex >= newPairs.length && newPairs.length > 0) {
        setCurrentPairIndex(newPairs.length - 1);
      }
      
      toast.success(
        `Imagem "${duplicate.name}" movida para a pasta "imagens duplicadas".`
      );
      
      if (newPairs.length === 0) {
        toast.info("Todas as duplicatas foram processadas!");
      }
    } catch (error) {
      toast.error("Erro ao mover a imagem duplicada.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageContext.Provider
      value={{
        directory,
        setDirectory,
        duplicatePairs,
        setDuplicatePairs,
        currentPairIndex,
        setCurrentPairIndex,
        isLoading,
        setIsLoading,
        scanDirectory,
        removeDuplicate
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};
