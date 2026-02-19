import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, ShoppingCart, Clock, CheckCircle2, ShieldCheck, Activity, AlertCircle, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLabTests, type LabTestsResponse, type LabTest } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { SEO } from "@/components/seo";
import { labs } from "@/data/labs";

// Map lab IDs to their logo files (reusing from LabDetailPage - ideal refactor: move to utils)
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

export default function TestDetailPage() {
    const { labId, testId } = useParams<{ labId: string; testId: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [labData, setLabData] = useState<LabTestsResponse | null>(null);
    const [test, setTest] = useState<LabTest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const lab = labs.find((l) => l.id === labId);
    const isChughtai = labId === 'chughtai-lab';
    const discountPercent = isChughtai ? 20 : 40;

    useEffect(() => {
        const fetchData = async () => {
            if (!labId || !testId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await getLabTests(labId);
                if (response === null) {
                    setError("Lab data not available");
                } else {
                    setLabData(response);
                    // Find test by ID (or name if ID is not unique/consistent, but strictly ID is better)
                    // Since existing API returns tests with 'id' field, we match that.
                    const foundTest = response.tests.find(t => t.id === testId);
                    if (foundTest) {
                        setTest(foundTest);
                    } else {
                        setError("Test not found");
                    }
                }
            } catch (err) {
                setError("Failed to load test details");
                console.error("Error fetching test details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [labId, testId]);

    const handleAddToCart = () => {
        if (test && lab && labId) {
            addToCart(test, labId, lab.name);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-dvh flex-col">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !lab || !test) {
        return (
            <div className="flex min-h-dvh flex-col">
                <SiteHeader />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Test Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            {error || "The requested test could not be found."}
                        </p>
                        <Button onClick={() => navigate(-1)} variant="outline">
                            Go Back
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-dvh flex-col bg-slate-50">
            <SEO
                title={`${test.name} at ${lab.name}`}
                description={`Book the ${test.name} at ${lab.name}. ${test.description || "Get accurate results with Zunf Medicare."}`}
            />
            <SiteHeader />
            <main className="flex-1 pt-24 pb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">

                    {/* Breadcrumb / Back Navigation */}
                    <div className="mb-6">
                        <Link
                            to={`/lab/${labId}`}
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to {lab.name}</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Header Card */}
                            <Card className="p-6 border-none shadow-md overflow-hidden relative bg-white">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="h-20 w-20 rounded-xl bg-gray-50 flex items-center justify-center border p-2 flex-shrink-0">
                                        {getLabLogo(labId!) ? (
                                            <img
                                                src={getLabLogo(labId!)!}
                                                alt={lab.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <Activity className="h-8 w-8 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{test.name}</h1>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                                                LAB TEST
                                            </span>
                                            <span>•</span>
                                            <span>{lab.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Description & Details */}
                            <Card className="p-6 border-none shadow-md bg-white">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Description
                                </h2>
                                <div className="prose prose-slate max-w-none text-slate-600">
                                    <p>{test.description || "No specific description available for this test."}</p>

                                    {/* Generic placeholder content to make the page look richer as per request */}
                                    <div className="mt-6 space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Why get tested?</h3>
                                            <p className="text-sm">
                                                Regular testing helps in early detection of potential health issues, monitoring existing conditions, and maintaining overall wellness.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    What is included?
                                </h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Sample Collection</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Digital Report</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>Expert Verification</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>

                        {/* Sidebar - Right Column */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Price & Action Card */}
                                <Card className="p-6 border-2 border-primary/20 shadow-lg bg-white">
                                    <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Lab Price</span>
                                            <span className="text-slate-400 line-through">
                                                Rs. {(test.price || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        {test.price != null && test.discounted_price != null &&
                                            test.discounted_price > 0 && test.discounted_price < test.price ? (
                                            <>
                                                <div className="flex justify-between items-center font-medium text-green-600">
                                                    <span>Discount ({discountPercent}%)</span>
                                                    <span>- Rs. {((test.price || 0) - (test.discounted_price || 0)).toLocaleString()}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                                    <span className="text-2xl font-bold text-primary">
                                                        Rs. {(test.discounted_price || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                                <span className="text-lg font-bold text-slate-900">Total</span>
                                                <span className="text-2xl font-bold text-primary">
                                                    Rs. {(test.price || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleAddToCart}
                                        className="w-full h-12 text-lg font-semibold shadow-primary/20 shadow-lg hover:shadow-primary/40 transition-all"
                                    >
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Reports usually available within 24-48 hours
                                    </p>
                                </Card>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-700">Verified Labs</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                                        <CheckCircle2 className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-700">Best Prices</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
