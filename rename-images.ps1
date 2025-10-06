# Script to rename new portfolio images to match HTML references
# Run from F:\elizaveta-portfolio

$imageDir = "assets\images\new-portfolio"

# Create mapping from freepik names to expected names
$renameMapping = @{
    "freepik__subtle-variation-of-the-previous-electronic-music-__38650.jpg" = "music-festival-collection.jpg"
    "freepik__subtle-variation-of-the-previous-electronic-music-__38651.jpg" = "drictile-abstract.jpg"
    "freepik__upload__96336.jpg"                                             = "3d-spheres-purple.jpg"
    "freepik__upload__96337.jpg"                                             = "efest-poster-purple.jpg"
    "freepik__upload__96338.jpg"                                             = "efest-poster-dark.jpg"
    "freepik__upload__96339.jpg"                                             = "cv-resume-design.jpg"
    "freepik__upload__96340.jpg"                                             = "holographic-faces.jpg"
    "freepik__upload__96341.jpg"                                             = "colorful-circles.jpg"
    "freepik__upload__96342.jpg"                                             = "smoke-abstract.jpg"
}

Write-Host "🎨 Renaming portfolio images to match HTML references..."

foreach ($oldName in $renameMapping.Keys) {
    $oldPath = Join-Path $imageDir $oldName
    $newName = $renameMapping[$oldName]
    $newPath = Join-Path $imageDir $newName
    
    if (Test-Path $oldPath) {
        Rename-Item $oldPath $newPath -Force
        Write-Host "✅ Renamed: $oldName → $newName"
    }
    else {
        Write-Host "❌ Not found: $oldName"
    }
}

# Create the missing 3d-composition.jpg from one of the existing files
$compositionSource = Join-Path $imageDir "holographic-faces.jpg"
$compositionTarget = Join-Path $imageDir "3d-composition.jpg"

if ((Test-Path $compositionSource) -and !(Test-Path $compositionTarget)) {
    Copy-Item $compositionSource $compositionTarget -Force
    Write-Host "✅ Created: 3d-composition.jpg (copy of holographic-faces.jpg)"
}

Write-Host "`n🎯 Portfolio images renamed successfully!"
Write-Host "📊 Total images: $(Get-ChildItem $imageDir | Measure-Object | Select-Object -ExpandProperty Count)"