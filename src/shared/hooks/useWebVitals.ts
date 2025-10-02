import { useEffect, useState } from 'react';
import type { Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay (deprecated, use INP)
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

export interface WebVitalsThresholds {
  CLS: { good: number; needsImprovement: number };
  FID: { good: number; needsImprovement: number };
  FCP: { good: number; needsImprovement: number };
  LCP: { good: number; needsImprovement: number };
  TTFB: { good: number; needsImprovement: number };
  INP: { good: number; needsImprovement: number };
}

// Official Google Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS: WebVitalsThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
};

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export const getMetricRating = (
  metricName: keyof WebVitalsThresholds,
  value: number
): MetricRating => {
  const threshold = WEB_VITALS_THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

export interface UseWebVitalsOptions {
  enabled?: boolean;
  reportToAnalytics?: boolean;
  onMetric?: (metric: Metric) => void;
}

/**
 * Custom hook for tracking Core Web Vitals metrics
 * Monitors CLS, FID/INP, FCP, LCP, TTFB for performance insights
 */
export const useWebVitals = (options: UseWebVitalsOptions = {}) => {
  const { enabled = true, reportToAnalytics = false, onMetric } = options;
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const handleMetric = (metric: Metric) => {
      // Update state
      setMetrics((prev) => ({
        ...prev,
        [metric.name]: metric.value,
      }));

      // Call custom handler
      onMetric?.(metric);

      // Report to analytics (Google Analytics, etc.)
      if (reportToAnalytics && import.meta.env.PROD) {
        // Example: Send to Google Analytics
        // gtag('event', metric.name, {
        //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        //   metric_id: metric.id,
        //   metric_value: metric.value,
        //   metric_delta: metric.delta,
        //   metric_rating: getMetricRating(metric.name as keyof WebVitalsThresholds, metric.value),
        // });

        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: getMetricRating(metric.name as keyof WebVitalsThresholds, metric.value),
        });
      }
    };

    // Dynamically import web-vitals functions (FID deprecated, using INP)
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(handleMetric);
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);
      onINP(handleMetric);
      setLoading(false);
    });
  }, [enabled, reportToAnalytics, onMetric]);

  return { metrics, loading };
};

export default useWebVitals;
