import Link from "next/link";
import ClientHeroBanner from "@/components/ClientHeroBanner";
import ClientCategoriesGrid from "@/components/ClientCategoriesGrid";
import ClientFeaturedProducts from "@/components/ClientFeaturedProducts";

export const metadata = {
  title: "Nexcart | Home of Premium Deals",
  description: "Shop the latest electronics, fashion, and home essentials on Nexcart.",
};

export default function Home() {
  return (
    <>
      {/* Dynamic Hero Banner loaded client-side */}
      <ClientHeroBanner />

      {/* Dynamic Category Grid loaded client-side */}
      <ClientCategoriesGrid />

      {/* Static Deals Banner (SEO-safe layout content) */}
      <div className="mm-deals-banner">
        <div>
          <div className="mm-deals-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Today&apos;s Deals
          </div>
          <div className="mm-deals-subtitle">Limited-time discounts</div>
        </div>
        <Link href="/search?q=" className="mm-hero-cta" style={{ fontSize: "14px", padding: "10px 24px" }} prefetch={false}>
          See all
        </Link>
      </div>

      {/* Dynamic Featured Products loaded client-side */}
      <ClientFeaturedProducts />
    </>
  );
}

