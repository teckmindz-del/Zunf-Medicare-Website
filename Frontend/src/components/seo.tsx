import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    canonicalPath?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonicalPath }) => {
    const location = useLocation();
    const siteUrl = 'https://zunfmedicare.com'; // Adjust this to the actual production URL

    // Sanitize path: remove trailing slashes, ensuring the root '/' remains correctly handled
    const rawPath = canonicalPath || location.pathname;
    const sanitizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/$/, "");
    const canonicalUrl = `${siteUrl}${sanitizedPath}`;

    return (
        <Helmet>
            {title && <title>{title.includes('Zunf Medicare') ? title : `${title} | Zunf Medicare`}</title>}
            {description && <meta name="description" content={description} />}
            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
};
