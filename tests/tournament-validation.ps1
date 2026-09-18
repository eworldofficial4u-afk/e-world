$ErrorActionPreference = 'Stop'
$baseUrl = 'http://127.0.0.1:8788'
$testDirectory = Join-Path $env:TEMP 'eworld-tournament-tests'
New-Item -ItemType Directory -Path $testDirectory -Force | Out-Null

$pngBytes = [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4v8AAAAASUVORK5CYII=')
0..6 | ForEach-Object { [IO.File]::WriteAllBytes((Join-Path $testDirectory "lobby-$_.png"), $pngBytes) }
$invalidImagePath = Join-Path $testDirectory 'not-image.txt'
Set-Content -LiteralPath $invalidImagePath -Value 'not an image'

function New-Player([string] $uid) {
  return [ordered]@{ discordUsername = "player_$uid"; inGameName = "IGN_$uid"; uid = $uid; streamerMode = 'disabled' }
}

function New-Payload([int] $starterCount, [int] $substituteCount, [string] $prefix) {
  $starters = @()
  1..$starterCount | ForEach-Object { $starters += New-Player "$prefix-S$_" }
  $substitutes = @()
  if ($substituteCount) { 1..$substituteCount | ForEach-Object { $substitutes += New-Player "$prefix-X$_" } }
  return [ordered]@{
    eventSlug = 'codm-search-destroy'; teamName = "Team $prefix"; captainName = 'Captain Test'
    captainDiscordUsername = "captain_$prefix"; captainDiscordId = ''; captainContact = 'captain_test'
    notes = 'Automated local validation'; starters = $starters; substitutes = $substitutes
    confirmAccurate = $true; confirmAuthorized = $true; confirmRules = $true; confirmPenalties = $true
  }
}

function Submit-Registration($payload, [int] $fileCount, [string] $address, [bool] $invalidImage = $false) {
  $payloadPath = Join-Path $testDirectory ("payload-" + [guid]::NewGuid().ToString('N') + '.json')
  Set-Content -LiteralPath $payloadPath -Value ($payload | ConvertTo-Json -Depth 8 -Compress) -NoNewline
  $arguments = @('-sS', '-w', '|HTTP:%{http_code}', '-H', "Origin: $baseUrl", '-H', "cf-connecting-ip: $address", '-F', "payload=<$payloadPath")
  for ($index = 0; $index -lt $fileCount; $index += 1) {
    $filePath = if ($invalidImage -and $index -eq 0) { $invalidImagePath } else { Join-Path $testDirectory "lobby-$index.png" }
    $arguments += @('-F', "screenshot_$index=@$filePath")
  }
  $raw = (& curl.exe @arguments "$baseUrl/api/tournament/registrations") -join ''
  Remove-Item -LiteralPath $payloadPath -Force
  $parts = $raw -split '\|HTTP:'
  return [pscustomobject]@{ Status = [int]$parts[-1]; Body = $parts[0] }
}

$prefix = [guid]::NewGuid().ToString('N').Substring(0, 7)
$four = Submit-Registration (New-Payload 4 0 "FOUR-$prefix") 0 '10.2.0.1'
$fivePayload = New-Payload 5 0 "FIVE-$prefix"
$five = Submit-Registration $fivePayload 5 '10.2.0.2'
$seven = Submit-Registration (New-Payload 5 2 "SEVEN-$prefix") 7 '10.2.0.3'
$eight = Submit-Registration (New-Payload 5 3 "EIGHT-$prefix") 0 '10.2.0.4'
$duplicatePayload = New-Payload 5 0 "DUPE-$prefix"
$duplicatePayload.starters[0].uid = $fivePayload.starters[0].uid
$duplicate = Submit-Registration $duplicatePayload 5 '10.2.0.5'
$invalid = Submit-Registration (New-Payload 5 0 "BAD-$prefix") 5 '10.2.0.6' $true
$closed = $null
try {
  & npx wrangler d1 execute eworld-community-data --local --command "UPDATE tournament_events SET registration_status = 'closed' WHERE slug = 'codm-search-destroy'" | Out-Null
  $closed = Submit-Registration (New-Payload 5 0 "CLOSED-$prefix") 0 '10.2.0.7'
} finally {
  & npx wrangler d1 execute eworld-community-data --local --command "UPDATE tournament_events SET registration_status = 'open' WHERE slug = 'codm-search-destroy'" | Out-Null
}

[pscustomobject]@{
  FourPlayers = $four.Status
  FivePlayers = $five.Status
  SevenPlayers = $seven.Status
  EightPlayers = $eight.Status
  DuplicateUid = $duplicate.Status
  InvalidScreenshot = $invalid.Status
  ClosedRegistration = $closed.Status
  FiveResponse = $five.Body
  SevenResponse = $seven.Body
  DuplicateResponse = $duplicate.Body
  InvalidResponse = $invalid.Body
  ClosedResponse = $closed.Body
}
