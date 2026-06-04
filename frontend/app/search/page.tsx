import SearchPageClient from "@/components/SearchPageClient";

export const metadata = {
  title: "Search Results | Nexcart",
  description: "Browse products on Nexcart.",
};

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, category?: string }> 
}) {
  const { q: query = "", category = "" } = await searchParams;
  return <SearchPageClient query={query} category={category} />;
}

