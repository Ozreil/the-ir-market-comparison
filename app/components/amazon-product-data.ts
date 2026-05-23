export type AmazonProductData = {
  primaryImage?: {
    URL?: string;
  };
  title?: string;
};

const amazonProductDataCache = new Map<string, Promise<AmazonProductData | null>>();

export function getAmazonProductData(asin: string) {
  const normalizedAsin = asin.trim().toUpperCase();
  const cached = amazonProductDataCache.get(normalizedAsin);

  if (cached) {
    return cached;
  }

  const request = fetch(
    `/api/amazon/product-image?asin=${encodeURIComponent(normalizedAsin)}`,
  )
    .then((response) => {
      if (!response.ok) {
        return null;
      }

      return response.json() as Promise<AmazonProductData>;
    })
    .catch(() => null);

  amazonProductDataCache.set(normalizedAsin, request);

  return request;
}
