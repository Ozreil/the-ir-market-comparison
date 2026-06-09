import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative -mt-[73px] min-h-[94svh] overflow-hidden bg-[#121212] px-5 pt-28 text-white lg:px-8 lg:pt-36">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85"
          alt="Carefully arranged laptop, headphones, and everyday products on a desk"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-48"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.94),rgba(18,18,18,0.64)_45%,rgba(18,18,18,0.18)),linear-gradient(0deg,rgba(18,18,18,0.96),transparent_34%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(94svh-9rem)] max-w-7xl content-end pb-16">
        <div className="animate-rise max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">
            Discover products worth keeping
          </p>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
            Their Markets
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-light leading-9 text-white/76">
            A curated collection of practical finds from trusted affiliate
            partners, home upgrades, travel essentials, and smart everyday
            tools. No clutter. No hype. Just products worth discovering.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/category"
              className="inline-flex min-h-12 items-center justify-center bg-gold px-8 text-xs font-bold uppercase tracking-[0.22em] text-[#121212] transition hover:bg-white"
            >
              Shop the market
            </Link>
            <Link
              href="#selected"
              className="inline-flex min-h-12 items-center justify-center border border-white/26 px-8 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-gold hover:text-gold"
            >
              See top picks
            </Link>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-1 gap-5 border-t border-white/16 pt-6 text-white/70 min-[420px]:grid-cols-3">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                Source
              </dt>
              <dd className="mt-2 font-serif text-xl text-white sm:text-2xl">
                Partner companies
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                Focus
              </dt>
              <dd className="mt-2 font-serif text-xl text-white sm:text-2xl">
                Useful
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                Next
              </dt>
              <dd className="mt-2 font-serif text-xl text-white sm:text-2xl">
                More partners
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
