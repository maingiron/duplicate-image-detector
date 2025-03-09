export interface ImageInfo {
  path: string;
  hash: string;
  width: number;
  height: number;
}

export interface DuplicateGroup {
  images: ImageInfo[];
}

// Function to calculate a simple perceptual hash of an image
export async function calculateImageHash(imageUrl: string): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Resize to 8x8 for simple perceptual hashing
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw image and reduce to grayscale
      ctx.drawImage(img, 0, 0, 8, 8);
      const imageData = ctx.getImageData(0, 0, 8, 8);
      const pixels = imageData.data;

      // Calculate average color
      let sum = 0;
      const grayPixels = new Array(64);
      for (let i = 0; i < pixels.length; i += 4) {
        const gray = Math.floor(
          (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
        );
        grayPixels[i / 4] = gray;
        sum += gray;
      }
      const avg = sum / 64;

      // Generate hash based on whether pixel is above or below average
      let hash = "";
      for (let i = 0; i < 64; i++) {
        hash += grayPixels[i] > avg ? "1" : "0";
      }

      resolve({
        path: imageUrl,
        hash,
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
}

// Function to compare two image hashes and return similarity (0-1)
export function compareHashes(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 0;

  let matchingBits = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] === hash2[i]) matchingBits++;
  }

  return matchingBits / hash1.length;
}

// Function to find duplicate images in a list
export function findDuplicates(
  images: ImageInfo[],
  threshold = 0.95
): DuplicateGroup[] {
  const duplicateGroups: DuplicateGroup[] = [];
  const processedImages = new Set<string>();

  for (let i = 0; i < images.length; i++) {
    if (processedImages.has(images[i].path)) continue;

    const currentGroup: ImageInfo[] = [images[i]];
    processedImages.add(images[i].path);

    for (let j = i + 1; j < images.length; j++) {
      if (processedImages.has(images[j].path)) continue;

      const similarity = compareHashes(images[i].hash, images[j].hash);
      if (similarity >= threshold) {
        currentGroup.push(images[j]);
        processedImages.add(images[j].path);
      }
    }

    if (currentGroup.length > 1) {
      duplicateGroups.push({ images: currentGroup });
    }
  }

  return duplicateGroups;
}
