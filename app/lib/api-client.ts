import axios, { type AxiosRequestConfig } from "axios";

export type CategoryDto = {
  id: number;
  title: string;
  description: string | null;
};

export type CompanyDto = {
  id: number;
  title: string;
  description: string | null;
};

export type ProductDto = {
  id: number;
  category?: CategoryDto;
  category_id?: number;
  company?: CompanyDto;
  company_id?: number;
  title: string;
  description: string | null;
  affiliate_link: string;
  product_link: string;
  slug: string;
  rating: number;
  number_of_reviews: number;
  info_date: string;
  price: number;
  commission?: number;
  created_at?: string;
  deleted?: boolean;
  photos?: string[];
  product_images?: ProductImageDto[];
  seo_metadata?: ProductSeoMetadataDto;
  short_description?: string | null;
  updated_at?: string;
};

export type ProductImageDto = {
  id: number;
  url: string;
};

export type ProductSeoMetadataDto = {
  meta_title?: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  primary_keyword?: string;
  keywords?: string[];
};

export type ProductComparisonDto = {
  id: number | string;
  products?: ProductDto[];
  left_product?: ProductDto;
  right_product?: ProductDto;
  first_product?: ProductDto;
  second_product?: ProductDto;
  product_a?: ProductDto;
  product_b?: ProductDto;
  title?: string;
  summary?: string | null;
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

export async function getProductComparisonById(
  comparisonId: number | string,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.get<ProductComparisonDto>(
    `/pages/${comparisonId}`,
    config,
  );

  return response.data;
}

function getApiBaseUrl() {
  if (isBrowser()) {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  }

  return process.env.API_BASE_URL ?? "http://localhost:8080/api";
}

function isBrowser() {
  return typeof window !== "undefined";
}
