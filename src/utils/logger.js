// Centralized logging utility
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.isDevelopment = isDevelopment;
  }

  // Info level logging
  info(message, ...args) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
    // In production, you could send to a logging service
  }

  // Warning level logging
  warn(message, ...args) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
    // In production, you could send to a logging service
  }

  // Error level logging
  error(message, error = null, ...args) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      // In production, send to error monitoring service
      // Example: Sentry.captureException(error);
      console.error(`[ERROR] ${message}`, error);
    }
  }

  // Debug level logging (only in development)
  debug(message, ...args) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Performance logging
  time(label) {
    if (this.isDevelopment) {
      console.time(`[PERF] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(`[PERF] ${label}`);
    }
  }

  // Group logging for better organization
  group(label) {
    if (this.isDevelopment) {
      console.group(`[GROUP] ${label}`);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 