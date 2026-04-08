import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/feedback/ErrorBoundary';
import { LoadingFallback } from '../../shared/components/feedback/LoadingFallback';
import { SEO } from '../../shared/components/SEO/SEO';

// Lazy load all section components for better code splitting
const Introduction = lazy(() => import('./components/sections/Introduction'));
const AuthEvolution = lazy(() => import('./components/sections/AuthEvolution'));
const AuthenticationTypes = lazy(() => import('./components/sections/AuthenticationTypes'));
const AuthorizationModels = lazy(() => import('./components/sections/AuthorizationModels'));
const OAuthOIDC = lazy(() => import('./components/sections/OAuthOIDC'));
const PKCEFlow = lazy(() => import('./components/sections/PKCEFlow'));
const BFFPattern = lazy(() => import('./components/sections/BFFPattern'));
const AIAgentAuth = lazy(() => import('./components/sections/AIAgentAuth'));
const Visualization = lazy(() => import('./components/sections/Visualization'));

const sectionComponents: Record<string, React.ComponentType> = {
  Introduction,
  'Evolution of Digital Identity': AuthEvolution,
  'Authentication Types': AuthenticationTypes,
  'Authorization Models': AuthorizationModels,
  'OAuth 2.0 & OpenID Connect': OAuthOIDC,
  'PKCE Authorization Flow': PKCEFlow,
  'BFF Pattern': BFFPattern,
  'AI Agent Authentication': AIAgentAuth,
  Visualization,
};

function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}

const AuthPage: React.FC = () => {
  const query = useQuery();
  const section = query.get('section') || 'Introduction';
  const Component = sectionComponents[section] || Introduction;

  return (
    <>
      <SEO
        title="Authentication & Authorization - Code Executives"
        description="Master modern authentication and authorization: OAuth 2.0, OpenID Connect, PKCE, WebAuthn/Passkeys, Zero Trust Architecture, and AI Agent authentication through interactive visualizations."
        keywords={[
          'authentication',
          'authorization',
          'oauth 2.0',
          'openid connect',
          'pkce',
          'webauthn',
          'passkeys',
          'zero trust',
          'rbac',
          'abac',
          'jwt',
          'bff pattern',
          'ai agent auth',
        ]}
        canonicalUrl="https://code-executives.com/auth"
      />
      <div className="p-4 sm:p-6">
        <ErrorBoundary level="feature">
          <Suspense fallback={<LoadingFallback variant="skeleton-page" />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default AuthPage;
