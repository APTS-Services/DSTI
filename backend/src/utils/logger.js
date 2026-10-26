// src/utils/logger.js — lightweight structured logger
// Zero-dependency logger with env-based output routing:
//   - production  → file writes ONLY (access.log / error.log), never the terminal
//   - development → console ONLY (never touches the logs/ folder)
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function ensureLogDir() {
    try {
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    } catch (e) {
        // Logging must never crash the app
    }
}

function write(level, message, file) {
    const line = `[${new Date().toISOString()}] ${level}: ${message}`;

    if (IS_PRODUCTION) {
        // Production: everything goes to the logs folder only
        if (file) {
            try {
                ensureLogDir();
                fs.appendFileSync(path.join(LOG_DIR, file), line + '\n');
            } catch (e) {
                // ignore write errors — logging is best-effort
            }
        }
    } else {
        // Development: console only
        if (level === 'error') console.error(line);
        else console.log(line);
    }
}

const logger = {
    info: (msg) => write('INFO', msg, 'access.log'),
    warn: (msg) => write('WARN', msg, 'access.log'),
    error: (msg) => write('ERROR', msg, 'error.log')
};

// Morgan stream — route HTTP access logs through the same logger
logger.stream = {
    write: (message) => logger.info(message.trim())
};

module.exports = logger;
