import { Footer } from "./components/Footer";
import { JsonLd } from "./components/JsonLd";
import { TopNavBar } from "./components/TopNavBar";
import { FeaturedCollections } from "./components/home/FeaturedCollections";
import { HomeHero } from "./components/home/HomeHero";
import { getAllCategories } from "./lib/api-client";
import { homePageJsonLd } from "./lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getAllCategories().catch(() => []);

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#121212]">
      <JsonLd data={homePageJsonLd()} />
      <TopNavBar variant="dark" />
      <HomeHero />
      <FeaturedCollections categories={categories} />
      <Footer />
    </main>
  );
}
