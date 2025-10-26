
/**
 * A simple logger utility for consistent logging across the application.
 * In a production environment, this could be expanded to integrate with
 * a remote logging service like Sentry, LogRocket, or Datadog.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logs a standard informational message.
 * Only logs in the development environment to avoid console clutter in production.
 * @param message - The primary message to log.
 * @param context - Optional additional data to log.
 */
export const logInfo = (message: string, ...context: unknown[]): void => {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, ...context);
  }
};

/**
 * Logs a warning message.
 * @param message - The warning message to log.
 * @param context - Optional additional data related to the warning.
 */
export const logWarn = (message: string, ...context: unknown[]): void => {
  console.warn(`[WARN] ${message}`, ...context);
};

/**
 * Logs an error message.
 * @param message - The error message to log.
 * @param error - The actual error object or related context.
 */
export const logError = (message: string, ...error: unknown[]): void => {
  console.error(`[ERROR] ${message}`, ...error);
};

const logger = {
  info: logInfo,
  warn: logWarn,
  error: logError,
};

export default logger;