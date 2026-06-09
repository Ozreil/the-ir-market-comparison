import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "../lib/api-client";

export async function TopNavBar({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const categories = await getAllCategories().catch(() => []);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        isDark
          ? "border-white/10 bg-[#121212]/82 text-white"
          : "border-black/10 bg-[#f9f9f9]/86 text-[#121212]"
      }`}
    >
      <nav className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-5 lg:grid-cols-[auto_minmax(520px,1fr)_auto] lg:items-center lg:gap-5 lg:px-8 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Their Markets home"
          >
            <Image
              src="/logo.png"
              alt=""
              width={398}
              height={419}
              priority={isDark}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-full border border-gold/30 object-cover p-1 sm:h-11 sm:w-11"
            />
          </Link>

          <details className="group relative lg:hidden">
            <summary
              className={`flex h-10 cursor-pointer list-none items-center gap-2 border px-4 text-xs font-bold uppercase tracking-[0.18em] transition marker:hidden ${
                isDark
                  ? "border-white/18 text-white hover:border-gold"
                  : "border-black/12 text-[#121212] hover:border-gold"
              }`}
            >
              Menu
              <span className="text-base leading-none text-gold transition group-open:rotate-45">
                +
              </span>
            </summary>
            <div
              className={`absolute right-0 top-12 w-[min(88vw,360px)] border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] ${
                isDark
                  ? "border-white/12 bg-[#121212] text-white"
                  : "border-black/10 bg-white text-[#121212]"
              }`}
            >
              <div className="grid gap-3 border-b border-current/10 pb-4 text-sm">
                <Link href="/category" className="transition hover:text-gold">
                  Collections
                </Link>
                <Link href="/#selected" className="transition hover:text-gold">
                  Selected
                </Link>
                <Link href="/#registry" className="transition hover:text-gold">
                  Updates
                </Link>
              </div>
              <form action="/category" className="mt-4 grid gap-3">
                <label className="sr-only" htmlFor="mobile-site-search">
                  Search products
                </label>
                <input
                  id="mobile-site-search"
                  name="query"
                  type="search"
                  placeholder="Search the edit"
                  className={`h-11 min-w-0 border px-4 text-sm outline-none transition focus:border-gold ${
                    isDark
                      ? "border-white/15 bg-white/8 text-white placeholder:text-white/42"
                      : "border-black/12 bg-white text-[#121212] placeholder:text-[#121212]/42"
                  }`}
                />
                <label className="sr-only" htmlFor="mobile-site-category">
                  Category
                </label>
                <select
                  id="mobile-site-category"
                  name="collection"
                  className={`h-11 border px-3 text-sm outline-none transition focus:border-gold ${
                    isDark
                      ? "border-white/15 bg-[#121212] text-white"
                      : "border-black/12 bg-white text-[#121212]"
                  }`}
                  defaultValue=""
                >
                  <option value="">All collections</option>
                  {categories.map((category) => (
                    <option key={category.id} value={slugify(category.title)}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <button className="h-11 bg-gold px-5 text-xs font-bold uppercase tracking-[0.2em] text-[#121212] transition hover:bg-[#121212] hover:text-white">
                  Search
                </button>
              </form>
            </div>
          </details>
        </div>

        <form
          action="/category"
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto] lg:grid-cols-[minmax(360px,1fr)_170px_auto]"
        >
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            id="site-search"
            name="query"
            type="search"
            placeholder="Search products, categories, and trusted picks"
            className={`h-12 min-w-0 border px-5 text-base outline-none transition focus:border-gold ${
              isDark
                ? "border-white/18 bg-white/10 text-white placeholder:text-white/46"
                : "border-black/12 bg-white text-[#121212] placeholder:text-[#121212]/42"
            }`}
          />
          <label className="sr-only" htmlFor="site-category">
            Category
          </label>
          <select
            id="site-category"
            name="collection"
            className={`hidden h-12 border px-3 text-sm outline-none transition focus:border-gold sm:block ${
              isDark
                ? "border-white/15 bg-[#121212] text-white"
                : "border-black/12 bg-white text-[#121212]"
            }`}
            defaultValue=""
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={slugify(category.title)}>
                {category.title}
              </option>
            ))}
          </select>
          <button className="h-12 bg-gold px-6 text-xs font-bold uppercase tracking-[0.2em] text-[#121212] transition hover:bg-white">
            Search
          </button>
        </form>
      </nav>
    </header>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
