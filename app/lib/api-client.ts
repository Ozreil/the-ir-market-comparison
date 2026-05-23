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
  slug?: string;
  type?: string;
  products?: ProductDto[];
  product_pages?: ProductPageDto[];
  left_product?: ProductDto;
  right_product?: ProductDto;
  first_product?: ProductDto;
  second_product?: ProductDto;
  product_a?: ProductDto;
  product_b?: ProductDto;
  title?: string;
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

function getComparisonApiId(comparisonId: number | string) {
  const value = String(comparisonId);
  const leadingNumericId = value.match(/^\d+/)?.[0];

  return leadingNumericId ?? value;
}

function getApiBaseUrl() {
  // if (isBrowser()) {
  //   return "https://theirmarkets.com/api";
  //   // return "http://localhost/api";
  //   // return process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
  // }

  // if (process.env.API_BASE_URL) {
  //   return process.env.API_BASE_URL;
  // }

  // if (process.env.NODE_ENV === "production") {
  //   // return "https://theirmarkets.com/api";
  //   return "http://localhost/api";
  //   // return "http://localhost:8080";
  // }

  return "http://backend:8080/api";
}
