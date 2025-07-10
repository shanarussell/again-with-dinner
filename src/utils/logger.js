// Centralized logging utility
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.isDevelopment = isDevelopment;
  }

  // Info level logging
  info(message, ...args) {
    try {
      if (this.isDevelopment) {
        console.log(`[INFO] ${message}`, ...args);
      }
      // In production, you could send to a logging service
    } catch (error) {
      console.log(`[INFO] ${message}`);
    }
  }

  // Warning level logging
  warn(message, ...args) {
    try {
      if (this.isDevelopment) {
        console.warn(`[WARN] ${message}`, ...args);
      }
      // In production, you could send to a logging service
    } catch (error) {
      console.warn(`[WARN] ${message}`);
    }
  }

  // Error level logging
  error(message, error = null, ...args) {
    try {
      if (this.isDevelopment) {
        console.error(`[ERROR] ${message}`, error, ...args);
      } else {
        // In production, send to error monitoring service
        // Example: Sentry.captureException(error);
        console.error(`[ERROR] ${message}`, error);
      }
    } catch (err) {
      console.error(`[ERROR] ${message}`);
    }
  }

  // Debug level logging (only in development)
  debug(message, ...args) {
    try {
      if (this.isDevelopment) {
        console.log(`[DEBUG] ${message}`, ...args);
      }
    } catch (error) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  // Performance logging
  time(label) {
    try {
      if (this.isDevelopment) {
        console.time(`[PERF] ${label}`);
      }
    } catch (error) {
      // Silently fail
    }
  }

  timeEnd(label) {
    try {
      if (this.isDevelopment) {
        console.timeEnd(`[PERF] ${label}`);
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Group logging for better organization
  group(label) {
    try {
      if (this.isDevelopment) {
        console.group(`[GROUP] ${label}`);
      }
    } catch (error) {
      // Silently fail
    }
  }

  groupEnd() {
    try {
      if (this.isDevelopment) {
        console.groupEnd();
      }
    } catch (error) {
      // Silently fail
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 