$snippet = @"
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-branding">
          <img class="footer-logo" src="assets/logo.png?v=20260517-1353" alt="Mission Pure" />
          <div class="footer-brand">Mission Pure</div>
          <p class="footer-copy">Dallas-Fort Worth water filtration guidance grounded in real contaminant data.</p>
        </div>
        <div class="footer-meta">
          <a href="tel:+19512043095">+1 (951) 204-3095</a>
          <span>&bull;</span>
          <a href="contact.html">Schedule a consult</a>
        </div>
        <div class="footer-nav">
          <a href="index.html#resultsHeading">Check my ZIP</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <div>&copy; 2026 Mission Pure. All rights reserved.</div>
        <div>Licensed Puronics dealer - DFW water filtration experts</div>
      </div>
    </footer>
"@

$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$files = Get-ChildItem -Path $root -Filter *.html -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    if ($content -match '<footer class="site-footer">') {
        $updated = [regex]::Replace($content, '\s+<footer class="site-footer">[\s\S]*?</footer>\s*', "`r`n$snippet`r`n", 1)
        Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
        Write-Output "Updated $($file.Name)"
    }
}
