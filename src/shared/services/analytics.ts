/**
 * Google Analytics Interface
 *
 * Type definitions for Google Analytics gtag.js
 */
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Analytics Event Categories
 *
 * Standardized categories for tracking user interactions
 */
export const AnalyticsCategory = {
  NAVIGATION: 'Navigation',
  VISUALIZATION: 'Visualization',
  LEARNING: 'Learning',
  USER_ENGAGEMENT: 'User Engagement',
  PERFORMANCE: 'Performance',
  ERROR: 'Error',
} as const;

export type AnalyticsCategoryType = (typeof AnalyticsCategory)[keyof typeof AnalyticsCategory];

/**
 * Analytics Event Actions
 *
 * Common actions for tracking
 */
export const AnalyticsAction = {
  CLICK: 'Click',
  VIEW: 'View',
  COMPLETE: 'Complete',
  START: 'Start',
  INTERACT: 'Interact',
  SHARE: 'Share',
  DOWNLOAD: 'Download',
  ERROR: 'Error',
} as const;

export type AnalyticsActionType = (typeof AnalyticsAction)[keyof typeof AnalyticsAction];

/**
 * AnalyticsService
 *
 * Singleton service for managing Google Analytics tracking.
 * Provides methods for:
 * - Initialization with GA tracking ID
 * - Page view tracking
 * - Custom event tracking
 * - Visualization interaction tracking
 * - Learning progress tracking
 *
 * @example
 * ```typescript
 * // Initialize analytics
 * AnalyticsService.getInstance().initialize('GA-TRACKING-ID');
 *
 * // Track page view
 * AnalyticsService.getInstance().trackPageView('/javascript');
 *
 * // Track custom event
 * AnalyticsService.getInstance().trackEvent(
 *   AnalyticsCategory.VISUALIZATION,
 *   AnalyticsAction.INTERACT,
 *   'Event Loop Visualization',
 *   1
 * );
 * ```
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;
  private trackingId: string | null = null;
  private debugMode = false;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Check if we're in development mode
    this.debugMode = import.meta.env.DEV;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize Google Analytics
   *
   * Loads the gtag.js script and configures GA with the provided tracking ID.
   * Safe to call multiple times - will only initialize once.
   *
   * @param trackingId - Google Analytics tracking ID (e.g., 'G-XXXXXXXXXX' or 'UA-XXXXXXXXX-X')
   */
  public initialize(trackingId: string): void {
    // Skip initialization if no tracking ID or already initialized
    if (!trackingId || this.initialized) {
      if (this.debugMode) {
        console.log('[Analytics] Skipping initialization:', {
          trackingId: trackingId || 'none',
          initialized: this.initialized,
        });
      }
      return;
    }

    this.trackingId = trackingId;

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

      // Set initial timestamp
      window.gtag('js', new Date());

      // Configure GA
      window.gtag('config', trackingId, {
        send_page_view: false, // We'll manually track page views
        anonymize_ip: true, // GDPR compliance
        cookie_flags: 'SameSite=None;Secure', // Cookie security
      });

      // Load gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      document.head.appendChild(script);

      this.initialized = true;

      if (this.debugMode) {
        console.log('[Analytics] Initialized successfully:', trackingId);
      }
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  /**
   * Track page view
   *
   * Records when a user navigates to a new page.
   *
   * @param path - Page path (e.g., '/javascript', '/git')
   * @param title - Optional page title
   */
  public trackPageView(path: string, title?: string): void {
    if (!this.isReady()) return;

    try {
      window.gtag?.('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      });

      if (this.debugMode) {
        console.log('[Analytics] Page view tracked:', { path, title });
      }
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }

  /**
   * Track custom event
   *
   * Records a custom user interaction or event.
   *
   * @param category - Event category (e.g., 'Visualization', 'Learning')
   * @param action - Event action (e.g., 'Click', 'Complete')
   * @param label - Optional event label for more context
   * @param value - Optional numeric value associated with the event
   */
  public trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (!this.isReady()) return;

    try {
      window.gtag?.('event', action.toLowerCase().replace(/\s+/g, '_'), {
        event_category: category,
        event_label: label,
        value: value,
      });

      if (this.debugMode) {
        console.log('[Analytics] Event tracked:', { category, action, label, value });
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track visualization interaction
   *
   * Records when a user interacts with an educational visualization.
   *
   * @param module - Module name (e.g., 'JavaScript', 'Git', 'DataStructures')
   * @param visualizationType - Type of visualization (e.g., 'Event Loop', 'Git Workflow')
   * @param action - Specific interaction (e.g., 'Play', 'Pause', 'Reset', 'Step')
   */
  public trackVisualizationInteraction(
    module: string,
    visualizationType: string,
    action: string
  ): void {
    this.trackEvent(
      AnalyticsCategory.VISUALIZATION,
      AnalyticsAction.INTERACT,
      `${module}: ${visualizationType} - ${action}`,
      1
    );
  }

  /**
   * Track section completion
   *
   * Records when a user completes a learning section or tutorial.
   *
   * @param module - Module name (e.g., 'JavaScript', 'Git')
   * @param section - Section name (e.g., 'Event Loop', 'Branching')
   * @param timeSpent - Optional time spent in seconds
   */
  public trackSectionCompletion(module: string, section: string, timeSpent?: number): void {
    this.trackEvent(
      AnalyticsCategory.LEARNING,
      AnalyticsAction.COMPLETE,
      `${module}: ${section}`,
      timeSpent
    );
  }

  /**
   * Track user engagement
   *
   * Records general user engagement metrics.
   *
   * @param action - Engagement action (e.g., 'scroll_depth', 'time_on_page')
   * @param label - Optional label
   * @param value - Metric value
   */
  public trackEngagement(action: string, label?: string, value?: number): void {
    this.trackEvent(AnalyticsCategory.USER_ENGAGEMENT, action, label, value);
  }

  /**
   * Track performance metric
   *
   * Records performance-related metrics.
   *
   * @param metric - Metric name (e.g., 'LCP', 'FID', 'CLS')
   * @param value - Metric value
   * @param label - Optional label
   */
  public trackPerformance(metric: string, value: number, label?: string): void {
    this.trackEvent(AnalyticsCategory.PERFORMANCE, metric, label, value);
  }

  /**
   * Track error
   *
   * Records application errors for monitoring.
   *
   * @param errorMessage - Error message
   * @param errorStack - Optional error stack trace
   * @param fatal - Whether the error is fatal
   */
  public trackError(errorMessage: string, errorStack?: string, fatal = false): void {
    this.trackEvent(
      AnalyticsCategory.ERROR,
      AnalyticsAction.ERROR,
      `${errorMessage}${errorStack ? ` - ${errorStack}` : ''}`,
      fatal ? 1 : 0
    );
  }

  /**
   * Set user properties
   *
   * Sets custom user properties for segmentation.
   *
   * @param properties - User properties object
   */
  public setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isReady()) return;

    try {
      window.gtag?.('set', 'user_properties', properties);

      if (this.debugMode) {
        console.log('[Analytics] User properties set:', properties);
      }
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }

  /**
   * Check if analytics is ready
   *
   * @returns True if initialized and gtag is available
   */
  private isReady(): boolean {
    if (!this.initialized || !window.gtag) {
      if (this.debugMode) {
        console.warn('[Analytics] Not initialized or gtag not available');
      }
      return false;
    }
    return true;
  }

  /**
   * Get initialization status
   *
   * @returns True if analytics is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get tracking ID
   *
   * @returns Current tracking ID or null
   */
  public getTrackingId(): string | null {
    return this.trackingId;
  }
}

// Export singleton instance
export default AnalyticsService.getInstance();
