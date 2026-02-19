import { SiteHeader } from "@/components/sections/site-header";
import { Footer } from "@/components/sections/footer";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, DollarSign, Trash2, ArrowLeft, CheckCircle, Minus, Plus, CalendarDays, Building2, ReceiptText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createOrder } from "@/lib/api";

const getLabDiscount = (labId: string) => (labId === "chughtai-lab" ? 20 : 40);

const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export default function CartPage() {
  const { items, removeFromCart, removePackage, updateQuantity, clearCart, getTotalPrice, getOriginalTotal, getItemCount } = useCart();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const initialFormState = {
    name: "",
    email: "",
    mobile: "",
    age: "",
    city: "",
    date: "",
    time: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // If user is logged in, auto-fill name and mobile from user account
  useEffect(() => {
    if (isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || prev.name,
        mobile: user?.mobile || prev.mobile,
      }));
    }
  }, [isAuthenticated, user]);

  // Convert phone number from 030 format to +92 format
  const convertPhoneNumber = (phone: string): string => {
    // If it looks like an email or doesn't have digits, return as is
    if (phone.includes('@') || !/[0-9]/.test(phone)) {
      return phone;
    }

    let cleaned = phone.replace(/\s|-|\(|\)/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '+92' + cleaned.substring(1);
    } else if (cleaned.startsWith('92') && cleaned.length >= 10) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+') && cleaned.length >= 7) {
      cleaned = '+92' + cleaned;
    }

    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const converted = convertPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: converted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.age.trim() ||
      !formData.city.trim()
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast("Please enter a valid email address", "error");
        return;
      }
    }

    if (formData.mobile.length < 10) {
      showToast("Please enter a valid mobile number", "error");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        testId: item.id,
        testName: item.name,
        labId: item.labId,
        labName: item.labName,
        quantity: item.quantity,
        price: item.price || 0,
        discountedPrice:
          item.discounted_price && item.discounted_price > 0 && item.discounted_price < (item.price || 0)
            ? item.discounted_price
            : item.price || 0,
        pinned: item.pinned ?? false,
      }));

      const convertedMobile = convertPhoneNumber(formData.mobile);

      // If user is logged in, we can still pass user.email if available (it isn't), but it's optional
      const orderEmail = formData.email || "";

      // Store last used mobile separately
      localStorage.setItem('lastOrderMobile', convertedMobile);

      const payload = {
        customer: {
          name: formData.name,
          email: orderEmail,
          mobile: convertedMobile,
          age: formData.age,
          city: formData.city,
        },
        preferredDate: formData.date || undefined,
        preferredTime: formData.time || undefined,
        items: orderItems,
        totals: {
          original: originalTotal,
          final: finalTotal,
          planCoverage: totalCoverage,
        },
      };

      const orderResponse = await createOrder(payload);

      clearCart();
      setOrderPlaced(true);
      setFormData(initialFormState);

      // Navigate to history page using mobile number
      navigate(`/history?mobile=${encodeURIComponent(convertedMobile)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-4">
              Thank you for your order! A confirmation email has been sent to your email address.
            </p>
            <p className="text-muted-foreground mb-8">
              We will contact you shortly to confirm your booking.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button className="bg-primary text-primary-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="max-w-md w-full mx-auto px-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-foreground">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some tests to your cart to get started.
            </p>
            <Link to="/">
              <Button className="bg-primary text-primary-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Tests
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group items by package
  const packageGroups: Record<string, typeof items> = {};
  const regularItems: typeof items = [];

  items.forEach(item => {
    if (item.packageId) {
      if (!packageGroups[item.packageId]) {
        packageGroups[item.packageId] = [];
      }
      packageGroups[item.packageId].push(item);
    } else {
      regularItems.push(item);
    }
  });

  // Calculate totals using package prices for packages, individual prices for regular items
  const packageTotals = Object.values(packageGroups).map(packageItems => {
    const firstItem = packageItems[0];
    return {
      original: firstItem.packageOriginalPrice ?? packageItems.reduce((sum, item) => sum + (item.price || 0), 0),
      final: firstItem.packagePrice ?? packageItems.reduce((sum, item) => sum + (item.discounted_price || item.price || 0), 0)
    };
  });

  const regularTotals = regularItems.reduce((acc, item) => {
    const price = item.price || 0;
    const discountedPrice = (item.discounted_price && item.discounted_price > 0 && item.discounted_price < price)
      ? item.discounted_price
      : price;
    return {
      original: acc.original + (price * item.quantity),
      final: acc.final + (discountedPrice * item.quantity)
    };
  }, { original: 0, final: 0 });

  const originalTotal = packageTotals.reduce((sum, p) => sum + p.original, 0) + regularTotals.original;
  const finalTotal = packageTotals.reduce((sum, p) => sum + p.final, 0) + regularTotals.final;
  const totalCoverage = Math.max(0, originalTotal - finalTotal);

  // Create display items: packages as single items + regular items
  const displayItems: Array<{ type: 'package' | 'item', packageId?: string, packageName?: string, items?: typeof items, item?: typeof items[0] }> = [];

  Object.entries(packageGroups).forEach(([packageId, packageItems]) => {
    displayItems.push({
      type: 'package',
      packageId,
      packageName: packageItems[0].packageName,
      items: packageItems
    });
  });

  regularItems.forEach(item => {
    displayItems.push({
      type: 'item',
      item
    });
  });

  // Filter out package items from coverage breakdown - packages don't show individual test details
  const coverageBreakdown = items
    .filter((item) => !item.packageId) // Exclude package items
    .map((item) => {
      const originalUnitPrice = item.price || 0;
      const discountedUnitPrice =
        item.discounted_price && item.discounted_price > 0 && item.discounted_price < (item.price || 0)
          ? item.discounted_price
          : item.price || 0;
      const originalPrice = originalUnitPrice * item.quantity;
      const discountedPrice = discountedUnitPrice * item.quantity;
      const coverageAmount = Math.max(0, originalPrice - discountedPrice);
      return {
        ...item,
        originalPrice,
        discountedPrice,
        coverageAmount,
      };
    });

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {displayItems.map((displayItem, idx) => {
                  // Render package - show only package name and price (no details)
                  if (displayItem.type === 'package' && displayItem.items && displayItem.items.length > 0) {
                    // Use the stored package price (exact from package definition) instead of recalculating
                    const firstItem = displayItem.items[0];
                    const packageTotal = firstItem.packagePrice ?? displayItem.items.reduce((sum, item) => sum + (item.discounted_price || item.price || 0), 0);
                    const packageOriginalTotal = firstItem.packageOriginalPrice ?? displayItem.items.reduce((sum, item) => sum + (item.price || 0), 0);

                    return (
                      <Card key={displayItem.packageId} className="p-3 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              PACKAGE
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground line-clamp-2">{displayItem.packageName}</h3>
                          <div className="flex flex-col gap-1 mt-2 border-t pt-2">
                            {packageOriginalTotal > packageTotal && (
                              <div className="text-center">
                                <span className="text-muted-foreground line-through text-xs block">
                                  {formatCurrency(packageOriginalTotal)}
                                </span>
                              </div>
                            )}
                            <div className="text-center">
                              <p className="text-lg font-bold text-primary">
                                {formatCurrency(packageTotal)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePackage(displayItem.packageId!)}
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    );
                  }

                  // Render regular item
                  const item = displayItem.item!;
                  const labDiscount = getLabDiscount(item.labId);
                  const hasDiscount =
                    item.price != null &&
                    item.discounted_price != null &&
                    item.discounted_price > 0 &&
                    item.discounted_price < item.price;
                  const finalPrice = hasDiscount ? item.discounted_price || 0 : item.price || 0;
                  return (
                    <Card key={item.cartItemId} className="p-3 border-2 border-primary/20">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {item.labName}
                              </p>
                              {hasDiscount && (
                                <span className="text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  {labDiscount}% OFF
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground line-clamp-2">{item.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="border border-border rounded-full h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="border border-border rounded-full h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                          {hasDiscount ? (
                            <div className="text-center">
                              <span className="text-muted-foreground line-through text-xs block">
                                {formatCurrency(item.price || 0)}
                              </span>
                              <span className="font-semibold text-primary text-sm block">
                                {formatCurrency(finalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-foreground text-sm text-center block">
                              {formatCurrency(finalPrice)}
                            </span>
                          )}
                          <div className="text-center border-t pt-2">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(finalPrice * item.quantity)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Order Summary & Transaction */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 border-2 border-primary/20">
                <h2 className="text-xl font-bold mb-3 text-foreground">Transaction Details</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Provider</p>
                      <p className="font-semibold text-foreground">ZUNF Medicare Labs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground flex items-center gap-1 justify-end">
                        <CalendarDays className="h-4 w-4" /> Today
                      </p>
                      <p className="font-semibold text-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Only show detailed breakdown if there are regular items */}
                  {regularItems.length > 0 ? (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Estimated Coverage & Cost</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-semibold text-foreground">{formatCurrency(originalTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your Plan Covers</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(totalCoverage)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base border-t border-primary/10 pt-2">
                        <span className="font-semibold text-foreground">You Pay</span>
                        <span className="font-bold text-primary text-lg">{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>
                  ) : (
                    /* For packages only, show simple package price */
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Package Price</p>
                      <div className="flex justify-between text-base border-t border-primary/10 pt-2">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-bold text-primary text-lg">{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>
                  )}

                  {coverageBreakdown.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Coverage Breakdown
                      </p>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {coverageBreakdown.map((item) => (
                          <div
                            key={item.cartItemId}
                            className="border border-border rounded-lg p-2 text-sm bg-card/80"
                          >
                            <div className="flex justify-between flex-wrap gap-1">
                              <span className="font-semibold text-foreground">{item.name}</span>
                              <span className="text-muted-foreground">
                                {getLabDiscount(item.labId)}% OFF
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{item.labName}</p>
                            <div className="flex justify-between text-xs">
                              <span>Plan Covers</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(item.coverageAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>You Pay</span>
                              <span className="font-semibold text-primary">
                                {formatCurrency(item.discountedPrice)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-primary" />
                      Scanned Receipt
                    </p>
                    <div className="border border-dashed border-primary/30 rounded-xl p-3 text-center text-sm text-muted-foreground">
                      Upload receipt after sample pickup (coming soon)
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 border-primary/20 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-foreground">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {/* Only show breakdown if there are regular items (not just packages) */}
                  {regularItems.length > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({getItemCount()} items)</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(originalTotal)}
                        </span>
                      </div>
                      {totalCoverage > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Plan Covers</span>
                          <span className="font-semibold text-green-600">
                            - {formatCurrency(totalCoverage)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* For packages only, show simple total */}
                  {regularItems.length === 0 && Object.keys(packageGroups).length > 0 && (
                    <div className="text-center py-2">
                      {Object.values(packageGroups).map((packageItems, idx) => {
                        const firstItem = packageItems[0];
                        const packageTotal = firstItem.packagePrice ?? packageItems.reduce((sum, item) => sum + (item.discounted_price || item.price || 0), 0);
                        return (
                          <div key={idx} className="mb-2">
                            <p className="text-xs text-muted-foreground">{firstItem.packageName}</p>
                            <p className="text-lg font-bold text-primary">{formatCurrency(packageTotal)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com (optional)"
                      className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobile" className="text-foreground">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="03001234567 or +923001234567"
                      className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-foreground">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        min="0"
                        required
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Enter age"
                        className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-foreground">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-foreground">
                        Preferred Date (Optional)
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-foreground">
                        Preferred Time (Optional)
                      </Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="mt-1 bg-white/50 backdrop-blur-md border-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity mt-6"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <DollarSign className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


