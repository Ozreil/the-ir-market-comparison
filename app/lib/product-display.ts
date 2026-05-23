import type { ProductDto } from "./api-client";

export type Product = {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  collection: string;
  price: number;
  rating: number;
  reviewCount: number;
  image?: string;
  gallery: string[];
  material: string;
  summary: string;
  curatorTake: string;
  amazonUrl: string;
  asin?: string;
  specs: string[];
};

export function productDtoToDisplayProduct(product: ProductDto): Product {
  const categoryTitle =
    product.category?.title ??
    product.seo_metadata?.primary_keyword ??
    (product.category_id ? `Category ${product.category_id}` : "Product");
  const apiImages = [
    ...(product.photos ?? []),
    ...(product.product_images?.map((image) => image.url) ?? []),
  ].filter(Boolean);
  const affiliateLink = product.affiliate_link || product.product_link || "#";
  const summary = product.short_description ?? product.description ?? "";
  const categoryDescription = product.category?.description ?? "";
  const companyTitle =
    product.company?.title ??
    (product.company_id ? `Company ${product.company_id}` : "Their Markets");

  return {
    id: product.id,
    name: product.title,
    brand: companyTitle,
    category: categoryTitle,
    collection: slugify(categoryTitle),
    price: product.price,
    rating: Number(product.rating ?? 0),
    reviewCount: Number(product.number_of_reviews ?? 0),
    image: apiImages?.[0],
    gallery: apiImages ?? [],
    material: categoryDescription,
    summary,
    curatorTake: product.description ?? summary,
    amazonUrl: affiliateLink,
    asin: extractAmazonAsin(affiliateLink),
    specs: [
      `Rating: ${product.rating ?? 0}`,
      `Reviews: ${product.number_of_reviews ?? 0}`,
      `Category: ${categoryTitle}`,
      `Company: ${companyTitle}`,
      ...(product.commission ? [`Commission: ${product.commission}%`] : []),
    ],
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractAmazonAsin(value: string) {
  if (/^[A-Z0-9]{10}$/i.test(value)) {
    return value.toUpperCase();
  }

  try {
    const url = new URL(value);
    const match = url.pathname.match(
      /\/(?:dp|gp\/product|exec\/obidos\/ASIN)\/([A-Z0-9]{10})/i,
    );

    return match?.[1]?.toUpperCase();
  } catch {
    return undefined;
  }
}
