import type { Metadata } from "next";
import axios from "axios";
import { notFound, permanentRedirect } from "next/navigation";
import { AmazonProductImage } from "../../components/AmazonProductImage";
import { AmazonProductTitle } from "../../components/AmazonProductTitle";
import { Footer } from "../../components/Footer";
import { JsonLd } from "../../components/JsonLd";
import { RatingStars } from "../../components/RatingStars";
import { TopNavBar } from "../../components/TopNavBar";
import { amazonLinkAttributes } from "../../data/affiliate";
import {
  getProductComparisonById,
  type ProductComparisonDto,
  type ProductDto,
} from "../../lib/api-client";
import {
  productDtoToDisplayProduct,
  type Product,
} from "../../lib/product-display";
import { absoluteUrl, comparisonJsonLd, siteName } from "../../lib/seo";

export const dynamic = "force-dynamic";

type ComparisonData = {
  id: number | string;
  canonicalPath: string;
  keywords: string[];
  seoDescription: string;
  seoTitle: string;
  slug?: string;
  title: string;
  summary?: string | null;
  products: [Product, Product];
  isPreview?: boolean;
};

type AttributeRow = {
  label: string;
  left: string;
  right: string;
  winner?: "left" | "right" | "tie";
};

type ComparisonFocus = "balanced" | "value" | "ratings" | "details";

const comparisonFocuses: Record<
  ComparisonFocus,
  {
    label: string;
    eyebrow: string;
    metadataSuffix?: string;
    summary: (comparison: ComparisonData) => string;
  }
> = {
  balanced: {
    eyebrow: "Product comparison",
    label: "Balanced",
    summary: (comparison) => comparison.summary ?? comparison.seoDescription,
  },
  value: {
    eyebrow: "Value comparison",
    label: "Value",
    metadataSuffix: "Best Value",
    summary: ({ products }) =>
      `Compare price, rating, and review volume to see which product gives shoppers the stronger value: ${products[0].name} or ${products[1].name}.`,
  },
  ratings: {
    eyebrow: "Ratings comparison",
    label: "Ratings",
    metadataSuffix: "Ratings and Reviews",
    summary: ({ products }) =>
      `Compare review count, average rating, and buyer confidence signals for ${products[0].name} and ${products[1].name}.`,
  },
  details: {
    eyebrow: "Details comparison",
    label: "Details",
    metadataSuffix: "Product Details",
    summary: ({ products }) =>
      `Compare product fit, category, brand context, and everyday-use details before choosing between ${products[0].name} and ${products[1].name}.`,
  },
};

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string }>;
  searchParams?: Promise<{ focus?: string }>;
}): Promise<Metadata> {
  const { comparisonId } = await params;
  const focus = getComparisonFocus((await searchParams)?.focus);
  const comparison = await getComparisonData(comparisonId);

  if (!comparison) {
    return {
      title: "Comparison Not Found",
    };
  }

  const [leftProduct, rightProduct] = comparison.products;
  const focusConfig = comparisonFocuses[focus];
  const title = getVariantTitle(comparison, focus);
  const description = truncate(focusConfig.summary(comparison), 156);
  const ogDescription = truncate(description, 200);
  const canonicalPath = getVariantPath(comparison, focus);
  const comparisonUrl = absoluteUrl(canonicalPath);
  const imageProduct = comparison.products.find((product) => product.image);
  const imageUrl = imageProduct?.image
    ? imageProduct.image.startsWith("http")
      ? imageProduct.image
      : absoluteUrl(imageProduct.image)
    : absoluteUrl("/full-logo.jpeg");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords:
      focus === "balanced"
        ? comparison.keywords
        : [...comparison.keywords, `${focusConfig.label.toLowerCase()} comparison`],
    openGraph: {
      description: ogDescription,
      images: [
        {
          alt: `${leftProduct.name} vs. ${rightProduct.name}`,
          url: imageUrl,
        },
      ],
      siteName,
      title,
      type: "website",
      url: comparisonUrl,
    },
    twitter: {
      card: "summary_large_image",
      description: ogDescription,
      images: [imageUrl],
      title,
    },
  };
}

export default async function ComparisonPage({
  params,
  searchParams,
}: {
  params: Promise<{ comparisonId: string }>;
  searchParams?: Promise<{ focus?: string }>;
}) {
  const { comparisonId } = await params;
  const focus = getComparisonFocus((await searchParams)?.focus);
  const comparison = await getComparisonData(comparisonId);

  if (!comparison) {
    notFound();
  }

  if (comparison.slug && comparisonId !== comparison.slug) {
    permanentRedirect(getVariantPath(comparison, focus));
  }

  const [leftProduct, rightProduct] = comparison.products;
  const rows = buildAttributeRows(leftProduct, rightProduct, focus);
  const focusConfig = comparisonFocuses[focus];
  const description = truncate(focusConfig.summary(comparison), 156);

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#121212]">
      <JsonLd
        data={comparisonJsonLd({
          description,
          products: comparison.products,
          title: comparison.title,
          url: absoluteUrl(getVariantPath(comparison, focus)),
        })}
      />
      <TopNavBar />

      <section className="border-b border-black/10 px-5 py-10 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8f741f]">
            {focusConfig.eyebrow}
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.45fr)] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.03em] sm:text-6xl">
                {comparison.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#5c574e] sm:text-lg">
                {focusConfig.summary(comparison)}
              </p>
            </div>
          </div>
          <ComparisonFocusNav comparison={comparison} activeFocus={focus} />
        </div>
      </section>

      <ComparisonInsightStrip
        focus={focus}
        leftProduct={leftProduct}
        rightProduct={rightProduct}
      />

      <section className="px-5 py-10 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <ComparisonProductPanel product={leftProduct} sideLabel="Option A" />
          <ComparisonProductPanel product={rightProduct} sideLabel="Option B" />
        </div>
      </section>

      <section className="px-5 pb-12 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="border-y border-black/10 bg-white">
            <div className="grid grid-cols-[1fr_1fr] border-b border-black/10 lg:grid-cols-[13rem_1fr_1fr]">
              <div className="hidden bg-[#121212] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white lg:block">
                Attribute
              </div>
              <div className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#7c735f] lg:px-5">
                {leftProduct.brand}
              </div>
              <div className="border-l border-black/10 px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#7c735f] lg:px-5">
                {rightProduct.brand}
              </div>
            </div>

            {rows.map((row) => (
              <ComparisonAttributeRow key={row.label} row={row} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ComparisonProductPanel({
  product,
  sideLabel,
}: {
  product: Product;
  sideLabel: string;
}) {
  return (
    <article className="flex min-h-full flex-col border border-black/10 bg-white">
      <a
        href={product.amazonUrl}
        {...amazonLinkAttributes}
        className="inline-flex min-h-24 w-full items-center justify-center gap-4 border-b border-black/10 bg-[#f2b705] px-6 py-5 text-center text-xl font-extrabold uppercase tracking-[0.16em] text-[#121212] shadow-[0_14px_34px_rgba(18,18,18,0.12)] transition hover:bg-[#121212] hover:text-white focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#d4af37]/45 sm:text-2xl"
      >
        <span>Buy on Amazon</span>
        <span aria-hidden="true" className="text-3xl leading-none">
          →
        </span>
      </a>
      <div className="grid flex-1 gap-4 p-4 pt-5 md:grid-cols-[0.9fr_1fr] md:gap-0 md:p-5">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeeeb] md:aspect-auto">
          {product.image ? (
            <AmazonProductImage
              asin={product.asin}
              fallbackSrc={product.image}
              alt={product.name}
              sizes="(min-width: 1024px) 25vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full min-h-80 place-items-center px-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#7c735f]">
              Image unavailable
            </div>
          )}
          <div className="absolute left-4 top-4 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]">
            {sideLabel}
          </div>
        </div>
        <div className="flex flex-col md:p-5 lg:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8f741f]">
            {product.brand} / {product.category}
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-9 tracking-[-0.03em]">
            <AmazonProductTitle
              asin={product.asin}
              fallbackTitle={product.name}
            />
          </h2>
          <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#5c574e]">
            {product.summary || product.curatorTake}
          </p>
          <div className="mt-6 grid grid-cols-2 border-y border-black/10">
            <div className="py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7c735f]">
                Price
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {formatCurrency(product.price)}
              </p>
            </div>
            <div className="border-l border-black/10 py-4 pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7c735f]">
                Rating
              </p>
              <RatingStars rating={product.rating} className="mt-3 text-xl" />
              <p className="mt-2 text-xs text-[#6a6257]">
                {formatNumber(product.reviewCount)} reviews
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ComparisonFocusNav({
  activeFocus,
  comparison,
}: {
  activeFocus: ComparisonFocus;
  comparison: ComparisonData;
}) {
  return (
    <nav
      aria-label="Comparison focus"
      className="mt-8 flex flex-wrap gap-2 border-t border-black/10 pt-5"
    >
      {(Object.keys(comparisonFocuses) as ComparisonFocus[]).map((focus) => (
        <a
          key={focus}
          href={getVariantPath(comparison, focus)}
          className={`border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
            activeFocus === focus
              ? "border-[#121212] bg-[#121212] text-white"
              : "border-black/12 bg-white text-[#5c574e] hover:border-gold hover:text-[#121212]"
          }`}
        >
          {comparisonFocuses[focus].label}
        </a>
      ))}
    </nav>
  );
}

function ComparisonInsightStrip({
  focus,
  leftProduct,
  rightProduct,
}: {
  focus: ComparisonFocus;
  leftProduct: Product;
  rightProduct: Product;
}) {
  if (focus === "balanced") {
    return null;
  }

  const insights = getFocusInsights(focus, leftProduct, rightProduct);

  return (
    <section className="border-b border-black/10 bg-[#121212] px-5 py-8 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {insights.map((insight) => (
          <div key={insight.label} className="border border-white/12 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              {insight.label}
            </p>
            <p className="mt-3 text-2xl font-semibold">{insight.value}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {insight.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonAttributeRow({ row }: { row: AttributeRow }) {
  return (
    <div className="grid grid-cols-[1fr_1fr] border-b border-black/10 last:border-b-0 lg:grid-cols-[13rem_1fr_1fr]">
      <div className="col-span-2 bg-[#f3f0e9] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6d6250] lg:col-span-1 lg:bg-transparent lg:px-5 lg:py-5">
        {row.label}
      </div>
      <AttributeCell value={row.left} isWinner={row.winner === "left"} />
      <AttributeCell value={row.right} isWinner={row.winner === "right"} />
    </div>
  );
}

function AttributeCell({
  value,
  isWinner,
}: {
  value: string;
  isWinner?: boolean;
}) {
  return (
    <div
      className={`min-h-16 px-4 py-4 text-sm leading-6 text-[#3f3a33] lg:px-5 ${
        isWinner ? "bg-[#f8f2dc]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span>{value}</span>
        {isWinner ? (
          <span className="shrink-0 bg-[#121212] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Best
          </span>
        ) : null}
      </div>
    </div>
  );
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trim()}...`
    : value;
}

async function getComparisonData(
  comparisonId: string,
): Promise<ComparisonData | null> {
  try {
    return normalizeComparison(
      await getProductComparisonById(comparisonId),
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development" && comparisonId === "demo") {
      return normalizeComparison(getPreviewComparison(comparisonId), true);
    }

    if (axios.isAxiosError(error)) {
      console.error("[getComparisonData] failed", {
        baseURL: error.config?.baseURL,
        comparisonId,
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
      });

      return null;
    }

    console.error("[getComparisonData] failed", {
      comparisonId,
      message: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}

function normalizeComparison(
  comparison: ProductComparisonDto,
  isPreview = false,
): ComparisonData | null {
  const products = getComparisonProducts(comparison);

  if (products.length < 2) {
    return null;
  }

  const displayProducts = products
    .slice(0, 2)
    .map(productDtoToDisplayProduct) as [Product, Product];
  const [leftProduct] = products;
  const [leftDisplayProduct, rightDisplayProduct] = displayProducts;
  const title =
    comparison.title ??
    `${leftDisplayProduct.name} vs. ${rightDisplayProduct.name}`;
  const seoTitle = `${getProductSeoTitle(leftProduct, leftDisplayProduct)} vs. ${getProductSeoTitle(products[1], rightDisplayProduct)}`;
  const seoDescription = getSeoDescription({
    comparison,
    leftProduct,
    products: displayProducts,
  });
  const slug = comparison.slug ?? (isPreview ? String(comparison.id) : buildComparisonSlug(comparison.id, title));

  return {
    canonicalPath: `/comparison/${slug}`,
    id: comparison.id,
    isPreview,
    keywords: getSeoKeywords(products, displayProducts),
    products: displayProducts,
    seoDescription,
    seoTitle,
    slug,
    summary: comparison.summary ?? seoDescription,
    title,
  };
}

function getProductSeoTitle(rawProduct: ProductDto, product: Product) {
  return (
    rawProduct.seo_metadata?.og_title ??
    rawProduct.seo_metadata?.meta_title ??
    product.name
  );
}

function getSeoDescription({
  comparison,
  leftProduct,
  products,
}: {
  comparison: ProductComparisonDto;
  leftProduct: ProductDto;
  products: [Product, Product];
}) {
  return truncate(
    comparison.summary ??
      `Compare ${products[0].name} and ${products[1].name}. ${
        leftProduct.seo_metadata?.meta_description ??
        leftProduct.seo_metadata?.og_description ??
        "Review pricing, ratings, reviews, and buying details for both products."
      }`,
    156,
  );
}

function getSeoKeywords(rawProducts: ProductDto[], products: [Product, Product]) {
  return [
    ...rawProducts.flatMap((product) => product.seo_metadata?.keywords ?? []),
    ...rawProducts.map((product) => product.seo_metadata?.primary_keyword),
    ...products.flatMap((product) => [
      product.name,
      product.brand,
      product.category,
    ]),
    "product comparison",
    "price comparison",
    "review comparison",
  ].filter((keyword, index, values): keyword is string => {
    return Boolean(keyword) && values.indexOf(keyword) === index;
  });
}

function buildComparisonSlug(id: number | string, title: string) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return baseSlug ? `${id}-${baseSlug}` : String(id);
}

function getComparisonFocus(value?: string): ComparisonFocus {
  if (
    value === "value" ||
    value === "ratings" ||
    value === "details" ||
    value === "balanced"
  ) {
    return value;
  }

  return "balanced";
}

function getVariantPath(comparison: ComparisonData, focus: ComparisonFocus) {
  const path = comparison.canonicalPath;

  return focus === "balanced" ? path : `${path}?focus=${focus}`;
}

function getVariantTitle(comparison: ComparisonData, focus: ComparisonFocus) {
  const suffix = comparisonFocuses[focus].metadataSuffix;

  return suffix ? `${comparison.seoTitle} | ${suffix}` : comparison.seoTitle;
}

function getFocusInsights(
  focus: ComparisonFocus,
  left: Product,
  right: Product,
) {
  const cheaperProduct = left.price <= right.price ? left : right;
  const higherRatedProduct = left.rating >= right.rating ? left : right;
  const moreReviewedProduct =
    left.reviewCount >= right.reviewCount ? left : right;
  const priceDifference = Math.abs(left.price - right.price);

  if (focus === "value") {
    return [
      {
        detail: `${cheaperProduct.name} has the lower listed price in this comparison.`,
        label: "Lower price",
        value: formatCurrency(cheaperProduct.price),
      },
      {
        detail: `The price gap between both products is ${formatCurrency(priceDifference)}.`,
        label: "Price gap",
        value: formatCurrency(priceDifference),
      },
      {
        detail: `${higherRatedProduct.name} has the stronger average rating.`,
        label: "Rating edge",
        value: `${formatDecimal(higherRatedProduct.rating)} / 5`,
      },
    ];
  }

  if (focus === "ratings") {
    return [
      {
        detail: `${higherRatedProduct.name} currently leads on average rating.`,
        label: "Top rating",
        value: `${formatDecimal(higherRatedProduct.rating)} / 5`,
      },
      {
        detail: `${moreReviewedProduct.name} has the larger review sample.`,
        label: "Most reviewed",
        value: formatNumber(moreReviewedProduct.reviewCount),
      },
      {
        detail: `Together, these products represent ${formatNumber(left.reviewCount + right.reviewCount)} reviews.`,
        label: "Review pool",
        value: formatNumber(left.reviewCount + right.reviewCount),
      },
    ];
  }

  return [
    {
      detail: `${left.name} is listed under ${left.category}.`,
      label: "Option A fit",
      value: left.category,
    },
    {
      detail: `${right.name} is listed under ${right.category}.`,
      label: "Option B fit",
      value: right.category,
    },
    {
      detail: "Use this view when the buying decision depends more on use case than headline price.",
      label: "Decision lens",
      value: "Product fit",
    },
  ];
}

function getComparisonProducts(comparison: ProductComparisonDto) {
  return [
    ...(comparison.products ?? []),
    ...(comparison.product_pages?.map((page) => page.product) ?? []),
    comparison.left_product,
    comparison.right_product,
    comparison.first_product,
    comparison.second_product,
    comparison.product_a,
    comparison.product_b,
  ].filter((product): product is ProductDto => Boolean(product));
}

function buildAttributeRows(
  left: Product,
  right: Product,
  focus: ComparisonFocus,
): AttributeRow[] {
  const priceRow: AttributeRow = {
    label: "Price",
    left: formatCurrency(left.price),
    right: formatCurrency(right.price),
    winner: compareLowerIsBetter(left.price, right.price),
  };
  const ratingRow: AttributeRow = {
    label: "Rating",
    left: `${formatDecimal(left.rating)} out of 5`,
    right: `${formatDecimal(right.rating)} out of 5`,
    winner: compareHigherIsBetter(left.rating, right.rating),
  };
  const reviewsRow: AttributeRow = {
    label: "Reviews",
    left: formatNumber(left.reviewCount),
    right: formatNumber(right.reviewCount),
    winner: compareHigherIsBetter(left.reviewCount, right.reviewCount),
  };
  const detailsRows: AttributeRow[] = [
    {
      label: "Best for",
      left: left.summary || left.curatorTake || "Product details coming soon.",
      right:
        right.summary || right.curatorTake || "Product details coming soon.",
    },
    {
      label: "Brand",
      left: left.brand,
      right: right.brand,
    },
    {
      label: "Category",
      left: left.category,
      right: right.category,
    },
  ];
  const valueRows: AttributeRow[] = [
    {
      label: "Value read",
      left: `${formatCurrency(left.price)} with ${formatDecimal(left.rating)} rating`,
      right: `${formatCurrency(right.price)} with ${formatDecimal(right.rating)} rating`,
      winner: getValueWinner(left, right),
    },
  ];

  if (focus === "value") {
    return [priceRow, ...valueRows, ratingRow, reviewsRow, detailsRows[0]];
  }

  if (focus === "ratings") {
    return [ratingRow, reviewsRow, priceRow, detailsRows[0]];
  }

  if (focus === "details") {
    return [...detailsRows, priceRow, ratingRow, reviewsRow];
  }

  return [priceRow, ratingRow, reviewsRow, detailsRows[0]];
}

function compareLowerIsBetter(left: number, right: number) {
  if (left === right) {
    return "tie";
  }

  return left < right ? "left" : "right";
}

function compareHigherIsBetter(left: number, right: number) {
  if (left === right) {
    return "tie";
  }

  return left > right ? "left" : "right";
}

function getValueWinner(left: Product, right: Product) {
  const leftScore = left.rating / Math.max(left.price, 1);
  const rightScore = right.rating / Math.max(right.price, 1);

  if (leftScore === rightScore) {
    return "tie";
  }

  return leftScore > rightScore ? "left" : "right";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(value);
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getPreviewComparison(comparisonId: string): ProductComparisonDto {
  return {
    id: comparisonId,
    summary:
      "A development preview of the final comparison experience while the comparison API is being finished.",
    title: "Compact espresso maker vs. precision coffee grinder",
    products: [
      {
        id: 101,
        affiliate_link: "#",
        category: {
          description: "Coffee tools selected for everyday kitchens.",
          id: 7,
          title: "Coffee",
        },
        company: {
          description: null,
          id: 3,
          title: "Their Markets",
        },
        description:
          "A compact espresso maker for shoppers who want a polished countertop setup without giving up too much space.",
        info_date: new Date().toISOString(),
        number_of_reviews: 1842,
        photos: ["/full-logo.jpeg"],
        price: 149,
        product_link: "#",
        rating: 4.6,
        short_description:
          "Compact espresso maker with a small footprint and strong daily-use value.",
        slug: "compact-espresso-maker",
        title: "Compact Espresso Maker",
      },
      {
        id: 102,
        affiliate_link: "#",
        category: {
          description: "Coffee tools selected for everyday kitchens.",
          id: 7,
          title: "Coffee",
        },
        company: {
          description: null,
          id: 4,
          title: "Partner Goods",
        },
        description:
          "A precision grinder built for shoppers who care about consistent grounds and repeatable cups.",
        info_date: new Date().toISOString(),
        number_of_reviews: 936,
        photos: ["/logo.png"],
        price: 89,
        product_link: "#",
        rating: 4.8,
        short_description:
          "Precision grinder focused on consistent texture and flexible brewing styles.",
        slug: "precision-coffee-grinder",
        title: "Precision Coffee Grinder",
      },
    ],
  };
}
