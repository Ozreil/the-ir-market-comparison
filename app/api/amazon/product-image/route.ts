import { NextResponse } from "next/server";
import {
  extractAmazonAsin,
  getAmazonProductImages,
  hasAmazonApiCredentials,
} from "../../../lib/amazon";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asinParam = searchParams.get("asin");
  const urlParam = searchParams.get("url");
  const asin = extractAmazonAsin(asinParam ?? urlParam ?? "");

  if (!asin) {
    return NextResponse.json(
      {
        error:
          "Provide an Amazon ASIN or product URL, for example /api/amazon/product-image?asin=B0016HF5GK",
      },
      { status: 400 },
    );
  }

  const result = await getAmazonProductImages(asin);
  const status = hasAmazonApiCredentials() ? 200 : 501;

  return NextResponse.json(result, {
    status,
    headers: {
      "Cache-Control": status === 200 ? "s-maxage=43200" : "no-store",
    },
  });
}
