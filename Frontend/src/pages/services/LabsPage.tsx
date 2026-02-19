import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, ArrowRight, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getLabs, type Lab } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { searchLabsAndTests, type SearchResult } from "@/lib/search";
import { SEO } from "@/components/seo";

// Map lab IDs to their logo files
const getLabLogo = (labId: string): string | null => {
  const logoMap: Record<string, string> = {
    "chughtai-lab": "/chughtai.jpeg",
    "dr-essa-lab": "/drEssa.jpeg",
    "test-zone": "/testzone.jpeg",
    "biotech-lahore": "/biotech.jpeg",
    "ayzal-lab": "/ayzal.jpeg",
    "jinnah-mri": "/jinnahMRI.jpeg",
    "esthetique-canon": "/esthetic.jpeg",
  };
  return logoMap[labId] || null;
};

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchMode, setSearchMode] = useState<"labs" | "all">("labs");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await getLabs();
        setLabs(data);
        setFilteredLabs(data);
      } catch (error) {
        console.error("Error fetching labs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLabs(labs);
      setSearchResults([]);
      setShowResults(false);
      setSearchMode("labs");
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Search both labs and tests
        const results = await searchLabsAndTests(searchQuery);
        setSearchResults(results);
        setShowResults(true);

        // Also filter labs for the grid view
        const query = searchQuery.toLowerCase().trim();
        const filtered = labs.filter(
          (lab) =>
            lab.name.toLowerCase().includes(query) ||
            lab.description?.toLowerCase().includes(query)
        );
        setFilteredLabs(filtered);
        setSearchMode("all");
      } catch (error) {
        console.error("Search error:", error);
        // Fallback to simple lab filtering
        const query = searchQuery.toLowerCase().trim();
        const filtered = labs.filter(
          (lab) =>
            lab.name.toLowerCase().includes(query) ||
            lab.description?.toLowerCase().includes(query)
        );
        setFilteredLabs(filtered);
        setSearchMode("labs");
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, labs]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SEO
        title="Trusted Labs in Pakistan: Lab Test Discounts (2026) | Zunf Medicare"
        description="Find trusted labs in Pakistan for accurate diagnostics. ISO-certified testing, fast results & affordable prices. Book your lab test online today"
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 py-20 md:py-32">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Our Partner
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
                Laboratories
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse through our network of trusted laboratories and diagnostic centers. Select a lab to view available tests and book your appointments.
            </p>
          </div>
        </section>

        {/* Labs List Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  type="search"
                  placeholder="Search labs and tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  className="pl-10 pr-10 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
                )}

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-background/95 backdrop-blur-md border border-border/40 shadow-xl z-50">
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                        Search Results ({searchResults.length})
                      </div>
                      {searchResults.map((result, index) => (
                        <Link
                          key={`${result.type}-${result.labId}-${result.testId || index}`}
                          to={`/lab/${result.labId}`}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                          }}
                          className="block p-3 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white flex-shrink-0 overflow-hidden">
                              {result.type === 'lab' && getLabLogo(result.labId) ? (
                                <img
                                  src={getLabLogo(result.labId)!}
                                  alt={result.labName}
                                  width={32}
                                  height={32}
                                  className="object-contain p-0.5"
                                />
                              ) : result.type === 'lab' ? (
                                <TestTube className="h-4 w-4 text-primary" />
                              ) : (
                                <Search className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {result.type === 'lab' ? result.labName : result.testName}
                              </p>
                              {result.type === 'test' && (
                                <>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {result.labName}
                                  </p>
                                  {result.price && (
                                    <p className="text-xs text-primary font-medium mt-1">
                                      Rs. {result.discountedPrice && result.discountedPrice < result.price
                                        ? result.discountedPrice
                                        : result.price}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
              {searchQuery && searchMode === "labs" && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {filteredLabs.length} {filteredLabs.length === 1 ? "lab" : "labs"} found
                </p>
              )}
              {searchQuery && searchMode === "all" && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading labs...</p>
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="text-center py-20">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? "No labs found" : "No labs available"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Please check back later"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLabs.map((lab) => (
                  <Card
                    key={lab.id}
                    className="p-6 border-primary/20 hover:border-primary/40 bg-card hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Background logo with opacity on the right */}
                    {getLabLogo(lab.id) && (
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                        <img
                          src={getLabLogo(lab.id)!}
                          alt={lab.name}
                          width={128}
                          height={128}
                          className="object-contain"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg group-hover:scale-110 transition-transform overflow-hidden flex-shrink-0">
                          {getLabLogo(lab.id) ? (
                            <img
                              src={getLabLogo(lab.id)!}
                              alt={lab.name}
                              width={48}
                              height={48}
                              className="object-contain p-1"
                            />
                          ) : (
                            <TestTube className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {lab.name}
                          </h3>
                          {lab.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {lab.description}
                            </p>
                          )}
                          {lab.totalTests && (
                            <p className="text-xs text-primary mt-2 font-medium">
                              {lab.totalTests} {lab.totalTests === 1 ? "test" : "tests"} available
                            </p>
                          )}
                        </div>
                      </div>
                      <Link to={`/lab/${lab.id}`}>
                        <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium transition-all duration-300 border border-primary/20 hover:border-primary">
                          View Tests
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

