import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  History,
  Loader2,
  Calendar,
  Clock,
  TestTube,
  CheckCircle2,
  Clock3,
  Inbox,
  ArrowLeft,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getUserOrders, type Order } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  Received: { bg: "bg-blue-100 text-blue-800", text: "text-blue-800", icon: Inbox },
  Pending: { bg: "bg-yellow-100 text-yellow-800", text: "text-yellow-800", icon: Clock3 },
  Completed: { bg: "bg-green-100 text-green-800", text: "text-green-800", icon: CheckCircle2 },
};

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserOrders = async () => {
      // Use mobile number for filtering orders
      let mobile: string | null = null;

      if (isAuthenticated) {
        // User is logged in - use mobile or email
        mobile = user?.mobile || user?.email || null;
      } else {
        // User not logged in - get from URL params or localStorage
        mobile = searchParams.get('mobile') || localStorage.getItem('lastOrderMobile');
      }

      // Update URL to include mobile if we have it but it's not in the URL
      if (mobile && !searchParams.get('mobile')) {
        navigate(`/history?mobile=${encodeURIComponent(mobile)}`, { replace: true });
      }

      if (!mobile) {
        setError("Please log in or provide your mobile number to view your order history.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        console.log('📋 [HISTORY] Fetching orders for mobile:', mobile);
        console.log('📋 [HISTORY] User is authenticated:', isAuthenticated);
        console.log('📋 [HISTORY] Logged-in user mobile:', user?.mobile);
        const data = await getUserOrders(mobile); // Now accepts mobile
        console.log('📋 [HISTORY] Received orders:', data.length);
        setOrders(data);
        if (data.length === 0) {
          setError("You haven't placed any orders yet.");
        }
      } catch (err) {
        console.error('❌ [HISTORY] Error fetching orders:', err);
        setError("Failed to load your order history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user, isAuthenticated, searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 py-12 px-4">
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Order History</h1>
                <p className="text-muted-foreground">View your previous test bookings</p>
              </div>
            </div>
          </div>

          {error ? (
            <Card className="p-6 border border-primary/20 bg-card">
              <div className="text-center">
                <p className="text-muted-foreground">{error}</p>
                {!user?.mobile && (
                  <Link to="/health-card/auth">
                    <Button className="mt-4">Log In</Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="p-6 border border-primary/20 bg-card">
              <div className="text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                <Link to="/services/labs">
                  <Button className="mt-4">Browse Labs</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {orders.map((order) => {
                const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.Received;
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order._id} className="p-3 border border-primary/20">
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <StatusIcon className={`h-3 w-3 ${statusInfo.text}`} />
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${statusInfo.bg}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            #{order._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(order.totals?.final ?? 0)}
                          </p>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="flex flex-col gap-1 pt-2 border-t text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{order.preferredDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{order.preferredTime}</span>
                        </div>
                      </div>

                      {/* Tests */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-1 mb-1">
                          <TestTube className="h-3 w-3 text-primary" />
                          <p className="text-xs font-semibold text-foreground">Tests ({order.items.length})</p>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={`${order._id}-${item.testId}-${idx}`}
                              className="flex flex-col p-1.5 rounded bg-muted/30"
                            >
                              <p className="font-medium text-foreground text-xs line-clamp-1">{item.testName}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-muted-foreground">{item.labName}</span>
                                <span className="text-xs text-muted-foreground">×</span>
                                <span className="text-xs text-muted-foreground">{item.quantity}</span>
                              </div>
                              <div className="flex items-center justify-end mt-0.5">
                                <p className="text-xs font-semibold text-foreground">
                                  {formatCurrency(item.discountedPrice * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Customer</p>
                        <div className="space-y-0.5 text-xs">
                          <p className="font-medium text-foreground truncate">{order.customer.name}</p>
                          <p className="text-muted-foreground truncate">{order.customer.city}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


