$ErrorActionPreference = "Stop"

function Get-GitCommand {
    $gitFromPath = Get-Command git -ErrorAction SilentlyContinue
    if ($gitFromPath) {
        return $gitFromPath.Source
    }

    $possiblePaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )

    foreach ($path in $possiblePaths) {
        if (Test-Path -LiteralPath $path) {
            return $path
        }
    }

    throw "Git nao foi encontrado. Instale o Git ou adicione o git.exe ao PATH."
}

function Invoke-Git {
    & $script:GitCommand @args
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

$script:GitCommand = Get-GitCommand

$repoRoot = & $script:GitCommand rev-parse --show-toplevel
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    throw "Nao foi possivel identificar a pasta raiz do repositorio."
}

Set-Location $repoRoot

$branch = & $script:GitCommand branch --show-current
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    throw "Nao foi possivel identificar a branch atual."
}

$remoteUrl = & $script:GitCommand remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw "O remoto origin nao esta configurado."
}

Write-Host "Repositorio: $repoRoot"
Write-Host "Branch: $branch"
Write-Host "Remoto: $remoteUrl"
Write-Host ""

Invoke-Git add -A

& $script:GitCommand diff --cached --quiet
$diffExitCode = $LASTEXITCODE
if ($diffExitCode -gt 1) {
    exit $diffExitCode
}

$hasCachedChanges = $diffExitCode -eq 1

if (-not $hasCachedChanges) {
    Write-Host "Nenhuma alteracao para salvar."
}
else {
    if ($args.Count -gt 0) {
        $commitMessage = $args -join " "
    }
    else {
        $commitMessage = "Atualizacao $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }

    Invoke-Git commit -m $commitMessage
}

Write-Host ""
Write-Host "Sincronizando com o GitHub..."
Invoke-Git pull --rebase origin $branch
Invoke-Git push -u origin $branch

Write-Host ""
Write-Host "Versao salva no GitHub com sucesso."
