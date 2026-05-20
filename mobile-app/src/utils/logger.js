/**
 * Application Logger
 * Centralized logging with environment-aware output
 */

const isDevelopment = __DEV__;

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _format(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    return { prefix, message, data };
  }

  info(message, data) {
    if (isDevelopment) {
      const log = this._format('INFO', message, data);
      console.log(log.prefix, log.message, log.data || '');
    }
  }

  warn(message, data) {
    if (isDevelopment) {
      const log = this._format('WARN', message, data);
      console.warn(log.prefix, log.message, log.data || '');
    }
  }

  error(message, error) {
    const log = this._format('ERROR', message, error);
    console.error(log.prefix, log.message, error || '');

    // In production, you could send to error tracking service (Sentry, etc.)
    if (!isDevelopment && error) {
      // Example: Send to remote error tracking
      // errorTrackingService.captureException(error, { context: this.context, message });
    }
  }

  debug(message, data) {
    if (isDevelopment) {
      const log = this._format('DEBUG', message, data);
      console.debug(log.prefix, log.message, log.data || '');
    }
  }
}

// Create context-specific loggers
export const authLogger = new Logger('Auth');
export const cartLogger = new Logger('Cart');
export const orderLogger = new Logger('Order');
export const productLogger = new Logger('Product');
export const profileLogger = new Logger('Profile');
export const wishlistLogger = new Logger('Wishlist');
export const notificationLogger = new Logger('Notification');
export const chatLogger = new Logger('Chat');

export default Logger;
