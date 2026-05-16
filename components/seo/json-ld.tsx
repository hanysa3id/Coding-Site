type Props = { data: Record<string, unknown> };

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema(opts: {
  name: string;
  url: string;
  logoUrl?: string | null;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: opts.name,
    url: opts.url,
    logo: opts.logoUrl ?? undefined,
    description: opts.description,
  };
}

export function serviceSchema(opts: {
  name: string;
  description?: string;
  image?: string | null;
  url: string;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  ratingValue?: number;
  ratingCount?: number;
}) {
  const offer =
    opts.priceMin && opts.priceMax
      ? {
          "@type": "AggregateOffer",
          lowPrice: opts.priceMin,
          highPrice: opts.priceMax,
          priceCurrency: opts.currency ?? "EGP",
        }
      : opts.priceMin
        ? {
            "@type": "Offer",
            price: opts.priceMin,
            priceCurrency: opts.currency ?? "EGP",
          }
        : undefined;

  const rating =
    opts.ratingValue && opts.ratingCount
      ? {
          "@type": "AggregateRating",
          ratingValue: opts.ratingValue,
          reviewCount: opts.ratingCount,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    image: opts.image ?? undefined,
    url: opts.url,
    offers: offer,
    aggregateRating: rating,
  };
}

export function articleSchema(opts: {
  headline: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  url: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description ?? undefined,
    image: opts.image ?? undefined,
    datePublished: opts.datePublished ?? undefined,
    url: opts.url,
    author: opts.authorName ? { "@type": "Organization", name: opts.authorName } : undefined,
  };
}
