import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

interface ApiImageInfo {
  path: string;
  originalPath: string;
  width: number;
  height: number;
  size: number;
  url: string; // served by python backend
}

interface ApiGroup {
  images: ApiImageInfo[];
}

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const PY_API = import.meta.env.VITE_PY_API || "http://127.0.0.1:8000";

const PythonUI: React.FC = () => {
  const [tolerance, setTolerance] = useState<number>(15);
  const [directory, setDirectory] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleScan = async () => {
    if (!directory) {
      setError("Informe o diretório para escanear");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setSelected(new Set());
    try {
      const res = await fetch(`${PY_API}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory, tolerance }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setGroups(data.groups || []);
      if (!data.groups || data.groups.length === 0) {
        setError("Nenhuma imagem duplicada encontrada");
      }
    } catch (e: any) {
      setError(e?.message || "Erro ao escanear");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggle = (origPath: string) => {
    const next = new Set(selected);
    if (next.has(origPath)) next.delete(origPath);
    else next.add(origPath);
    setSelected(next);
  };

  const handleCopyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      // no toast infra here to keep page self-contained
    } catch {}
  };

  const handleMove = async () => {
    if (selected.size === 0 || !directory) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${PY_API}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_directory: directory,
          paths: Array.from(selected),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      // remove moved items from UI
      const remaining = groups
        .map((g) => ({
          images: g.images.filter((img) => !selected.has(img.originalPath)),
        }))
        .filter((g) => g.images.length > 1);
      setGroups(remaining);
      setSelected(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
        <section className="grid grid-cols-1 gap-12">
          <div className="space-y-6 animate-slide-in">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Python Duplicate Image Detector
              </h1>
              <p className="mt-4 text-gray-500 md:text-xl">
                Mesma interface, usando o backend em Python.
              </p>
              <a href="http://localhost:8080/" className="text-blue-500">
                Script Regular
              </a>
            </div>

            <Card className="p-6">
              <div className="w-full max-w-md space-y-4 mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="directory">Diretório base</Label>
                  <Input
                    id="directory"
                    value={directory}
                    onChange={(e) => setDirectory(e.target.value)}
                    placeholder="C:\\Users\\me\\Pictures"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolerance">Tolerância (0-64 aprox.)</Label>
                  <Input
                    id="tolerance"
                    type="number"
                    min="0"
                    max="64"
                    step="1"
                    value={tolerance}
                    onChange={(e) =>
                      setTolerance(parseInt(e.target.value || "15", 10))
                    }
                  />
                  <p className="text-sm text-gray-500">
                    Valores maiores aceitam diferenças maiores entre imagens.
                  </p>
                </div>

                <div className="flex gap-4 w-full">
                  <Button
                    onClick={handleScan}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? "Processando..." : "Escanear"}
                  </Button>
                  <Button
                    onClick={handleMove}
                    disabled={isProcessing || selected.size === 0}
                    variant="secondary"
                    className="flex-1"
                  >
                    Mover Selecionadas ({selected.size})
                  </Button>
                </div>
                {error && (
                  <div className="text-red-500 text-center">{error}</div>
                )}
              </div>

              {groups.length > 0 && (
                <div className="w-full max-w-4xl space-y-4 mt-8 mx-auto">
                  <h2 className="text-2xl font-bold text-center mb-4">
                    Encontrados {groups.length} grupos
                  </h2>
                  {groups.map((group, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle>Grupo {i + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.images.map((img, j) => (
                            <div
                              key={j}
                              className="flex flex-col gap-4 p-4 border rounded-lg"
                            >
                              <div className="relative w-full aspect-square">
                                <img
                                  src={`${PY_API}${img.url}`}
                                  alt={`Duplicate ${j + 1}`}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <p
                                    className="font-medium truncate flex-1"
                                    title={img.originalPath}
                                  >
                                    {img.path}
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleCopyName(img.path)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Size: {formatFileSize(img.size)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Dimensions: {img.width} × {img.height}
                                </p>
                                <Button
                                  variant={
                                    selected.has(img.originalPath)
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => toggle(img.originalPath)}
                                >
                                  {selected.has(img.originalPath)
                                    ? "Selecionada"
                                    : "Selecionar"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PythonUI;
