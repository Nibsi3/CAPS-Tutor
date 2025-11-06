/**
 * Appwrite Logger Utility
 * 
 * Provides structured logging for Appwrite operations including:
 * - API calls and responses
 * - Errors and warnings
 * - Authentication events
 * - Database operations
 * 
 * Logs are formatted with timestamps and can be filtered by type.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'auth' | 'database' | 'storage' | 'api' | 'general';

export interface AppwriteLog {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  error?: Error;
  duration?: number; // in milliseconds
}

class AppwriteLogger {
  private logs: AppwriteLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private listeners: ((log: AppwriteLog) => void)[] = [];
  private enabled = true;

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Add a listener for new logs
   */
  addListener(listener: (log: AppwriteLog) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get all logs
   */
  getLogs(): AppwriteLog[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level and/or category
   */
  getFilteredLogs(options?: {
    level?: LogLevel | LogLevel[];
    category?: LogCategory | LogCategory[];
    limit?: number;
  }): AppwriteLog[] {
    let filtered = [...this.logs];

    if (options?.level) {
      const levels = Array.isArray(options.level) ? options.level : [options.level];
      filtered = filtered.filter(log => levels.includes(log.level));
    }

    if (options?.category) {
      const categories = Array.isArray(options.category) ? options.category : [options.category];
      filtered = filtered.filter(log => categories.includes(log.category));
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Log a message
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    details?: any,
    error?: Error,
    duration?: number
  ) {
    if (!this.enabled) return;

    const logEntry: AppwriteLog = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
      duration,
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Remove oldest logs if we exceed max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (e) {
        console.error('Error in log listener:', e);
      }
    });

    // Also log to console in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const prefix = `[Appwrite ${category.toUpperCase()}]`;
      
      if (error) {
        console[consoleMethod](prefix, message, error, details);
      } else if (details) {
        console[consoleMethod](prefix, message, details);
      } else {
        console[consoleMethod](prefix, message);
      }
    }
  }

  /**
   * Log info message
   */
  info(category: LogCategory, message: string, details?: any) {
    this.log('info', category, message, details);
  }

  /**
   * Log warning message
   */
  warn(category: LogCategory, message: string, details?: any, error?: Error) {
    this.log('warn', category, message, details, error);
  }

  /**
   * Log error message
   */
  error(category: LogCategory, message: string, error?: Error, details?: any) {
    this.log('error', category, message, details, error);
  }

  /**
   * Log debug message
   */
  debug(category: LogCategory, message: string, details?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', category, message, details);
    }
  }

  /**
   * Log an API call with timing
   */
  logApiCall(
    category: LogCategory,
    operation: string,
    startTime: number,
    success: boolean,
    details?: any,
    error?: Error
  ) {
    const duration = Date.now() - startTime;
    const level = success ? 'info' : 'error';
    const message = success 
      ? `✅ ${operation} completed in ${duration}ms`
      : `❌ ${operation} failed after ${duration}ms`;

    this.log(level, category, message, details, error, duration);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as text
   */
  exportLogsAsText(): string {
    return this.logs
      .map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const level = log.level.toUpperCase().padEnd(5);
        const category = log.category.toUpperCase().padEnd(10);
        let line = `[${timestamp}] ${level} [${category}] ${log.message}`;
        
        if (log.duration) {
          line += ` (${log.duration}ms)`;
        }
        
        if (log.error) {
          line += `\n  Error: ${log.error.message}`;
          if (log.error.stack) {
            line += `\n  Stack: ${log.error.stack}`;
          }
        }
        
        if (log.details) {
          line += `\n  Details: ${JSON.stringify(log.details, null, 2)}`;
        }
        
        return line;
      })
      .join('\n\n');
  }
}

// Singleton instance
export const appwriteLogger = new AppwriteLogger();

// Expose to window for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).appwriteLogger = appwriteLogger;
}

