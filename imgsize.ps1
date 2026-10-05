Add-Type -AssemblyName System.Drawing
$base = (Get-Location).Path
Get-ChildItem -Path 'images','images/lg' -File | ForEach-Object {
  try {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $rel = $_.FullName.Substring($base.Length + 1)
    $kb = [math]::Round($_.Length/1KB,1)
    Write-Output ("{0} => {1}x{2} ({3} KB)" -f $rel, $img.Width, $img.Height, $kb)
    $img.Dispose()
  } catch {
    Write-Output ("{0} => tidak bisa dibaca" -f $_.Name)
  }
}