import Link from "next/link";
import type { CategoryDto } from "../../lib/api-client";

export function FeaturedCollections({
  categories,
}: {
  categories: CategoryDto[];
}) {
  return (
    <section className="px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#8f741f]">
              Browse by category
            </p>
            <h2 className="mt-4 font-serif text-5xl leading-none sm:text-7xl">
              A market built for quick trust.
            </h2>
          </div>
          <p className="max-w-2xl text-lg font-light leading-8 text-[#5c574e]">
            Each collection keeps comparison simple: clear categories, direct
            affiliate links, and products chosen for everyday usefulness.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category?collection=${slugify(category.title)}`}
                className={`group relative min-h-[320px] overflow-hidden bg-[#121212] ${
                  index % 2 ? "xl:mt-16" : ""
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url("https://theirmarkets.com/categories/images/${category.id}.jpeg")`,
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,18,0.08),rgba(18,18,18,0.42)_45%,rgba(18,18,18,0.88))]" />
                <div className="absolute inset-x-0 bottom-0 bg-[#121212]/72 p-6 text-white backdrop-blur-[2px]">
                  <h3 className="mt-4 font-serif text-3xl leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                    {category.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/82 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 border border-black/10 bg-white px-6 py-14 text-center">
            <h3 className="font-serif text-3xl">
              The full market is being prepared.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#666056]">
              You can still enter the main catalog and search the newest
              affiliate product picks.
            </p>
            <Link
              href="/category"
              className="mt-7 inline-flex min-h-11 items-center justify-center bg-[#121212] px-6 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-gold hover:text-[#121212]"
            >
              Browse products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
