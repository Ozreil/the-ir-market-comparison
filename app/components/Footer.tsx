import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#121212] px-5 py-14 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-white/12 pt-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          {/* <Link href="/" className="block w-fit" aria-label="Their Markets home">
            <Image
              src="/logo.png"
              alt="Their Markets. Discover. Choose. Elevate."
              width={1536}
              height={1024}
              className="h-auto w-72 border border-white/10 object-contain"
            />
          </Link> */}
          <p className="mt-5 max-w-md text-sm leading-7 text-white/58">
            Editorial affiliate curation for people who prefer the best
            version of fewer things.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Legacy
          </h2>
          <div className="mt-5 grid gap-3 text-sm text-white/64">
            <Link href="/category" className="transition hover:text-white">
              Collections
            </Link>
            <Link href="/#selected" className="transition hover:text-white">
              Curated Excellence
            </Link>
            <Link href="/#registry" className="transition hover:text-white">
              Join the Registry
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
            Legal
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/64">
            Their Market Luxury may earn a commission from qualifying purchases
            made through affiliate partner links. Prices and availability may
            change after publication.
          </p>
        </div>
      </div>
    </footer>
  );
}
