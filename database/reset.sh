#!/bin/bash
set -e

DB_NAME="recruitment"

echo "Resetowanie bazy $DB_NAME..."
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"

echo "Ładowanie schematu..."
sudo -u postgres psql -d "$DB_NAME" < "$(dirname "$0")/schema.sql"

echo "Generowanie danych testowych..."
uv run --no-project --with faker python "$(dirname "$0")/seed_generator.py"

echo "Ładowanie danych testowych..."
sudo -u postgres psql -d "$DB_NAME" < "$(dirname "$0")/seed.sql"

echo "Gotowe! Baza $DB_NAME zresetowana z danymi testowymi."
