# PowerShell script для очистки проекта портфолио
# cleanup-project.ps1

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false,
    [switch]$Help = $false
)

# Показать справку
if ($Help) {
    Write-Host @"
🧹 Portfolio Project Cleanup Script

USAGE:
    .\cleanup-project.ps1 [OPTIONS]

OPTIONS:
    -DryRun     Show what will be done without making changes
    -Force      Skip confirmation prompts
    -Help       Show this help message

EXAMPLES:
    .\cleanup-project.ps1                    # Interactive cleanup
    .\cleanup-project.ps1 -DryRun            # Analyze only
    .\cleanup-project.ps1 -Force             # Cleanup without prompts

DESCRIPTION:
    This script removes files not related to the web portfolio project.
    It creates an archive of important files before removal for safe recovery.

SAFETY:
    - All moved files are backed up to _archive folder
    - Detailed report is generated
    - Core portfolio files are never touched
    - Dry run mode available for analysis

"@
    exit 0
}

# Функции для вывода цветного текста
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { param([string]$Message) Write-ColorOutput "✅ $Message" "Green" }
function Write-Error { param([string]$Message) Write-ColorOutput "❌ $Message" "Red" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠️  $Message" "Yellow" }
function Write-Info { param([string]$Message) Write-ColorOutput "ℹ️  $Message" "Cyan" }

# Заголовок
Write-Host ""
Write-ColorOutput "🧹 Portfolio Project Cleanup" "Cyan"
Write-ColorOutput "=============================" "Cyan"
Write-Host ""

# Проверяем наличие Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js version: $nodeVersion"
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Error "Node.js not found. Please install Node.js first."
    Write-Info "Download from: https://nodejs.org/"
    exit 1
}

# Проверяем наличие cleaner утилиты
if (-not (Test-Path "utils/project-cleaner.js")) {
    Write-Error "Project cleaner utility not found."
    Write-Warning "Expected location: utils/project-cleaner.js"
    Write-Info "Please make sure the utility exists."
    exit 1
}

Write-Success "Project cleaner utility found"
Write-Host ""

try {
    if ($DryRun) {
        Write-Info "🔍 Running analysis (dry run mode)..."
        Write-Info "This will show what would be done without making changes."
        Write-Host ""
        
        node utils/project-cleaner.js --dry-run
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Success "Dry run completed successfully!"
            Write-Info "Use '.\cleanup-project.ps1' to execute the cleanup."
        } else {
            Write-Error "Analysis failed. Check error messages above."
            exit 1
        }
        exit 0
    }

    # Выполняем анализ перед очисткой
    Write-Info "🔍 Analyzing project structure..."
    Write-Host ""
    
    node utils/project-cleaner.js --dry-run
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Analysis failed. Please check the error messages above."
        exit 1
    }

    Write-Host ""

    if (-not $Force) {
        Write-Warning "This will move/remove files from your project!"
        Write-Host ""
        Write-Info "📦 Files will be moved to _archive folder (can be restored)"
        Write-Info "🗑️  Temporary files will be permanently deleted"
        Write-Info "📋 Detailed report will be created"
        Write-Host ""
        
        do {
            $confirm = Read-Host "Do you want to continue? (y/N)"
            $confirm = $confirm.Trim().ToLower()
        } while ($confirm -notin @('', 'y', 'yes', 'n', 'no'))
        
        if ($confirm -notin @('y', 'yes')) {
            Write-Info "Cleanup cancelled by user."
            Write-Info "No files were modified."
            exit 0
        }
    }

    Write-Host ""
    Write-Info "🚀 Starting cleanup process..."
    Write-Host ""

    # Выполняем очистку
    node utils/project-cleaner.js

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "Project cleanup completed successfully!"
        Write-Host ""
        
        Write-ColorOutput "📋 Next steps:" "Cyan"
        Write-Host "   1. Test your project: npm run dev"
        Write-Host "   2. Verify build works: npm run build"
        Write-Host "   3. Run tests: npm run test"
        Write-Host ""
        
        # Показываем информацию об архиве
        if (Test-Path "_archive") {
            Write-ColorOutput "📂 Archive information:" "Cyan"
            
            try {
                $archiveFiles = Get-ChildItem "_archive" -Recurse -file | Measure-Object
                $archiveSize = Get-ChildItem "_archive" -Recurse -file | Measure-Object -Property Length -Sum
                $archiveSizeMB = [math]::Round($archiveSize.Sum / 1MB, 2)
                
                Write-Host "   Files archived: $($archiveFiles.Count)"
                Write-Host "   Archive size: $archiveSizeMB MB"
                Write-Host "   Location: _archive/"
                Write-Host ""
                
                # Показываем краткое содержимое архива
                Write-ColorOutput "📁 Archive contents:" "Cyan"
                Get-ChildItem "_archive" -Directory | ForEach-Object {
                    $fileCount = (Get-ChildItem $_.FullName -Recurse -File | Measure-Object).Count
                    Write-Host "   $($_.Name)/ ($fileCount files)"
                }
                Get-ChildItem "_archive" -File | ForEach-Object {
                    Write-Host "   $($_.Name)"
                }
                
            } catch {
                Write-Warning "Could not analyze archive contents: $($_.Exception.Message)"
            }
            
            Write-Host ""
            Write-Info "📋 Detailed report: _archive/cleanup-report.json"
            
            if (-not $Force) {
                $openArchive = Read-Host "Open archive folder? (y/N)"
                if ($openArchive.ToLower() -in @('y', 'yes')) {
                    try {
                        Invoke-Item "_archive"
                    } catch {
                        Write-Warning "Could not open archive folder: $($_.Exception.Message)"
                    }
                }
            }
        }
        
    } else {
        Write-Host ""
        Write-Error "Cleanup failed!"
        Write-Warning "Check the error messages above for details."
        Write-Info "You may need to:"
        Write-Host "   - Run as administrator"
        Write-Host "   - Check file permissions"
        Write-Host "   - Close files that might be in use"
        Write-Host ""
        exit 1
    }

} catch {
    Write-Host ""
    Write-Error "Error during cleanup: $($_.Exception.Message)"
    Write-Warning "Stack trace:"
    Write-Host $_.Exception.StackTrace -ForegroundColor DarkGray
    exit 1
}

Write-Host ""
Write-ColorOutput "🎉 Cleanup process finished!" "Green"

# Показываем финальную статистику
if (Test-Path "_archive/cleanup-report.json") {
    try {
        $report = Get-Content "_archive/cleanup-report.json" | ConvertFrom-Json
        Write-Host ""
        Write-ColorOutput "📊 Final Statistics:" "Cyan"
        Write-Host "   Files moved: $($report.summary.moved)"
        Write-Host "   Files removed: $($report.summary.removed)"
        Write-Host "   Total processed: $($report.summary.totalProcessed)"
        if ($report.summary.errors -gt 0) {
            Write-Warning "Errors encountered: $($report.summary.errors)"
        }
    } catch {
        Write-Info "Could not load cleanup report for statistics."
    }
}

Write-Host ""