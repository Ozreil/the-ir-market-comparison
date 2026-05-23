"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAmazonProductData } from "./amazon-product-data";

type AmazonProductImageProps = {
  asin?: string;
  alt: string;
  className?: string;
  fallbackSrc: string;
  priority?: boolean;
  sizes: string;
};

export function AmazonProductImage({
  asin,
  alt,
  className,
  fallbackSrc,
  priority,
  sizes,
}: AmazonProductImageProps) {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    if (!asin) {
      return;
    }

    let isActive = true;

    getAmazonProductData(asin)
      .then((data) => {
        if (isActive && data?.primaryImage?.URL) {
          setSrc(data.primaryImage.URL);
        }
      })
      .catch(() => {
        if (isActive) {
          setSrc(fallbackSrc);
        }
      });

    return () => {
      isActive = false;
    };
  }, [asin, fallbackSrc]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      unoptimized
    />
  );
}
