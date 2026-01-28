import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const targetDirs = [
  "public/gallery-pics",
  "public/images",
  "public/magazine",
  "src/assets",
];

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const original = await fs.promises.readFile(filePath);
  const originalSize = original.length;

  let pipeline = sharp(original);

  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 72, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ quality: 72, compressionLevel: 9 });
  } else {
    return;
  }

  const optimized = await pipeline.toBuffer();

  if (optimized.length < originalSize) {
    await fs.promises.writeFile(filePath, optimized);
  }
}

async function optimizeDir(relativeDir) {
  const dir = path.join(process.cwd(), relativeDir);
  let entries;
  try {
    entries = await fs.promises.readdir(dir);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return;
    }
    throw err;
  }
  const targets = entries.filter((name) => {
    const ext = path.extname(name).toLowerCase();
    return [".jpg", ".jpeg", ".png"].includes(ext);
  });

  for (const name of targets) {
    const filePath = path.join(dir, name);
    try {
      await optimizeImage(filePath);
      console.log(`Optimized: ${relativeDir}/${name}`);
    } catch (err) {
      console.error(`Failed to optimize ${relativeDir}/${name}:`, err);
    }
  }
}

async function run() {
  for (const dir of targetDirs) {
    await optimizeDir(dir);
  }
}

run().catch((err) => {
  console.error("Image optimization failed:", err);
  process.exitCode = 1;
});
