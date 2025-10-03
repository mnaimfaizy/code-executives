import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analytics';

/**
 * useAnalytics Hook
 *
 * React hook for analytics tracking. Provides:
 * - Automatic page view tracking on route changes
 * - Access to all analytics tracking methods
 * - Type-safe tracking functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackVisualization } = useAnalytics();
 *
 *   const handleClick = () => {
 *     trackEvent('Visualization', 'Click', 'Event Loop Play Button');
 *   };
 *
 *   return <button onClick={handleClick}>Play</button>;
 * }
 * ```
 */
export const useAnalytics = () => {
  const location = useLocation();
  const previousPath = useRef<string>('');

  // Track page views on route changes
  useEffect(() => {
    const currentPath = location.pathname;

    // Only track if path actually changed (avoid duplicate tracking)
    if (currentPath !== previousPath.current) {
      analyticsService.trackPageView(currentPath);
      previousPath.current = currentPath;
    }
  }, [location.pathname]);

  // Return all tracking methods for use in components
  return {
    /**
     * Track custom event
     *
     * @param category - Event category (e.g., 'Visualization', 'Learning')
     * @param action - Event action (e.g., 'Click', 'Complete')
     * @param label - Optional event label
     * @param value - Optional numeric value
     */
    trackEvent: (category: string, action: string, label?: string, value?: number) =>
      analyticsService.trackEvent(category, action, label, value),

    /**
     * Track visualization interaction
     *
     * @param module - Module name (e.g., 'JavaScript', 'Git')
     * @param visualizationType - Visualization type
     * @param action - Interaction action (e.g., 'Play', 'Pause')
     */
    trackVisualization: (module: string, visualizationType: string, action: string) =>
      analyticsService.trackVisualizationInteraction(module, visualizationType, action),

    /**
     * Track section completion
     *
     * @param module - Module name
     * @param section - Section name
     * @param timeSpent - Optional time spent in seconds
     */
    trackCompletion: (module: string, section: string, timeSpent?: number) =>
      analyticsService.trackSectionCompletion(module, section, timeSpent),

    /**
     * Track user engagement
     *
     * @param action - Engagement action
     * @param label - Optional label
     * @param value - Optional value
     */
    trackEngagement: (action: string, label?: string, value?: number) =>
      analyticsService.trackEngagement(action, label, value),

    /**
     * Track performance metric
     *
     * @param metric - Metric name
     * @param value - Metric value
     * @param label - Optional label
     */
    trackPerformance: (metric: string, value: number, label?: string) =>
      analyticsService.trackPerformance(metric, value, label),

    /**
     * Track error
     *
     * @param errorMessage - Error message
     * @param errorStack - Optional stack trace
     * @param fatal - Whether error is fatal
     */
    trackError: (errorMessage: string, errorStack?: string, fatal?: boolean) =>
      analyticsService.trackError(errorMessage, errorStack, fatal),

    /**
     * Set user properties
     *
     * @param properties - User properties object
     */
    setUserProperties: (properties: Record<string, unknown>) =>
      analyticsService.setUserProperties(properties),
  };
};

export default useAnalytics;
