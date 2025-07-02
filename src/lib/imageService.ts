export interface ImageInfo {
  path: string;
  hash: string;
  averageHash: string;
  differenceHash: string;
  width: number;
  height: number;
}

export interface DuplicateGroup {
  images: ImageInfo[];
}

// Calculate average hash (aHash)
async function calculateAverageHash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<string> {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let sum = 0;
  const grayPixels = new Array(width * height);

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = Math.floor(
      pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
    );
    grayPixels[i / 4] = gray;
    sum += gray;
  }

  const avg = sum / (width * height);
  return grayPixels.map((gray) => (gray > avg ? "1" : "0")).join("");
}

// Calculate difference hash (dHash)
async function calculateDifferenceHash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<string> {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const grayPixels = new Array(width * height);

  // Convert to grayscale
  for (let i = 0; i < pixels.length; i += 4) {
    grayPixels[i / 4] = Math.floor(
      pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
    );
  }

  // Calculate differences
  let hash = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = y * width + x;
      hash += grayPixels[idx] > grayPixels[idx + 1] ? "1" : "0";
    }
  }

  return hash;
}

// Calculate perceptual hash (pHash)
async function calculatePerceptualHash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): Promise<string> {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const matrix = new Array(height);

  // Convert to grayscale and create 2D matrix
  for (let y = 0; y < height; y++) {
    matrix[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      matrix[y][x] = Math.floor(
        pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114
      );
    }
  }

  // Calculate DCT (Discrete Cosine Transform)
  const dct = calculateDCT(matrix);

  // Get the top-left 8x8 portion of the DCT
  let sum = 0;
  const dctValues = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (x === 0 && y === 0) continue; // Skip DC coefficient
      const value = dct[y][x];
      dctValues.push(value);
      sum += value;
    }
  }

  // Calculate median value
  const median = sum / 63;

  // Generate hash based on whether each value is above median
  return dctValues.map((val) => (val > median ? "1" : "0")).join("");
}

// Helper function to calculate DCT
function calculateDCT(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result = Array(N)
    .fill(0)
    .map(() => Array(N).fill(0));

  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      let sum = 0;
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          sum +=
            matrix[x][y] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
        }
      }
      result[u][v] =
        sum *
        (u === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N)) *
        (v === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N));
    }
  }

  return result;
}

// Calculate Hamming distance between two hashes
function hammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

// Calculate similarity score between two images using multiple hashes
function calculateSimilarity(img1: ImageInfo, img2: ImageInfo): number {
  const hashLength = img1.hash.length;
  const aHashDistance =
    hammingDistance(img1.averageHash, img2.averageHash) / hashLength;
  const dHashDistance =
    hammingDistance(img1.differenceHash, img2.differenceHash) / hashLength;
  const pHashDistance = hammingDistance(img1.hash, img2.hash) / hashLength;

  // Weight the different hash methods with more balanced weights
  const similarity =
    1 -
    (aHashDistance * 0.3 + // Increased weight for average hash
      dHashDistance * 0.3 + // Equal weight for difference hash
      pHashDistance * 0.4); // Slightly reduced weight for perceptual hash

  return similarity;
}

export async function calculateImageHash(imageUrl: string): Promise<ImageInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = async () => {
      // Create canvas with 8x8 size for hashing
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw and calculate different types of hashes
      ctx.drawImage(img, 0, 0, 8, 8);
      const [averageHash, differenceHash, perceptualHash] = await Promise.all([
        calculateAverageHash(ctx, 8, 8),
        calculateDifferenceHash(ctx, 8, 8),
        calculatePerceptualHash(ctx, 8, 8),
      ]);

      resolve({
        path: imageUrl,
        hash: perceptualHash,
        averageHash,
        differenceHash,
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
}

export function findDuplicates(
  images: ImageInfo[],
  threshold = 0.75 // Lowered threshold significantly for more matches
): DuplicateGroup[] {
  const duplicateGroups: DuplicateGroup[] = [];
  const processedImages = new Set<string>();

  for (let i = 0; i < images.length; i++) {
    if (processedImages.has(images[i].path)) continue;

    const currentGroup: ImageInfo[] = [images[i]];
    processedImages.add(images[i].path);

    for (let j = i + 1; j < images.length; j++) {
      if (processedImages.has(images[j].path)) continue;

      const similarity = calculateSimilarity(images[i], images[j]);
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
