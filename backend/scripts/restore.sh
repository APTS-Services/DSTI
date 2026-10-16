#!/usr/bin/env bash
# Restores a backup made by backup.sh.
#   ./scripts/restore.sh backups/db-20261016-013000.sql.gz [backups/uploads-20261016-013000.tar.gz]
# Stop the application before restoring.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
set -a; source "$HERE/.env"; set +a
DB_FILE="${1:?Usage: restore.sh <db-backup.sql.gz> [uploads-backup.tar.gz]}"
UPLOADS_FILE="${2:-}"
UPLOADS="${UPLOAD_DIR:-./uploads}"
[[ "$UPLOADS" = /* ]] || UPLOADS="$HERE/$UPLOADS"

read -r -p "This replaces the database '$DB_NAME'. Type YES to continue: " ok
[[ "$ok" == "YES" ]] || { echo "Aborted."; exit 1; }

CNF="$(mktemp)"; trap 'rm -f "$CNF"' EXIT
printf '[client]\nuser="%s"\npassword="%s"\nhost=%s\nport=%s\n' "$DB_USER" "$DB_PASSWORD" "${DB_HOST:-127.0.0.1}" "${DB_PORT:-3306}" > "$CNF"

gunzip -c "$DB_FILE" | mysql --defaults-extra-file="$CNF" "$DB_NAME"
if [[ -n "$UPLOADS_FILE" ]]; then
  rm -rf "$UPLOADS.previous" && { [[ -d "$UPLOADS" ]] && mv "$UPLOADS" "$UPLOADS.previous" || true; }
  tar -xzf "$UPLOADS_FILE" -C "$(dirname "$UPLOADS")"
fi
echo "Restore completed."
