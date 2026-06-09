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
  buyer_intent_long_tail_keywords?: string[] | null;
  comparison_angle?: string | null;
  content_notes?: string | null;
  faq_schemas?: unknown;
  h1?: string | null;
  keywords?: string[] | null;
  meta_description?: string | null;
  meta_title?: string | null;
  og_description?: string | null;
  og_title?: string | null;
  primary_keyword?: string | null;
  slug?: string | null;
  structured_data?: unknown;
  twitter_description?: string | null;
  twitter_title?: string | null;
};

export type ProductComparisonDto = {
  brief_intro?: string | null;
  id: number | string;
  seo_metadata?: ProductSeoMetadataDto | null;
  slug?: string | null;
  type?: string | null;
  products?: ProductDto[];
  product_pages?: ProductPageDto[];
  left_product?: ProductDto;
  right_product?: ProductDto;
  first_product?: ProductDto;
  second_product?: ProductDto;
  product_a?: ProductDto;
  product_b?: ProductDto;
  title?: string | null;
  summary?: string | null;
};

export type ProductPageDto = {
  id: number | string;
  product?: ProductDto;
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
  const path = `/pages/${getComparisonApiId(comparisonId)}`;

  console.log("[getProductComparisonById] request", {
    baseURL: apiClient.defaults.baseURL,
    comparisonId,
    path,
  });

  try {
    const response = await apiClient.get<ProductComparisonDto>(path, config);

    console.log("[getProductComparisonById] response", {
      data: response.data,
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      path: path,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[getProductComparisonById] error", {
        code: error.code,
        config: {
          baseURL: error.config?.baseURL,
          headers: error.config?.headers,
          method: error.config?.method,
          params: error.config?.params,
          timeout: error.config?.timeout,
          url: error.config?.url,
          path: path,
        },
        message: error.message,
        name: error.name,
        response: error.response
          ? {
              data: error.response.data,
              headers: error.response.headers,
              status: error.response.status,
              statusText: error.response.statusText,
              path: path,
            }
          : null,
        stack: error.stack,
        toJSON: error.toJSON(),
      });

      throw error;
    }

    console.error("[getProductComparisonById] non-Axios error", error);
    throw error;
  }
}

export async function getAllCategories(config?: AxiosRequestConfig) {
  const response = await apiClient.get<CategoryDto[]>("/categories", config);

  return response.data;
}

function getComparisonApiId(comparisonId: number | string) {
  const value = String(comparisonId);
  const leadingNumericId = value.match(/^\d+/)?.[0];

  return leadingNumericId ?? value;
}

function getApiBaseUrl() {
  // return "https://theirmarkets.com/api";
  return "http://nginx/api";
}
