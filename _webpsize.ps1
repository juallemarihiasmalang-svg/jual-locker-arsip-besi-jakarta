function Get-WebPSize($path) {
  $fs = [System.IO.File]::OpenRead($path)
  try {
    $br = New-Object System.IO.BinaryReader($fs)
    $null = $br.ReadBytes(4)          # RIFF
    $null = $br.ReadBytes(4)          # size
    $webp = [System.Text.Encoding]::ASCII.GetString($br.ReadBytes(4))
    if ($webp -ne 'WEBP') { return "bukan webp" }
    $chunk = [System.Text.Encoding]::ASCII.GetString($br.ReadBytes(4))
    $null = $br.ReadBytes(4)
    switch ($chunk) {
      'VP8X' {
        $null = $br.ReadBytes(4)
        $w = ([uint32]$br.ReadByte()) + ([uint32]$br.ReadByte() * 256) + ([uint32]$br.ReadByte() * 65536)
        $h = ([uint32]$br.ReadByte()) + ([uint32]$br.ReadByte() * 256) + ([uint32]$br.ReadByte() * 65536)
        return "$($w+1) x $($h+1)"
      }
      'VP8 ' {
        $null = $br.ReadBytes(6)
        $lo = [uint32]$br.ReadUInt16()
        $hi = [uint32]$br.ReadUInt16()
        return "$($lo - 16383) x $($hi - 16383)"
      }
      'VP8L' {
        $b = [uint32]$br.ReadByte()
        $b2 = [uint32]$br.ReadByte()
        $b3 = [uint32]$br.ReadByte()
        $b4 = [uint32]$br.ReadByte()
        [uint32]$bits = $b -bor ($b2 -shl 8) -bor ($b3 -shl 16) -bor ($b4 -shl 24)
        $w = [uint32](($bits -band 0x3FFF) + 1)
        $h = [uint32]((($bits -shr 14) -band 0x3FFF) + 1)
        return "$w x $h"
      }
      default { return "tipe: $chunk" }
    }
  } finally { $fs.Dispose() }
}

$base = (Get-Location).Path
Get-ChildItem -Path 'images' -Recurse -File -Filter *.webp | ForEach-Object {
  $rel = $_.FullName.Substring($base.Length + 1)
  $kb = [math]::Round($_.Length/1KB,1)
  Write-Output ("{0} => {1} ({2} KB)" -f $rel, (Get-WebPSize $_.FullName), $kb)
}