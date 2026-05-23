import { createHash, createHmac } from "crypto";

const PAAPI_HOST = "webservices.amazon.com";
const PAAPI_REGION = "us-east-1";
const PAAPI_SERVICE = "ProductAdvertisingAPI";
const PAAPI_TARGET =
  "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";

type AmazonImage = {
  URL?: string;
  Height?: number;
  Width?: number;
};

type AmazonGetItemsResponse = {
  ItemsResult?: {
    Items?: Array<{
      ASIN?: string;
      DetailPageURL?: string;
      Images?: {
        Primary?: {
          Large?: AmazonImage;
        };
        Variants?: Array<{
          Large?: AmazonImage;
        }>;
      };
      ItemInfo?: {
        Title?: {
          DisplayValue?: string;
        };
      };
    }>;
  };
  Errors?: Array<{
    Code?: string;
    Message?: string;
  }>;
};

export function extractAmazonAsin(value: string) {
  const trimmed = value.trim();

  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  try {
    const url = new URL(trimmed);
    const pathnameMatch = url.pathname.match(
      /\/(?:dp|gp\/product|exec\/obidos\/ASIN)\/([A-Z0-9]{10})/i,
    );
    const queryAsin =
      url.searchParams.get("asin") ?? url.searchParams.get("ASIN");

    return (pathnameMatch?.[1] ?? queryAsin)?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

export function hasAmazonApiCredentials() {
  return Boolean(
    process.env.AMAZON_PAAPI_ACCESS_KEY &&
      process.env.AMAZON_PAAPI_SECRET_KEY,
  );
}

export async function getAmazonProductImages(asin: string) {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
  const partnerTag =
    process.env.AMAZON_PAAPI_PARTNER_TAG ??
    process.env.AMAZON_ASSOCIATE_TAG ??
    "ozoffers-20";
  const marketplace = process.env.AMAZON_PAAPI_MARKETPLACE ?? "www.amazon.com";

  if (!accessKey || !secretKey) {
    return {
      asin,
      configured: false,
      message:
        "Amazon API credentials are not configured. Add AMAZON_PAAPI_ACCESS_KEY and AMAZON_PAAPI_SECRET_KEY to fetch official product images.",
    };
  }

  const payload = JSON.stringify({
    ItemIds: [asin],
    Marketplace: marketplace,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Resources: [
      "Images.Primary.Large",
      "Images.Variants.Large",
      "ItemInfo.Title",
    ],
  });

  const amzDate = toAmzDate(new Date());
  const dateStamp = amzDate.slice(0, 8);
  const authorization = signPaapiRequest({
    accessKey,
    amzDate,
    dateStamp,
    payload,
    secretKey,
  });

  const response = await fetch(`https://${PAAPI_HOST}/paapi5/getitems`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Encoding": "amz-1.0",
      "Content-Type": "application/json; charset=utf-8",
      Host: PAAPI_HOST,
      "X-Amz-Date": amzDate,
      "X-Amz-Target": PAAPI_TARGET,
    },
    body: payload,
    next: {
      revalidate: 60 * 60 * 12,
    },
  });

  const data = (await response.json()) as AmazonGetItemsResponse;

  if (!response.ok || data.Errors?.length) {
    return {
      asin,
      configured: true,
      errors: data.Errors ?? [
        {
          Code: String(response.status),
          Message: response.statusText,
        },
      ],
    };
  }

  const item = data.ItemsResult?.Items?.[0];
  const primaryImage = item?.Images?.Primary?.Large;
  const variantImages =
    item?.Images?.Variants?.map((variant) => variant.Large).filter(
      (image): image is AmazonImage => Boolean(image?.URL),
    ) ?? [];

  return {
    asin,
    configured: true,
    detailPageUrl: item?.DetailPageURL,
    gallery: [primaryImage, ...variantImages].filter(
      (image): image is AmazonImage => Boolean(image?.URL),
    ),
    primaryImage,
    title: item?.ItemInfo?.Title?.DisplayValue,
  };
}

function signPaapiRequest({
  accessKey,
  amzDate,
  dateStamp,
  payload,
  secretKey,
}: {
  accessKey: string;
  amzDate: string;
  dateStamp: string;
  payload: string;
  secretKey: string;
}) {
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${PAAPI_REGION}/${PAAPI_SERVICE}/aws4_request`;
  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const canonicalHeaders = [
    "content-encoding:amz-1.0",
    "content-type:application/json; charset=utf-8",
    `host:${PAAPI_HOST}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:${PAAPI_TARGET}`,
    "",
  ].join("\n");
  const canonicalRequest = [
    "POST",
    "/paapi5/getitems",
    "",
    canonicalHeaders,
    signedHeaders,
    sha256(payload),
  ].join("\n");
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");
  const signingKey = getSignatureKey(
    secretKey,
    dateStamp,
    PAAPI_REGION,
    PAAPI_SERVICE,
  );
  const signature = hmac(signingKey, stringToSign, "hex");

  return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hmac(key: string | Buffer, value: string): Buffer;
function hmac(key: string | Buffer, value: string, encoding: "hex"): string;
function hmac(
  key: string | Buffer,
  value: string,
  encoding?: "hex",
): Buffer | string {
  const digest = createHmac("sha256", key).update(value, "utf8");

  return encoding ? digest.digest(encoding) : digest.digest();
}

function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string,
) {
  const kDate = hmac(`AWS4${key}`, dateStamp) as Buffer;
  const kRegion = hmac(kDate, regionName) as Buffer;
  const kService = hmac(kRegion, serviceName) as Buffer;
  return hmac(kService, "aws4_request") as Buffer;
}
