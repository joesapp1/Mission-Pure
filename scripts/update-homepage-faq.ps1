$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$path = Join-Path $root 'index.html'

if (-not (Test-Path -Path $path)) {
    throw "index.html not found at $path"
}

$content = Get-Content -Path $path -Raw -Encoding UTF8
$pattern = '(?s)        <div class="faq">.*?        </div>\r?\n\r?\n        <div class="howto-card" aria-labelledby="howtoHeading">'
$newFaq = @"
        <div class="faq">
          <details class="faq-item" open>
            <summary>Do Dallas-Fort Worth families really need a whole-home water filter?</summary>
            <div class="muted">North Texas utilities routinely report TTHMs, HAA5, lead, and other contaminants that reach every faucet—not just the kitchen sink. Whole-home filtration shields showers, laundry, and anything your kids cook with so exposure drops across the entire house.</div>
          </details>
          <details class="faq-item">
            <summary>What contaminants does Mission Pure help remove?</summary>
            <div class="muted">Mission Pure configures Puronics whole-home systems and under-sink RO units for PFAS indicators, lead, chromium-6, chloramine byproducts, and taste or odor complaints that show up in Dallas and Fort Worth sampling. The ZIP lookup shows which chemicals spike so we can fine-tune the media.</div>
          </details>
          <details class="faq-item">
            <summary>Which areas do you serve?</summary>
            <div class="muted">We cover Dallas, Fort Worth, Frisco, Plano, McKinney, Allen, Garland, Irving, Arlington, Denton, Rockwall, Royse City, Lavon, Southlake, Grapevine, and nearby suburbs. If you’re in North Texas, Mission Pure can schedule you.</div>
          </details>
          <details class="faq-item">
            <summary>How do I choose between whole-home, under-sink RO, or a combo system?</summary>
            <div class="muted">Run your ZIP on Mission Pure. If shower or steam exposure is the concern, start with whole-home. If PFAS or dissolved solids run high, add under-sink RO for cooking and drinking. Many families pick both so every faucet and glass is covered.</div>
          </details>
        </div>
"@
$replacement = $newFaq + "`r`n        <div class=`"howto-card`" aria-labelledby=`"howtoHeading`">"

$updated = [regex]::Replace($content, $pattern, $replacement, 1)
Set-Content -Path $path -Value $updated -Encoding UTF8
Write-Output "Homepage FAQ updated."
