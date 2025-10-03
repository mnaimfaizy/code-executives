import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component Props
 *
 * Comprehensive SEO meta tags for improved search engine visibility
 * and social media sharing previews
 */
export interface SEOProps {
  /** Page title (will be suffixed with site name) */
  title: string;

  /** Meta description for search results (150-160 characters recommended) */
  description: string;

  /** Keywords for search engines (optional, limited SEO value but included for completeness) */
  keywords?: string[];

  /** Open Graph image URL for social media previews */
  image?: string;

  /** Open Graph type (website for general pages, article for blog posts) */
  type?: 'website' | 'article';

  /** Canonical URL to prevent duplicate content issues */
  canonicalUrl?: string;

  /** Robots meta tag directives (default: 'index, follow') */
  robots?: string;

  /** Article author (for article type) */
  author?: string;

  /** Article published date (for article type) */
  publishedDate?: string;

  /** Article modified date (for article type) */
  modifiedDate?: string;

  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

/**
 * SEO Component
 *
 * Manages all SEO-related meta tags using react-helmet-async.
 * Provides comprehensive support for:
 * - Primary meta tags (title, description, keywords)
 * - Open Graph tags (Facebook, LinkedIn)
 * - Twitter Card tags
 * - Canonical URLs
 * - Robots directives
 *
 * @example
 * ```tsx
 * <SEO
 *   title="JavaScript Execution Flow"
 *   description="Learn how JavaScript engines execute code with interactive visualizations"
 *   keywords={['javascript', 'execution', 'event loop']}
 *   image="https://code-executives.com/og-javascript.png"
 *   canonicalUrl="https://code-executives.com/javascript"
 * />
 * ```
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  image = 'https://code-executives.com/og-default.png',
  type = 'website',
  canonicalUrl,
  robots = 'index, follow',
  author,
  publishedDate,
  modifiedDate,
  twitterCard = 'summary_large_image',
}) => {
  // Site configuration
  const siteName = 'Code Executives';
  const siteUrl = 'https://code-executives.com';
  const twitterHandle = '@codeexecutives';

  // Full title with site name
  const fullTitle = `${title} | ${siteName}`;

  // Current URL (use canonical if provided, otherwise construct from window.location)
  const currentUrl =
    canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  // Full image URL (ensure absolute URL)
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robots} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedDate && <meta property="article:published_time" content={publishedDate} />}
          {modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}
          {keywords.length > 0 &&
            keywords.map((keyword) => (
              <meta key={keyword} property="article:tag" content={keyword} />
            ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3b82f6" />
    </Helmet>
  );
};

export default SEO;
