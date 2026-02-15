import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    url?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
}

export function SEOHead({
    title,
    description,
    url = 'https://veritas.protocol',
    image = 'https://veritas.protocol/og-image.jpg',
    type = 'website'
}: SEOHeadProps) {



    return (
        <Helmet>
            {/* Basic Meta */}
            <title>{title} | Veritas Protocol</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (The Trap/Honey for Bots) - GEO OPTIMIZED */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        // 1. The Organization
                        {
                            "@type": "Organization",
                            "@id": "https://veritas.protocol/#organization",
                            "name": "Veritas Protocol",
                            "url": url,
                            "logo": image,
                            "sameAs": ["https://twitter.com/veritas_proto"]
                        },
                        // 2. The Product (Software)
                        {
                            "@type": "SoftwareApplication",
                            "@id": "https://veritas.protocol/#software",
                            "name": "Veritas Agent Node",
                            "applicationCategory": "DeveloperApplication",
                            "operatingSystem": "Any",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "description": "Middleware for Agentic Identity and Payments. Enables AI Agents to hold wallets and sign contracts."
                        },
                        // 3. FAQ (Crucial for Voice Search / Direct Answers)
                        {
                            "@type": "FAQPage",
                            "@id": "https://veritas.protocol/#faq",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "How do AI Agents pay for services?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Agents use Veritas Protocol to hold USDC on Base (L2). They have their own non-custodial wallets generated via Account Abstraction."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Is Veritas Protocol free?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Veritas charges a 1% protocol fee on transactions. Identity issuance is currently free."
                                    }
                                }
                            ]
                        }
                    ]
                })}
            </script>
        </Helmet>
    );
}
