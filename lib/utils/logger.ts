// Structured logging utility
// Provides consistent logging interface with context and correlation IDs

import { AppError, isAppError } from '@/lib/errors/AppError';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
    retryable?: boolean;
  };
}

/**
 * Logger class with structured logging support
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error | AppError) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    };

    // Add error details if present
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        ...(isAppError(error) && {
          code: error.code,
          retryable: error.retryable,
        }),
        ...(this.isDevelopment && { stack: error.stack }),
      };
    }

    // Output format based on environment
    if (this.isDevelopment) {
      // Pretty format for development
      this.prettyPrint(entry);
    } else {
      // JSON format for production (easier to parse by log aggregators)
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Pretty print for development
   */
  private prettyPrint(entry: LogEntry) {
    const emoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
    };

    const colorize = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const color = colorize[entry.level];

    let output = `${emoji[entry.level]} ${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.code) {
        output += `\n  Code: ${entry.error.code} (retryable: ${entry.error.retryable})`;
      }
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    console.log(output);
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext, error?: Error | AppError) {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error | AppError) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Create a child logger with persistent context
   */
  child(persistentContext: LogContext): ChildLogger {
    return new ChildLogger(this, persistentContext);
  }
}

/**
 * Child logger with persistent context (useful for request-scoped logging)
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private persistentContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.persistentContext, ...context };
  }

  debug(message: string, context?: LogContext) {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext) {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext, error?: Error | AppError) {
    this.parent.warn(message, this.mergeContext(context), error);
  }

  error(message: string, context?: LogContext, error?: Error | AppError) {
    this.parent.error(message, this.mergeContext(context), error);
  }

  /**
   * Create a child logger with additional persistent context
   */
  child(additionalContext: LogContext): ChildLogger {
    return new ChildLogger(this.parent, { ...this.persistentContext, ...additionalContext });
  }
}

// Singleton logger instance
export const logger = new Logger();

/**
 * Create a logger with correlation ID (useful for tracking requests)
 */
export function createRequestLogger(requestId: string): ChildLogger {
  return logger.child({ requestId });
}

/**
 * Create a logger for a specific service/module
 */
export function createServiceLogger(service: string): ChildLogger {
  return logger.child({ service });
}
