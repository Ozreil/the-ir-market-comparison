import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ comparisonId: string }>;
}): Promise<Metadata> {
  const { comparisonId } = await params;
  const comparison = await getComparisonData(comparisonId);

  if (!comparison) {
    return {
      title: "Comparison Not Found",
    };
  }

  const [leftProduct, rightProduct] = comparison.products;
  const title = comparison.title;
  const description = getComparisonDescription(comparison);
  const ogDescription = truncate(description, 200);
  const comparisonUrl = absoluteUrl(`/comparison/${comparisonId}`);
  const imageProduct = comparison.products.find((product) => product.image);
  const imageUrl = imageProduct?.image
    ? imageProduct.image.startsWith("http")
      ? imageProduct.image
      : absoluteUrl(imageProduct.image)
    : absoluteUrl("/full-logo.jpeg");
  const keywords = [
    leftProduct.name,
    rightProduct.name,
    leftProduct.brand,
    rightProduct.brand,
    leftProduct.category,
    rightProduct.category,
    "product comparison",
    "price comparison",
    "review comparison",
  ].filter((keyword, index, values): keyword is string => {
    return Boolean(keyword) && values.indexOf(keyword) === index;
  });

  return {
    title,
    description,
    alternates: {
      canonical: `/comparison/${comparisonId}`,
    },
    keywords,
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
}: {
  params: Promise<{ comparisonId: string }>;
}) {
  const { comparisonId } = await params;
  const comparison = await getComparisonData(comparisonId);

  if (!comparison) {
    notFound();
  }

  const [leftProduct, rightProduct] = comparison.products;
  const rows = buildAttributeRows(leftProduct, rightProduct);
  const description = getComparisonDescription(comparison);

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#121212]">
      <JsonLd
        data={comparisonJsonLd({
          description,
          products: comparison.products,
          title: comparison.title,
          url: absoluteUrl(`/comparison/${comparisonId}`),
        })}
      />
      <TopNavBar />

      <section className="border-b border-black/10 px-5 py-10 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8f741f]">
            Product comparison
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.45fr)] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.03em] sm:text-6xl">
                {comparison.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#5c574e] sm:text-lg">
                {comparison.summary ??
                  "Compare the two products side by side across price, reviews, rating, brand, category, and shopping details."}
              </p>
            </div>
          </div>
        </div>
      </section>

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
    <article className="border border-black/10 bg-white">
      <div className="grid min-h-full gap-0 md:grid-cols-[0.9fr_1fr]">
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
        <div className="flex flex-col p-5 sm:p-6">
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
          <div className="mt-auto pt-6">
            <a
              href={product.amazonUrl}
              {...amazonLinkAttributes}
              className="inline-flex min-h-12 w-full items-center justify-center bg-gold px-5 text-xs font-bold uppercase tracking-[0.2em] text-[#121212] transition hover:bg-[#121212] hover:text-white"
            >
              Buy on Amazon
            </a>
          </div>
        </div>
      </div>
    </article>
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

function getComparisonDescription(comparison: ComparisonData) {
  return truncate(
    comparison.summary ??
      `Compare ${comparison.products[0].name} and ${comparison.products[1].name} side by side by price, reviews, rating, and product details.`,
    156,
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
  } catch {
    if (process.env.NODE_ENV === "development") {
      return normalizeComparison(getPreviewComparison(comparisonId), true);
    }

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

  return {
    id: comparison.id,
    isPreview,
    products: displayProducts,
    summary: comparison.summary,
    title:
      comparison.title ??
      `${displayProducts[0].name} vs. ${displayProducts[1].name}`,
  };
}

function getComparisonProducts(comparison: ProductComparisonDto) {
  return [
    ...(comparison.products ?? []),
    comparison.left_product,
    comparison.right_product,
    comparison.first_product,
    comparison.second_product,
    comparison.product_a,
    comparison.product_b,
  ].filter((product): product is ProductDto => Boolean(product));
}

function buildAttributeRows(left: Product, right: Product): AttributeRow[] {
  return [
    {
      label: "Price",
      left: formatCurrency(left.price),
      right: formatCurrency(right.price),
      winner: compareLowerIsBetter(left.price, right.price),
    },
    {
      label: "Rating",
      left: `${formatDecimal(left.rating)} out of 5`,
      right: `${formatDecimal(right.rating)} out of 5`,
      winner: compareHigherIsBetter(left.rating, right.rating),
    },
    {
      label: "Reviews",
      left: formatNumber(left.reviewCount),
      right: formatNumber(right.reviewCount),
      winner: compareHigherIsBetter(left.reviewCount, right.reviewCount),
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
    {
      label: "Best for",
      left: left.summary || left.curatorTake || "Product details coming soon.",
      right:
        right.summary || right.curatorTake || "Product details coming soon.",
    },
  ];
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
