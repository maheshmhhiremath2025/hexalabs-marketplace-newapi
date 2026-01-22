# PowerShell script to fix all context parameter issues in route files

$files = @(
    "src\app\api\v1\organizations\[orgId]\analytics\route.ts",
    "src\app\api\v1\organizations\[orgId]\assign-lab\route.ts",
    "src\app\api\v1\organizations\[orgId]\members\route.ts",
    "src\app\api\v1\organizations\[orgId]\members\[userId]\route.ts",
    "src\app\api\v1\organizations\[orgId]\route.ts",
    "src\app\api\v1\users\[userId]\analytics\route.ts",
    "src\app\api\v1\users\[userId]\labs\route.ts",
    "src\app\api\v1\users\[userId]\orders\route.ts",
    "src\app\api\v1\users\[userId]\route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        Write-Host "Fixing: $file"
        
        $content = Get-Content $fullPath -Raw
        
        # Replace context parameter pattern
        $content = $content -replace 'async \(request: NextRequest, auth, context: any\) =>', 'async (request: NextRequest, auth) =>'
        
        # Replace context.params usage with URL extraction
        $content = $content -replace '(\s+)const \{ (\w+) \} = context\.params;', '$1// Extract $2 from URL path$1const url = new URL(request.url);$1const pathParts = url.pathname.split(''/'');$1const $2 = pathParts[pathParts.length - 1];'
        
        Set-Content $fullPath $content -NoNewline
        
        Write-Host "Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
