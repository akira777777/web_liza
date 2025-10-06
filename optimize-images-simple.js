const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(inputPath, outputDir) {
  const { name, ext } = path.parse(inputPath);
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^(-)|(-$)/g, '');

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(
      `📏 Processing: ${cleanName}${ext} (${metadata.width}x${metadata.height} px)`
    );

    // Определяем размеры для responsive images
    const sizes = [
      { suffix: '', width: Math.min(1200, metadata.width) },
      { suffix: '-md', width: Math.min(800, metadata.width) },
      { suffix: '-sm', width: Math.min(400, metadata.width) }
    ].filter(size => size.width >= 200);

    const formats = [];

    // Генерируем изображения в разных размерах
    for (const size of sizes) {
      // JPEG (оригинальный формат)
      const jpegPath = path.join(outputDir, `${cleanName}${size.suffix}.jpg`);
      await image
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(jpegPath);

      formats.push(`${cleanName}${size.suffix}.jpg`);

      // WebP
      const webpPath = path.join(outputDir, `${cleanName}${size.suffix}.webp`);
      await image
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality: 80,
          effort: 6
        })
        .toFile(webpPath);

      formats.push(`${cleanName}${size.suffix}.webp`);
    }

    return {
      original: name + ext,
      clean_name: cleanName,
      formats,
      dimensions: { width: metadata.width, height: metadata.height },
      sizes: sizes.map(s => ({ suffix: s.suffix, width: s.width }))
    };
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}: ${error.message}`);
    return null;
  }
}

async function main() {
  const inputDir = 'assets/images/new-portfolio';
  const outputDir = 'assets/images/portfolio';

  console.log(`🎯 Input: ${inputDir}`);
  console.log(`📤 Output: ${outputDir}`);

  try {
    // Создаем выходную директорию
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`🖼️ Found ${imageFiles.length} images to process`);

    if (imageFiles.length === 0) {
      console.log('❌ No images found to process');
      return;
    }

    const results = [];

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const result = await optimizeImage(inputPath, outputDir);

      if (result) {
        results.push(result);
      }
    }

    // Генерируем mapping файл
    const mappingPath = path.join(outputDir, 'image-mapping.json');
    await fs.writeFile(
      mappingPath,
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          source_dir: inputDir,
          output_dir: outputDir,
          options: { webp: true, avif: false },
          images: results
        },
        null,
        2
      )
    );

    console.log(`✅ Processed ${results.length} images successfully`);
    console.log(`📄 Mapping saved to: ${mappingPath}`);

    // Генерируем HTML элементы
    console.log('\n📋 HTML Elements Generated:');
    results.forEach((img, index) => {
      const sizes = img.sizes;
      const srcsetJpeg = sizes
        .map(
          s =>
            `assets/images/portfolio/${img.clean_name}${s.suffix}.jpg ${s.width}w`
        )
        .join(', ');

      const srcsetWebp = sizes
        .map(
          s =>
            `assets/images/portfolio/${img.clean_name}${s.suffix}.webp ${s.width}w`
        )
        .join(', ');

      console.log(`\n<!-- ${img.original} -->`);
      console.log('<div class="portfolio-item" data-category="digital-art">');
      console.log('  <picture class="portfolio-image">');
      console.log(
        `    <source type="image/webp" srcset="${srcsetWebp}" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw">`
      );
      console.log(
        `    <img src="assets/images/portfolio/${img.clean_name}.jpg"`
      );
      console.log(`         srcset="${srcsetJpeg}"`);
      console.log(
        '         sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"'
      );
      console.log(`         alt="Portfolio piece ${index + 1}"`);
      console.log('         loading="lazy"');
      console.log(
        `         width="${img.dimensions.width}" height="${img.dimensions.height}"`
      );
      console.log('         class="portfolio-img">');
      console.log('  </picture>');
      console.log('  <div class="portfolio-overlay">');
      console.log(`    <h3>Artwork ${index + 1}</h3>`);
      console.log('    <p>Digital Art</p>');
      console.log('  </div>');
      console.log('</div>');
    });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
