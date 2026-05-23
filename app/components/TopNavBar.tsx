import Image from "next/image";

export async function TopNavBar({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        isDark
          ? "border-white/10 bg-[#121212]/82 text-white"
          : "border-black/10 bg-[#f9f9f9]/86 text-[#121212]"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-8 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          <a
            href="https://theirmarkets.com"
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
          </a>
        </div>

        <span className="hidden text-xs font-bold uppercase tracking-[0.22em] text-[#8f741f] sm:inline">
          Product comparison
        </span>
      </nav>
    </header>
  );
}
