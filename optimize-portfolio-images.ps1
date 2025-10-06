# Portfolio Image Optimization Script
# Скрипт для оптимизации изображений портфолио

param(
    [string]$SourceDir = "assets/images/new-portfolio",
    [string]$OutputDir = "assets/images/portfolio",
    [switch]$Webp = $true,
    [switch]$Avif = $false,
    [switch]$Force = $false
)

# Проверяем наличие Sharp
Write-Host "🔍 Checking Sharp installation..." -ForegroundColor Cyan
try {
    $sharpVersion = node -e "console.log(require('sharp').format)"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Sharp is available" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Sharp not found. Installing..." -ForegroundColor Yellow
    npm install sharp --save-dev
}

# Создаем output директорию
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "📁 Created directory: $OutputDir" -ForegroundColor Green
}

# Получаем все изображения
$images = Get-ChildItem -Path $SourceDir -Include "*.jpg", "*.jpeg", "*.png", "*.webp" -File

if ($images.Count -eq 0) {
    Write-Host "❌ No images found in $SourceDir" -ForegroundColor Red
    exit 1
}

Write-Host "🖼️ Found $($images.Count) images to process" -ForegroundColor Cyan

# Создаем Node.js скрипт для обработки
$nodeScript = @'
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

async function optimizeImage(inputPath, outputDir, options = {}) {
    const { name, ext } = path.parse(inputPath);
    const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    
    const formats = [];
    
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        console.log(`📏 Processing: ${cleanName}${ext} (${metadata.width}x${metadata.height} px)`);
        
        // Определяем размеры для responsive images
        const sizes = [
            { suffix: "", width: Math.min(1200, metadata.width) },
            { suffix: "-md", width: Math.min(800, metadata.width) },
            { suffix: "-sm", width: Math.min(400, metadata.width) }
        ].filter(size => size.width >= 200);
        
        // Генерируем изображения в разных размерах и форматах
        for (const size of sizes) {
            // JPEG (оригинальный формат)
            const jpegPath = path.join(outputDir, `${cleanName}${size.suffix}.jpg`);
            await image
                .resize(size.width, null, { 
                    withoutEnlargement: true,
                    fit: "inside"
                })
                .jpeg({ 
                    quality: 85, 
                    progressive: true,
                    mozjpeg: true 
                })
                .toFile(jpegPath);
            
            formats.push(`${cleanName}${size.suffix}.jpg`);
            
            // WebP
            if (options.webp) {
                const webpPath = path.join(outputDir, `${cleanName}${size.suffix}.webp`);
                await image
                    .resize(size.width, null, { 
                        withoutEnlargement: true,
                        fit: "inside"
                    })
                    .webp({ 
                        quality: 80,
                        effort: 6
                    })
                    .toFile(webpPath);
                
                formats.push(`${cleanName}${size.suffix}.webp`);
            }
            
            // AVIF (если поддерживается)
            if (options.avif) {
                try {
                    const avifPath = path.join(outputDir, `${cleanName}${size.suffix}.avif`);
                    await image
                        .resize(size.width, null, { 
                            withoutEnlargement: true,
                            fit: "inside"
                        })
                        .avif({ 
                            quality: 75,
                            effort: 4
                        })
                        .toFile(avifPath);
                    
                    formats.push(`${cleanName}${size.suffix}.avif`);
                } catch (avifError) {
                    console.warn(`⚠️ AVIF not supported for ${cleanName}: ${avifError.message}`);
                }
            }
        }
        
        return {
            original: name + ext,
            clean_name: cleanName,
            formats: formats,
            dimensions: { width: metadata.width, height: metadata.height },
            sizes: sizes.map(s => ({ suffix: s.suffix, width: s.width }))
        };
        
    } catch (error) {
        console.error(`❌ Error processing ${inputPath}: ${error.message}`);
        return null;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const inputDir = args[0] || "assets/images/new-portfolio";
    const outputDir = args[1] || "assets/images/portfolio";
    const webpEnabled = args[2] !== "false";
    const avifEnabled = args[3] === "true";
    
    console.log(`🎯 Input: ${inputDir}`);
    console.log(`📤 Output: ${outputDir}`);
    console.log(`🔧 WebP: ${webpEnabled ? "enabled" : "disabled"}, AVIF: ${avifEnabled ? "enabled" : "disabled"}`);
    
    try {
        const files = await fs.readdir(inputDir);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|webp)$/i.test(file)
        );
        
        if (imageFiles.length === 0) {
            console.log("❌ No images found to process");
            return;
        }
        
        const results = [];
        
        for (const file of imageFiles) {
            const inputPath = path.join(inputDir, file);
            const result = await optimizeImage(inputPath, outputDir, {
                webp: webpEnabled,
                avif: avifEnabled
            });
            
            if (result) {
                results.push(result);
            }
        }
        
        // Генерируем mapping файл
        const mappingPath = path.join(outputDir, "image-mapping.json");
        await fs.writeFile(mappingPath, JSON.stringify({
            generated: new Date().toISOString(),
            source_dir: inputDir,
            output_dir: outputDir,
            options: { webp: webpEnabled, avif: avifEnabled },
            images: results
        }, null, 2));
        
        console.log(`✅ Processed ${results.length} images successfully`);
        console.log(`📄 Mapping saved to: ${mappingPath}`);
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();
'@

# Сохраняем Node.js скрипт
$nodeScriptPath = "optimize-images.js"
$nodeScript | Out-File -FilePath $nodeScriptPath -Encoding UTF8

Write-Host "📝 Created optimization script: $nodeScriptPath" -ForegroundColor Green

# Запускаем оптимизацию
Write-Host "`n🚀 Starting image optimization..." -ForegroundColor Cyan
$webpParam = if ($Webp) { "true" } else { "false" }
$avifParam = if ($Avif) { "true" } else { "false" }

try {
    node $nodeScriptPath $SourceDir $OutputDir $webpParam $avifParam
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Image optimization completed successfully!" -ForegroundColor Green
        
        # Показываем статистику
        $originalSize = (Get-ChildItem -Path $SourceDir -Include "*.jpg", "*.jpeg", "*.png" -File | Measure-Object -Property Length -Sum).Sum
        $optimizedSize = (Get-ChildItem -Path $OutputDir -Include "*.jpg", "*.webp", "*.avif" -File | Measure-Object -Property Length -Sum).Sum
        
        $originalSizeMB = [math]::Round($originalSize / 1MB, 2)
        $optimizedSizeMB = [math]::Round($optimizedSize / 1MB, 2)
        $savings = [math]::Round((($originalSize - $optimizedSize) / $originalSize) * 100, 1)
        
        Write-Host "`n📊 Optimization Statistics:" -ForegroundColor Cyan
        Write-Host "   Original size:  $originalSizeMB MB" -ForegroundColor White
        Write-Host "   Optimized size: $optimizedSizeMB MB" -ForegroundColor White
        Write-Host "   Space saved:    $savings%" -ForegroundColor Green
        
        # Показываем созданные файлы
        Write-Host "`n📁 Created files:" -ForegroundColor Cyan
        Get-ChildItem -Path $OutputDir | ForEach-Object {
            $size = [math]::Round($_.Length / 1KB, 1)
            Write-Host "   $($_.Name) ($size KB)" -ForegroundColor White
        }
        
    }
    else {
        Write-Host "❌ Image optimization failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error running optimization: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Очищаем временный файл
    if (Test-Path $nodeScriptPath) {
        Remove-Item $nodeScriptPath -Force
    }
}

Write-Host "`n🏁 Script completed." -ForegroundColor Cyan