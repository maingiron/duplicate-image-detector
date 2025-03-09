import { useState } from "react";
import {
  calculateImageHash,
  findDuplicates,
  type DuplicateGroup,
  type ImageInfo,
} from "../lib/imageService";
import { moveFilesToDirectory } from "../lib/fileService";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import React from "react";

interface ExtendedImageInfo extends ImageInfo {
  url: string;
  size: number;
  file: File;
  originalPath: string;
}

interface ExtendedDuplicateGroup {
  images: ExtendedImageInfo[];
}

// Define supported image formats
const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/heic",
  "image/heif",
];

export function DuplicateImageFinder() {
  const [duplicateGroups, setDuplicateGroups] = useState<
    ExtendedDuplicateGroup[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [baseDirectory, setBaseDirectory] = useState<string>("");

  const handleDirectorySelect = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSelectedImages(new Set());

      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.webkitdirectory = true;

      // Handle file selection
      input.onchange = async (e) => {
        const files = Array.from(
          (e.target as HTMLInputElement).files || []
        ).filter((file) => {
          // Check if the file type is in our supported formats
          if (SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
            return true;
          }

          // Check file extension for formats that might not have proper MIME types
          const extension = file.name.toLowerCase().split(".").pop();
          const supportedExtensions = [
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "bmp",
            "tiff",
            "tif",
            "svg",
            "ico",
            "heic",
            "heif",
          ];
          return extension && supportedExtensions.includes(extension);
        });

        if (files.length === 0) {
          setError("No image files found in the selected directory");
          setIsProcessing(false);
          return;
        }

        // Get the base directory from the first file
        const firstFile = files[0];
        const basePath = firstFile.webkitRelativePath.split("/")[0];
        setBaseDirectory(basePath);

        try {
          // Process each image and calculate its hash
          const imageInfos: ExtendedImageInfo[] = await Promise.all(
            files.map(async (file) => {
              const imageUrl = URL.createObjectURL(file);
              try {
                const imageInfo = await calculateImageHash(imageUrl);
                return {
                  ...imageInfo,
                  path: file.name,
                  url: imageUrl,
                  size: file.size,
                  file: file,
                  originalPath: file.webkitRelativePath,
                };
              } catch (err) {
                URL.revokeObjectURL(imageUrl);
                console.warn(`Failed to process image ${file.name}:`, err);
                return null; // Return null for failed images
              }
            })
          );

          // Filter out failed images
          const validImageInfos = imageInfos.filter(
            (info): info is ExtendedImageInfo => info !== null
          );

          if (validImageInfos.length === 0) {
            setError("No valid images could be processed");
            setIsProcessing(false);
            return;
          }

          // Find duplicates
          const duplicates = findDuplicates(
            validImageInfos
          ) as ExtendedDuplicateGroup[];
          setDuplicateGroups(duplicates);

          if (duplicates.length === 0) {
            // Clean up URLs if no duplicates found
            validImageInfos.forEach((info) => URL.revokeObjectURL(info.url));
            setError("No duplicate images found");
          }

          // Show warning if some images failed to process
          if (validImageInfos.length < files.length) {
            console.warn(
              `${
                files.length - validImageInfos.length
              } images failed to process`
            );
          }
        } catch (err) {
          setError(
            "Error processing images: " +
              (err instanceof Error ? err.message : String(err))
          );
        }

        setIsProcessing(false);
      };

      // Trigger file input click
      input.click();
    } catch (err) {
      setError(
        "Error selecting directory: " +
          (err instanceof Error ? err.message : String(err))
      );
      setIsProcessing(false);
    }
  };

  const handleMoveSelectedImages = async () => {
    if (selectedImages.size === 0) return;

    try {
      setIsProcessing(true);

      // Get all selected files
      const filesToMove = duplicateGroups
        .flatMap((group) => group.images)
        .filter((image) => selectedImages.has(image.path))
        .map((image) => image.file);

      // Move files to marked_for_deletion directory in the same base directory
      await moveFilesToDirectory(filesToMove, baseDirectory);

      // Update duplicate groups to reflect moved images
      const updatedGroups = duplicateGroups
        .map((group) => ({
          images: group.images.filter((img) => !selectedImages.has(img.path)),
        }))
        .filter((group) => group.images.length > 1);

      setDuplicateGroups(updatedGroups);
      setSelectedImages(new Set());
    } catch (err) {
      setError(
        "Error moving images: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleImageSelection = (imagePath: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imagePath)) {
      newSelection.delete(imagePath);
    } else {
      newSelection.add(imagePath);
    }
    setSelectedImages(newSelection);
  };

  // Format file size to human-readable format
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

  // Cleanup URLs when component unmounts or when new directory is selected
  React.useEffect(() => {
    return () => {
      duplicateGroups.forEach((group) => {
        group.images.forEach((image) => {
          URL.revokeObjectURL(image.url);
        });
      });
    };
  }, [duplicateGroups]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 w-full max-w-md">
          <Button
            onClick={handleDirectorySelect}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Select Directory"}
          </Button>

          <Button
            onClick={handleMoveSelectedImages}
            disabled={isProcessing || selectedImages.size === 0}
            variant="secondary"
            className="flex-1"
          >
            Move Selected ({selectedImages.size})
          </Button>
        </div>

        {error && <div className="text-red-500 text-center">{error}</div>}

        {duplicateGroups.length > 0 && (
          <div className="w-full max-w-4xl space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">
              Found {duplicateGroups.length} groups of duplicate images
            </h2>

            {duplicateGroups.map((group, groupIndex) => (
              <Card key={groupIndex}>
                <CardHeader>
                  <CardTitle>Group {groupIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.images.map((image, imageIndex) => (
                      <div
                        key={imageIndex}
                        className="flex flex-col gap-4 p-4 border rounded-lg"
                      >
                        <div className="relative w-full aspect-square">
                          <img
                            src={image.url}
                            alt={`Duplicate ${imageIndex + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="space-y-2">
                          <p
                            className="font-medium truncate"
                            title={image.originalPath}
                          >
                            {image.path}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {formatFileSize(image.size)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Dimensions: {image.width} × {image.height}
                          </p>
                          <Button
                            variant={
                              selectedImages.has(image.path)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => toggleImageSelection(image.path)}
                          >
                            {selectedImages.has(image.path)
                              ? "Selected"
                              : "Select"}
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
      </div>
    </div>
  );
}
