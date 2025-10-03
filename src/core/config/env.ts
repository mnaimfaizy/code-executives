/**
 * Environment Configuration
 * 
 * Centralized configuration for environment variables.
 * Provides type-safe access to environment variables with validation.
 */

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  /** Node environment (development, production, test) */
  nodeEnv: string;
  /** Base URL for API requests */
  apiBaseUrl: string;
  /** Enable analytics (default: false in development) */
  enableAnalytics: boolean;
  /** Enable performance monitoring (default: true) */
  enablePerformanceMonitoring: boolean;
  /** Google Analytics tracking ID (optional) */
  googleAnalyticsId?: string;
  /** Sentry DSN for error tracking (optional) */
  sentryDsn?: string;
  /** Feature flags */
  features: {
    /** Enable 3D visualizations (default: true) */
    enable3D: boolean;
    /** Enable experimental features (default: false) */
    enableExperimental: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (value === '') return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  const required: string[] = [
    // Add required environment variables here
    // Example: 'VITE_API_BASE_URL'
  ];

  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Environment configuration singleton
 */
export const env: EnvironmentConfig = {
  nodeEnv: getEnvVar('MODE', 'development'),
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000'),
  enableAnalytics: getEnvBool('VITE_ENABLE_ANALYTICS', false),
  enablePerformanceMonitoring: getEnvBool('VITE_ENABLE_PERFORMANCE_MONITORING', true),
  googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
  sentryDsn: getEnvVar('VITE_SENTRY_DSN'),
  features: {
    enable3D: getEnvBool('VITE_FEATURE_3D', true),
    enableExperimental: getEnvBool('VITE_FEATURE_EXPERIMENTAL', false),
  },
};

// Validate environment variables in development
if (env.nodeEnv === 'development') {
  validateEnv();
}

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return env.nodeEnv === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return env.nodeEnv === 'production';
};

/**
 * Check if running in test mode
 */
export const isTest = (): boolean => {
  return env.nodeEnv === 'test';
};

export default env;
