# ============================================================
#  start.ps1 - Uruchamia caly projekt od zera
#  Kolejnosc: Docker DB -> Seed -> Backend -> Frontend
# ============================================================

$ROOT = $PSScriptRoot

function Write-Step($msg) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Err($msg) {
    Write-Host "[BLAD] $msg" -ForegroundColor Red
}

# ── Krok 1: Baza danych (Docker) ─────────────────────────────
Write-Step "Krok 1/4 - Uruchamianie bazy danych (Docker)"

$container = docker ps -a --filter "name=io-recruitment-db" --format "{{.Names}}" 2>$null

if ($container -eq "io-recruitment-db") {
    docker start io-recruitment-db | Out-Null
    Write-OK "Kontener io-recruitment-db uruchomiony."
} else {
    Write-Host "Kontener nie istnieje, tworze przez docker-compose..." -ForegroundColor Yellow
    Push-Location "$ROOT\database"
    docker-compose up -d
    Pop-Location

    Start-Sleep -Seconds 5

    Write-Host "Ladowanie schematu bazy danych..." -ForegroundColor Yellow
    Get-Content "$ROOT\database\schema.sql" | docker exec -i io-recruitment-db psql -U user_admin -d recruitment_system
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Nie udalo sie zaladowac schematu! Sprawdz czy Docker dziala."
        exit 1
    }
    Write-OK "Schemat zaladowany."
}

# Czekaj az baza bedzie gotowa (max 20 sekund)
Write-Host "Czekam az baza bedzie gotowa..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    $result = docker exec io-recruitment-db pg_isready -U user_admin -d recruitment_system 2>$null
    if ($result -match "accepting connections") {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
}

if (-not $ready) {
    Write-Err "Baza danych nie odpowiada po 20 sekundach. Sprawdz Docker."
    exit 1
}
Write-OK "Baza danych gotowa."

# ── Krok 2: Seedowanie ───────────────────────────────────────
Write-Step "Krok 2/4 - Seedowanie bazy danych"

Write-Host "Seedowanie podstawowe (konta, mock kandydaci)..." -ForegroundColor Yellow
python "$ROOT\database\seed.py"
if ($LASTEXITCODE -ne 0) {
    Write-Err "Seedowanie podstawowe nie powiodlo sie!"
    exit 1
}

Write-Host "Pobieranie i seedowanie prawdziwych kierunkow AGH..." -ForegroundColor Yellow
python "$ROOT\database\seed_programs.py"
if ($LASTEXITCODE -ne 0) {
    Write-Err "Seedowanie programow nie powiodlo sie!"
    exit 1
}

Write-Host "Generowanie plikow YAML dla frontendu..." -ForegroundColor Yellow
python "$ROOT\generate_yamls.py"
if ($LASTEXITCODE -ne 0) {
    Write-Err "Generowanie YAML nie powiodlo sie!"
    exit 1
}

Write-OK "Baza zasilona danymi, a frontend ma nowe kierunki."

# ── Krok 3: Backend (FastAPI) ─────────────────────────────────
Write-Step "Krok 3/4 - Uruchamianie backendu (FastAPI)"

$backendCmd = "cd '$ROOT\backend'; Write-Host 'Backend FastAPI - http://localhost:8000' -ForegroundColor Green; uv run uvicorn app.main:app --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Write-OK "Backend uruchomiony w nowym oknie."
Start-Sleep -Seconds 3

# ── Krok 4: Frontend (Next.js) ────────────────────────────────
Write-Step "Krok 4/4 - Uruchamianie frontendu (Next.js)"

$frontendCmd = "cd '$ROOT\client'; Write-Host 'Frontend Next.js - http://localhost:3000' -ForegroundColor Green; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-OK "Frontend uruchomiony w nowym oknie."

# ── Podsumowanie ──────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Projekt uruchomiony!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend :  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend  :  http://localhost:8000" -ForegroundColor White
Write-Host "  Swagger  :  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Konta testowe:" -ForegroundColor Yellow
Write-Host "  admin@agh.edu.pl             / admin123"
Write-Host "  szymon.tyburczy22@gmail.com  / Szymon123"
Write-Host ""
