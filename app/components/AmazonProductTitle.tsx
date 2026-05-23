"use client";

import { useEffect, useState } from "react";
import { getAmazonProductData } from "./amazon-product-data";

type AmazonProductTitleProps = {
  asin?: string;
  fallbackTitle: string;
  className?: string;
};

export function AmazonProductTitle({
  asin,
  fallbackTitle,
  className,
}: AmazonProductTitleProps) {
  const [title, setTitle] = useState(fallbackTitle);

  useEffect(() => {
    if (!asin) {
      return;
    }

    let isActive = true;

    getAmazonProductData(asin)
      .then((data) => {
        if (isActive && data?.title) {
          setTitle(data.title);
        }
      })
      .catch(() => {
        if (isActive) {
          setTitle(fallbackTitle);
        }
      });

    return () => {
      isActive = false;
    };
  }, [asin, fallbackTitle]);

  return <>{className ? <span className={className}>{title}</span> : title}</>;
}
