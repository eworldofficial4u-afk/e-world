param([string]$BaseUrl = 'http://127.0.0.1:8788')
$ErrorActionPreference = 'Stop'
function Payload($count, $subs, $tag) {
 $players = @(1..$count | ForEach-Object { @{discordUsername="qa_$_";inGameName="QA $_";uid="$tag-$_";streamerMode='disabled'} })
 $bench = @(); if ($subs) { $bench = @(1..$subs | ForEach-Object { @{discordUsername="sub_$_";inGameName="Sub $_";uid="$tag-sub-$_";streamerMode='enabled'} }) }
 return @{eventSlug='codm-search-destroy';teamName="QA $tag";captainName='QA Captain';captainDiscordUsername='qa_captain';captainContact='qa_captain';starters=$players;substitutes=$bench;confirmAccurate=$true;confirmAuthorized=$true;confirmRules=$true;confirmPenalties=$true}
}
function Check($name,$payload,$expected) {
 $response = Invoke-WebRequest "$BaseUrl/api/tournament/registrations" -Method Post -ContentType 'application/json' -Body ($payload | ConvertTo-Json -Depth 8 -Compress) -Headers @{Origin=$BaseUrl; 'cf-connecting-ip'="192.0.2.$script:address"} -SkipHttpErrorCheck
 $script:address++
 if ([int]$response.StatusCode -ne $expected) { throw "$name expected $expected got $($response.StatusCode): $($response.Content)" }
 Write-Output "$name PASS ($expected)"
}
$script:address=10
$tag=[guid]::NewGuid().ToString('N').Substring(0,8)
Check 'Four players' (Payload 4 0 "four$tag") 400
$valid=Payload 5 0 "five$tag"
Check 'Five players without files' $valid 201
Check 'Duplicate UIDs' $valid 409
Check 'Seven players without files' (Payload 5 2 "seven$tag") 201
Check 'Eight players' (Payload 5 3 "eight$tag") 400
$bad=Payload 5 0 "bad$tag"; $bad.confirmRules='false'
Check 'Invalid confirmation' $bad 400
$bad=Payload 5 0 "id$tag"; $bad.captainDiscordId='abcd12345678901234567'
Check 'Invalid Discord ID' $bad 400
$bad=Payload 5 0 "large$tag"; $bad.notes='x'*17000
Check 'Oversized request' $bad 413
$response=Invoke-WebRequest "$BaseUrl/api/admin/tournament/registrations" -SkipHttpErrorCheck
if ($response.StatusCode -ne 401) { throw 'Staff data is not protected' }
Write-Output 'Private staff list PASS (401)'
