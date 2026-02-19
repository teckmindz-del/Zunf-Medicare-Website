import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    History,
    Loader2,
    Calendar,
    Clock,
    TestTube,
    User,
    LogOut,
    Download,
    Save,
    Phone,
    Mail
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getUserOrders, type Order } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) =>
    `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function AccountPage() {
    const { user, isAuthenticated, logout, updateProfile } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("history");

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        mobile: ""
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Initialize profile form when user loads
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || ""
            });
        }
    }, [user]);

    // Persist guest email from URL to localStorage
    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            console.log("Persisting guest email from URL:", emailParam);
            localStorage.setItem('lastOrderEmail', emailParam);
        }
    }, [searchParams]);

    // Fetch orders logic
    useEffect(() => {
        const fetchUserOrders = async () => {
            let identifier: string | null = null;

            if (isAuthenticated) {
                // Use mobile first (current auth system), fall back to email
                identifier = user?.mobile || user?.email || null;
            } else {
                identifier = searchParams.get('mobile') || searchParams.get('email')
                    || localStorage.getItem('lastOrderMobile') || localStorage.getItem('lastOrderEmail');
            }

            if (!identifier) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            try {
                const data = await getUserOrders(identifier).catch(() => []);
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError("Failed to load history.");
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "history") {
            fetchUserOrders();
        }
    }, [user, isAuthenticated, searchParams, activeTab]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateProfile({
                name: profileForm.name,
                email: profileForm.email,
                mobile: profileForm.mobile
            });
            showToast("Profile Updated", "success");
        } catch (error) {
            showToast("Update Failed", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownloadHistory = () => {
        const headers = ["Order ID", "Date", "Items", "Total Amount", "Status"];
        const rows = orders.map(order => [
            order._id,
            order.preferredDate,
            order.items.map(i => `${i.testName} (${i.quantity})`).join("; "),
            order.totals?.final || 0,
            order.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `order_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <SiteHeader />
            <main className="flex-1 py-12 px-4 bg-slate-50/50">
                <div className="mx-auto w-full max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 space-y-4">
                            <Card className="p-4 border-none shadow-sm bg-white sticky top-24">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold truncate">{user?.name || "Guest User"}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
                                    </div>
                                </div>

                                <nav className="space-y-1">
                                    <button
                                        onClick={() => setActiveTab("history")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                            activeTab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-slate-100"
                                        )}
                                    >
                                        <History className="h-4 w-4" />
                                        Order History
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("profile")}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                            activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-slate-100"
                                        )}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile Settings
                                    </button>
                                    <div className="pt-4 mt-4 border-t">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </nav>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {activeTab === "history" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold tracking-tight">Order History</h2>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleDownloadHistory} disabled={orders.length === 0}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download CSV
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                                                <Clock className="mr-2 h-4 w-4" />
                                                Refresh
                                            </Button>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        </div>
                                    ) : (orders.length === 0) ? (
                                        <Card className="p-8 text-center border-dashed">
                                            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                                <History className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-medium mb-2">No orders found</h3>
                                            <p className="text-muted-foreground mb-6">You haven't placed any orders yet or your session has expired.</p>
                                            <Link to="/services/labs">
                                                <Button>Book a Test</Button>
                                            </Link>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => {
                                                return (
                                                    <Card key={order._id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="p-6">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-semibold text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                                                                        <Badge
                                                                            variant={order.status === 'Completed' ? 'success' : 'warning'}
                                                                            className="capitalize"
                                                                        >
                                                                            {order.status || 'Pending'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {order.preferredDate}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            {order.preferredTime}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                                                    <p className="text-2xl font-bold text-primary">{formatCurrency(order.totals?.final ?? 0)}</p>
                                                                </div>
                                                            </div>

                                                            <div className="border-t pt-4">
                                                                <div className="space-y-3">
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                                                                                    <TestTube className="h-4 w-4 text-slate-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium">{item.testName}</p>
                                                                                    <p className="text-xs text-muted-foreground">{item.labName} × {item.quantity}</p>
                                                                                </div>
                                                                            </div>
                                                                            <p className="font-medium">{formatCurrency(item.discountedPrice * item.quantity)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
                                    <Card className="p-6">
                                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="name"
                                                            placeholder="Enter your name"
                                                            className="pl-9"
                                                            value={profileForm.name}
                                                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            className="pl-9"
                                                            value={profileForm.email}
                                                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile">Phone Number</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="mobile"
                                                            placeholder="Enter phone number"
                                                            className="pl-9"
                                                            value={profileForm.mobile}
                                                            onChange={(e) => setProfileForm(prev => ({ ...prev, mobile: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 border-t">
                                                <Button type="submit" disabled={isUpdating}>
                                                    {isUpdating ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
