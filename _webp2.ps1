function Get-WebPInfo($path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $riff = [System.Text.Encoding]::ASCII.GetString($bytes,0,4)
  $webp = [System.Text.Encoding]::ASCII.GetString($bytes,8,4)
  $chunk = [System.Text.Encoding]::ASCII.GetString($bytes,12,4)
  $res = "$riff/$webp/$chunk"
  switch ($chunk) {
    'VP8X' {
      $w = $bytes[24] + $bytes[25]*256 + $bytes[26]*65536
      $h = $bytes[27] + $bytes[28]*256 + $bytes[29]*65536
      $res += " :: $($w+1) x $($h+1)"
    }
    'VP8L' {
      $b0=$bytes[21]; $b1=$bytes[22]; $b2=$bytes[23]; $b3=$bytes[24]
      $bits = [uint32]$b0 -bor ([uint32]$b1 -shl 8) -bor ([uint32]$b2 -shl 16) -bor ([uint32]$b3 -shl 24)
      $w = [int](($bits -band 0x3FFF) + 1)
      $h = [int]((($bits -shr 14) -band 0x3FFF) + 1)
      $res += " :: $w x $h"
    }
    'VP8 ' {
      $lo = [int]$bytes[26] + [int]$bytes[27]*256
      $hi = [int]$bytes[28] + [int]$bytes[29]*256
      $res += " :: $($lo - 16383) x $($hi - 16383)"
    }
  }
  return $res
}

$base = (Get-Location).Path
Get-ChildItem -Path 'images' -Recurse -File -Filter *.webp | ForEach-Object {
  $rel = $_.FullName.Substring($base.Length + 1)
  $kb = [math]::Round($_.Length/1KB,1)
  Write-Output ("{0} => {1} ({2} KB)" -f $rel, (Get-WebPInfo $_.FullName), $kb)
}