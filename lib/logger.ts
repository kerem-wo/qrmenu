/**
 * Simple logging utility
 * In production, consider using Winston or Pino
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, data, error } = entry;
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      logMessage += ` ${JSON.stringify(data)}`;
    }
    
    if (error) {
      logMessage += `\nError: ${error.message}\nStack: ${error.stack}`;
    }
    
    return logMessage;
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(formattedMessage);
        }
        break;
      default:
        console.log(formattedMessage);
    }
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, error?: Error | string, data?: any) {
    if (typeof error === "string") {
      this.log("error", error, data);
    } else {
      this.log("error", error?.message || "Unknown error", data, error);
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }
}

export const logger = new Logger();
