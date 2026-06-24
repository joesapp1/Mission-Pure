$BUCKET  = "gs://mission-pure-static"
$PROJECT = "mission-pure-gbp"
$LB      = "missionpure-lb"

Write-Host "Deploying Mission Pure to Google Cloud..." -ForegroundColor Cyan

# HTML pages - no cache
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -File | Select-Object -ExpandProperty Name
foreach ($f in $htmlFiles) {
    gcloud storage cp $f "$BUCKET/$f" `
        --cache-control="no-store,no-cache,must-revalidate,max-age=0" `
        --project=$PROJECT 2>&1 | Out-Null
    Write-Host "  Uploaded $f"
}

# CSS + JS - no cache
gcloud storage cp styles.css app.js $BUCKET/ `
    --cache-control="no-store,no-cache,must-revalidate,max-age=0" `
    --project=$PROJECT 2>&1 | Out-Null
Write-Host "  Uploaded styles.css + app.js"

# Static assets (images, fonts) - long cache (cache-busted by ?v= in HTML)
gcloud storage cp -r assets/* "$BUCKET/assets/" `
    --cache-control="public,max-age=31536000" `
    --project=$PROJECT 2>&1 | Out-Null
Write-Host "  Synced assets/"

# Data files - short cache
gcloud storage cp -r data/* "$BUCKET/data/" `
    --cache-control="no-cache,must-revalidate" `
    --project=$PROJECT 2>&1 | Out-Null
Write-Host "  Synced data/"

# Root static files
gcloud storage cp robots.txt sitemap.xml site.webmanifest favicon.ico $BUCKET/ `
    --project=$PROJECT 2>&1 | Out-Null
Write-Host "  Uploaded robots.txt, sitemap, manifest, favicon"

# Flush entire CDN cache
Write-Host "  Clearing CDN cache..." -ForegroundColor Yellow
gcloud compute url-maps invalidate-cdn-cache $LB --path="/*" --project=$PROJECT --async 2>&1 | Out-Null

Write-Host ""
Write-Host "Done! Live in ~15 seconds at https://mission-pure.com" -ForegroundColor Green
