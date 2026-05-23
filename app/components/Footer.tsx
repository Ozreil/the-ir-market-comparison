export function Footer() {
  return (
    <footer className="bg-[#121212] px-5 py-14 text-white lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-white/12 pt-10 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/58">
            Editorial affiliate curation for people who prefer the best
            version of fewer things.
          </p>
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
