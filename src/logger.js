const isDev = import.meta.env.DEV;
const logLevel = import.meta.env.VITE_LOG_LEVEL || (isDev ? 'all' : 'errors');

const EMOJI  = { INFO: '✅', WARN: '⚠️', ERROR: '❌', API: '🔵', ACTION: '🟠' };
const STYLE  = {
  INFO:   'color:#4CAF50;font-weight:700',
  WARN:   'color:#FF9800;font-weight:700',
  ERROR:  'color:#f44336;font-weight:700',
  API:    'color:#2196F3;font-weight:700',
  ACTION: 'color:#FF6B35;font-weight:700',
};

function log(level, category, message, data) {
  if (logLevel === 'off') return;
  if (logLevel === 'errors' && level !== 'ERROR') return;

  const ts = new Date().toLocaleTimeString('ko-KR');
  const header = `%c${EMOJI[level]} [${ts}][${category}] ${message}`;

  if (level === 'ERROR') {
    data !== undefined ? console.error(header, STYLE[level], data)
                       : console.error(header, STYLE[level]);
  } else {
    data !== undefined ? console.log(header, STYLE[level], data)
                       : console.log(header, STYLE[level]);
  }
}

export const logger = {
  info:   (cat, msg, data) => log('INFO',   cat, msg, data),
  warn:   (cat, msg, data) => log('WARN',   cat, msg, data),
  error:  (cat, msg, data) => log('ERROR',  cat, msg, data),
  api:    (cat, msg, data) => log('API',    cat, msg, data),
  action: (cat, msg, data) => log('ACTION', cat, msg, data),
};
