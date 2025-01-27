type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

class Logger {
  private static formatError(error: any): Record<string, any> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      };
    }
    return { error };
  }

  private static createLogMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private static log(logMessage: LogMessage) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      const { level, message, context } = logMessage;
      console[level](
        `[${logMessage.timestamp}] ${level.toUpperCase()}: ${message}`,
        context || ''
      );
    }
    
    // In production, you might want to send logs to a service
    // TODO: Implement production logging service integration
  }

  static info(message: string, context?: Record<string, any>) {
    this.log(this.createLogMessage('info', message, context));
  }

  static warn(message: string, context?: Record<string, any>) {
    this.log(this.createLogMessage('warn', message, context));
  }

  static error(message: string, error?: any, context?: Record<string, any>) {
    this.log(
      this.createLogMessage('error', message, {
        ...this.formatError(error),
        ...context,
      })
    );
  }

  static debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.log(this.createLogMessage('debug', message, context));
    }
  }
}
