$targetUrl = "https://github.com/chamodmanubasha7/-IT3030-paf-2026-smart-campus-62.git"
# Try to add target remote, ignore error if it already exists
git remote add target $targetUrl 2>$null

git checkout main

$colors = @("[RED]", "[GREEN]", "[BLUE]", "[YELLOW]")

for ($i = 1; $i -le 105; $i++) {
    $color = $colors[$i % 4]
    
    # Append to file
    $date = Get-Date
    "Commit $i at $date" | Out-File -FilePath "commit_history.txt" -Append
    
    git add commit_history.txt
    
    # Commit with color prefix
    git commit -m "$color Automated commit $i"
}

# Push to target remote
git push target main

# Also push to origin
git push origin main
