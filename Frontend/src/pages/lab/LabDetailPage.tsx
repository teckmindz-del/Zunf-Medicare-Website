import { labs } from "@/data/labs";
import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { ArrowLeft, DollarSign, TestTube, Loader2, AlertCircle, Search, ShoppingCart, Pin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getLabTests, type LabTest, type LabTestsResponse } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
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

export default function LabDetailPage() {
  const { labId } = useParams<{ labId: string }>();
  const [labData, setLabData] = useState<LabTestsResponse | null>(null);
  const [pinnedTests, setPinnedTests] = useState<LabTest[]>([]);
  const [regularTests, setRegularTests] = useState<LabTest[]>([]);
  const [filteredPinnedTests, setFilteredPinnedTests] = useState<LabTest[]>([]);
  const [filteredRegularTests, setFilteredRegularTests] = useState<LabTest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const lab = labs.find((l) => l.id === labId);
  const isChughtai = labId === 'chughtai-lab';
  const discountPercent = isChughtai ? 20 : 40;

  useEffect(() => {
    const fetchTests = async () => {
      if (!labId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getLabTests(labId);
        if (response === null) {
          setError("Lab data not available");
        } else {
          setLabData(response);
          const pinned = response.tests.filter(test => test.pinned === true);
          const regular = response.tests.filter(test => !test.pinned);
          setPinnedTests(pinned);
          setRegularTests(regular);
          setFilteredPinnedTests(pinned);
          setFilteredRegularTests(regular);
        }
      } catch (err) {
        setError("Failed to load lab tests");
        console.error("Error fetching lab tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [labId]);

  useEffect(() => {
    if (!labData) return;

    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      setFilteredPinnedTests(pinnedTests);
      setFilteredRegularTests(regularTests);
      return;
    }

    const filterTest = (test: LabTest) =>
      test.name.toLowerCase().includes(query) ||
      test.description?.toLowerCase().includes(query);

    setFilteredPinnedTests(pinnedTests.filter(filterTest));
    setFilteredRegularTests(regularTests.filter(filterTest));
  }, [searchQuery, pinnedTests, regularTests, labData]);

  const handleAddToCart = (test: LabTest) => {
    if (lab && labId) {
      addToCart(test, labId, lab.name);
    }
  };

  if (!lab) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lab not found</h1>
            <Link to="/" className="text-primary hover:underline">
              Go back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SEO
        title={`${lab.name} Tests`}
        description={`Browse and book diagnostic tests from ${lab.name} through Zunf Medicare.`}
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Header Section */}
        <section className="relative w-full bg-gradient-to-br from-primary/10 via-secondary to-accent/10 pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            {/* Lab logo at top-right edge */}
            {getLabLogo(labId!) && (
              <div className="absolute top-0 right-4 sm:right-6 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none" style={{ maxHeight: '100%', maxWidth: '100%' }}>
                <img
                  src={getLabLogo(labId!)!}
                  alt={lab.name}
                  width={384}
                  height={384}
                  className="object-contain w-full h-full"
                />
              </div>
            )}

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 relative z-10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-4 mb-6 relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg overflow-hidden flex-shrink-0">
                {getLabLogo(labId!) ? (
                  <img
                    src={getLabLogo(labId!)!}
                    alt={lab.name}
                    width={64}
                    height={64}
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    <TestTube className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <h1 className="text-4xl font-bold tracking-tight mb-2 relative z-10">{lab.name}</h1>
                {!loading && labData && (
                  <p className="text-muted-foreground">
                    {labData.tests.length} {labData.tests.length === 1 ? "test" : "tests"} available
                    {pinnedTests.length > 0 && (
                      <span className="ml-2 text-primary">
                        • {pinnedTests.length} pinned {pinnedTests.length === 1 ? "test" : "tests"}
                      </span>
                    )}
                  </p>
                )}
                {loading && (
                  <p className="text-muted-foreground">Loading...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tests Section */}
        <section className="py-12 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading tests...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Data Not Available</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {lab.name} test data is not currently available in our system. Please check back later or contact us for more information.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            )}

            {!loading && !error && labData && labData.tests.length > 0 && (
              <div className="mb-12">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tests by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                    />
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {(filteredPinnedTests.length + filteredRegularTests.length)} {(filteredPinnedTests.length + filteredRegularTests.length) === 1 ? "test" : "tests"} found
                    </p>
                  )}
                </div>

                {/* Pinned Tests Section */}
                {filteredPinnedTests.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                      <Pin className="h-5 w-5 text-primary" />
                      Popular Tests ({filteredPinnedTests.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredPinnedTests.map((test) => (
                        <Card
                          key={test.id}
                          className="p-6 border-2 border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-lg transition-all duration-300 group relative"
                        >
                          <div className="absolute top-2 right-2">
                            <Pin className="h-4 w-4 text-primary fill-primary" />
                          </div>
                          <div className="flex flex-col gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors pr-6">
                                <Link to={`/lab/${labId}/test/${test.id}`} className="hover:underline focus:outline-none">
                                  {test.name}
                                </Link>
                              </h3>
                              {test.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex flex-col gap-1">
                                {test.price != null && test.discounted_price != null &&
                                  test.discounted_price > 0 && test.discounted_price < test.price ? (
                                  <>
                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground line-through">
                                        Rs. {(test.price || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-primary text-lg">
                                        Rs. {(test.discounted_price || 0).toLocaleString()}
                                      </span>
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {discountPercent}% OFF
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-foreground">
                                      Rs. {(test.price || 0).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAddToCart(test)}
                              className="mt-2 w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium transition-all duration-300 border border-primary/20 hover:border-primary"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Tests Section */}
                {filteredRegularTests.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      All Tests ({filteredRegularTests.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {filteredRegularTests.map((test) => (
                        <Card
                          key={test.id}
                          className="p-6 border-2 border-primary/20 hover:border-primary/40 bg-card hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex flex-col gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                <Link to={`/lab/${labId}/test/${test.id}`} className="hover:underline focus:outline-none">
                                  {test.name}
                                </Link>
                              </h3>
                              {test.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{test.description}</p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex flex-col gap-1">
                                {test.price != null && test.discounted_price != null &&
                                  test.discounted_price > 0 && test.discounted_price < test.price ? (
                                  <>
                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-muted-foreground line-through">
                                        Rs. {(test.price || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-primary" />
                                      <span className="font-semibold text-primary text-lg">
                                        Rs. {(test.discounted_price || 0).toLocaleString()}
                                      </span>
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {discountPercent}% OFF
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-foreground">
                                      Rs. {(test.price || 0).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleAddToCart(test)}
                              className="mt-2 w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium transition-all duration-300 border border-primary/20 hover:border-primary"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {filteredPinnedTests.length === 0 && filteredRegularTests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No tests found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && labData && labData.tests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests available for this lab.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


