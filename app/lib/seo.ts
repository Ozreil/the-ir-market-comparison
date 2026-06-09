import type { Product } from "./product-display";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theirmarkets.com";

export const siteName = "Their Markets";

export const defaultDescription =
  "Their Markets is a curated affiliate shopping market for products from trusted partner companies, home essentials, electronics, kitchen finds, and gift ideas.";

export const homeTitle =
  "Their Markets | Curated Affiliate Shopping From Partner Companies";

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, siteUrl).toString();
}

export function productJsonLd(product: Product) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    description: product.summary,
    image: product.gallery.map((image) =>
      image.startsWith("http") ? image : absoluteUrl(image),
    ),
    name: product.name,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: product.price,
      priceCurrency: "USD",
      url: product.amazonUrl,
    },
  };

  if (product.rating > 0 && product.reviewCount > 0) {
    return {
      ...jsonLd,
      aggregateRating: {
        "@type": "AggregateRating",
        bestRating: 5,
        ratingCount: product.reviewCount,
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        worstRating: 1,
      },
      review: {
        "@type": "Review",
        author: {
          "@type": "Organization",
          name: siteName,
        },
        name: `Their Markets review of ${product.name}`,
        reviewBody: product.curatorTake || product.summary,
        reviewRating: {
          "@type": "Rating",
          bestRating: 5,
          ratingValue: product.rating,
          worstRating: 1,
        },
      },
    };
  }

  return jsonLd;
}

export function comparisonJsonLd({
  description,
  products,
  title,
  url,
}: {
  description: string;
  products: [Product, Product];
  title: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    description,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      item: productJsonLd(product),
      position: index + 1,
    })),
    name: title,
    numberOfItems: products.length,
    url,
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    description: defaultDescription,
    logo: absoluteUrl("/logo.png"),
    name: siteName,
    sameAs: ["https://github.com/Ozreil/the-ir-market-comparison"],
    url: siteUrl,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: defaultDescription,
    name: siteName,
    potentialAction: {
      "@type": "SearchAction",
      query: "required name=search_term_string",
      target: `${absoluteUrl("/category")}?query={search_term_string}`,
    },
    url: siteUrl,
  };
}

export function homePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description: defaultDescription,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
    name: homeTitle,
    url: siteUrl,
  };
}
