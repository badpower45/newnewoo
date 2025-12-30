import React from 'react';
import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'علوش ماركت | سوبر ماركت 24 ساعة';
const DEFAULT_DESCRIPTION = 'علوش ماركت - اطلب كل احتياجات البقالة والخضار والفواكه أونلاين مع توصيل سريع وآمن على مدار اليوم.';
const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1582719478248-48c1e9e4f1d5?w=1200&auto=format&fit=crop&q=80';
const DEFAULT_THEME_COLOR = '#f97316';

const stripTrailingSlash = (url: string) => url.replace(/\/$/, '');

export const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  if (envUrl) return stripTrailingSlash(envUrl);

  if (typeof window !== 'undefined' && window.location.origin) {
    return stripTrailingSlash(window.location.origin);
  }

  return 'https://allosh-eg.com';
};

const toAbsoluteUrl = (value?: string, base?: string) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;

  const resolvedBase = stripTrailingSlash(base || getSiteUrl());
  return `${resolvedBase}${value.startsWith('/') ? value : `/${value}`}`;
};

type StructuredData = Record<string, unknown> | Record<string, unknown>[];

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string;
  keywords?: string[];
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  structuredData?: StructuredData;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  image,
  url,
  canonical,
  keywords,
  type = 'website',
  noIndex = false,
  structuredData
}) => {
  const siteUrl = getSiteUrl();
  const pageTitle = title ? `${title} | علوش ماركت` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = canonical || url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const absoluteCanonical = toAbsoluteUrl(canonicalUrl, siteUrl) || siteUrl;
  const ogImage = toAbsoluteUrl(image || DEFAULT_OG_IMAGE, siteUrl);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords?.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color" content={DEFAULT_THEME_COLOR} />
      <link rel="canonical" href={absoluteCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteCanonical} />
      <meta property="og:site_name" content="علوش ماركت" />
      <meta property="og:locale" content="ar_AR" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {/* Structured Data */}
      {structuredData ? (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
