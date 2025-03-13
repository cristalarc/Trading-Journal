/**
 * Logger utility for the Trading Journal App
 * Provides consistent logging across the application with different log levels
 * and contextual information
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);
    
    // In development, log to console with colors
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
        reset: '\x1b[0m'
      };

      console.log(
        `${colors[level]}[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}${
          entry.data ? '\n' + JSON.stringify(entry.data, null, 2) : ''
        }${colors.reset}`
      );
    } else {
      // In production, this would typically send logs to a logging service
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
}

export const createLogger = (module: string) => new Logger(module); 