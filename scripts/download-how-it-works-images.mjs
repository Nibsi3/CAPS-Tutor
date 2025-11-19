import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../public/images/how-it-works');
const APPWRITE_OUTPUT_DIR = path.resolve(
  __dirname,
  '../appwrite-source-deploy/public/images/how-it-works'
);
const DATA_MANIFEST_PATH = path.resolve(__dirname, '../src/data/how-it-works-images.json');
const APPWRITE_DATA_MANIFEST_PATH = path.resolve(
  __dirname,
  '../appwrite-source-deploy/src/data/how-it-works-images.json'
);
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error('Please provide a PEXELS_API_KEY environment variable before running this script.');
  process.exit(1);
}

const photoMap = [
  { id: 3760868, slug: 'intelligent-content' },
  { id: 3760826, slug: 'adaptive-learning' },
  { id: 3760864, slug: 'ai-feedback' },
  { id: 4560140, slug: 'progress-tracking' },
  { id: 3760852, slug: 'caps-alignment' },
  { id: 3760861, slug: 'interactive-tutoring' },
];

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function fetchPhotoMetadata(id) {
  const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch metadata for photo ${id}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

async function run() {
  await ensureDir(OUTPUT_DIR);
  await ensureDir(APPWRITE_OUTPUT_DIR);
  const manifest = [];

  for (const { id, slug } of photoMap) {
    console.log(`Processing Pexels photo ${id} (${slug})...`);
    const metadata = await fetchPhotoMetadata(id);
    const imageUrl =
      metadata?.src?.large2x ||
      metadata?.src?.landscape ||
      metadata?.src?.original ||
      getFallbackUrl(id);

    const buffer = await downloadImage(imageUrl);
    const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
    await fs.promises.writeFile(outputPath, buffer);
    const appwriteOutputPath = path.join(APPWRITE_OUTPUT_DIR, `${slug}.jpg`);
    await fs.promises.writeFile(appwriteOutputPath, buffer);

    manifest.push({
      slug,
      photoId: id,
      photographer: metadata.photographer,
      photographer_url: metadata.photographer_url,
      alt: metadata.alt || `${metadata.photographer}'s photo from Pexels`,
      localPath: `/images/how-it-works/${slug}.jpg`,
      originalUrl: metadata.url,
    });

    console.log(`Saved ${outputPath}`);
  }

  const publicManifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.promises.writeFile(publicManifestPath, JSON.stringify(manifest, null, 2));
  await ensureDir(path.dirname(DATA_MANIFEST_PATH));
  await ensureDir(path.dirname(APPWRITE_DATA_MANIFEST_PATH));
  await fs.promises.writeFile(DATA_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await fs.promises.writeFile(APPWRITE_DATA_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    `Manifest updated at ${publicManifestPath}, ${DATA_MANIFEST_PATH}, and ${APPWRITE_DATA_MANIFEST_PATH}`
  );
}

function getFallbackUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2070&dpr=2`;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

