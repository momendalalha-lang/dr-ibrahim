# Instagram follower-count updater — runs via Windows Task Scheduler.
# Pulls latest, scrapes the live count (residential IP bypasses Instagram's
# datacenter-IP login wall), and pushes when the number changes so the
# GitHub Action rebuilds + deploys the site.
$ErrorActionPreference = 'Continue'
Set-Location 'D:\Projects\MUS-Site'
$log = 'scripts\ig-task.log'

"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $log -Append -Encoding utf8

git pull --rebase --quiet 2>&1 | Out-File $log -Append -Encoding utf8
node scripts\update-instagram.mjs 2>&1 | Out-File $log -Append -Encoding utf8

$dirty = git status --porcelain -- src/data/reels.ts public/ig-stats.json
if ($dirty) {
  git add src/data/reels.ts public/ig-stats.json
  git commit -m "chore: refresh Instagram follower count" --quiet 2>&1 | Out-File $log -Append -Encoding utf8
  git push --quiet 2>&1 | Out-File $log -Append -Encoding utf8
  "pushed follower-count update" | Out-File $log -Append -Encoding utf8
} else {
  "no change" | Out-File $log -Append -Encoding utf8
}
