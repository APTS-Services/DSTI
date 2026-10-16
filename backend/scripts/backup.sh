#!/usr/bin/env bash
# Daily backup of the DSTI database and uploaded files.
# Schedule with cron, e.g.:  30 1 * * *  /opt/dsti/backend/scripts/backup.sh >> /var/log/dsti-backup.log 2>&1
# Reads DB settings from backend/.env. Keeps the last RETENTION_DAYS days of backups.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
set -a; source "$HERE/.env"; set +a

BACKUP_DIR="${BACKUP_DIR:-$HERE/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
STAMP="$(date +%Y%m%d-%H%M%S)"
UPLOADS="${UPLOAD_DIR:-./uploads}"
[[ "$UPLOADS" = /* ]] || UPLOADS="$HERE/$UPLOADS"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Password is passed through an option file so it never appears in the process list.
CNF="$(mktemp)"; trap 'rm -f "$CNF" "$BACKUP_DIR"/.db-*.partial' EXIT
printf '[client]\nuser="%s"\npassword="%s"\nhost=%s\nport=%s\n' "$DB_USER" "$DB_PASSWORD" "${DB_HOST:-127.0.0.1}" "${DB_PORT:-3306}" > "$CNF"

# Write to a temporary name first so a failed dump never looks like a valid backup.
mysqldump --defaults-extra-file="$CNF" --single-transaction --no-tablespaces "$DB_NAME" | gzip -9 > "$BACKUP_DIR/.db-$STAMP.partial"
mv "$BACKUP_DIR/.db-$STAMP.partial" "$BACKUP_DIR/db-$STAMP.sql.gz"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOADS")" "$(basename "$UPLOADS")"
chmod 600 "$BACKUP_DIR"/*-"$STAMP".*

find "$BACKUP_DIR" -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) -mtime +"$RETENTION_DAYS" -delete
echo "$(date -Is) backup completed: db-$STAMP.sql.gz uploads-$STAMP.tar.gz"
