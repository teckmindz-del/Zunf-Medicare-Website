import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/custom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ChevronDown, Heart, GraduationCap, Briefcase, TestTube, CreditCard, History, Search, Loader2, FileText, Home, Menu, X, ArrowLeft, LogOut, Users } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect, useRef } from "react";
import { searchLabsAndTests, type SearchResult } from "@/lib/search";

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

export function SiteHeader() {
  const { getItemCount } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isDesktopClick = desktopDropdownRef.current?.contains(target);
      const isMobileClick = mobileDropdownRef.current?.contains(target);

      // Don't close if clicking inside dropdown (desktop or mobile)
      if (!isDesktopClick && !isMobileClick) {
        setIsServicesOpen(false);
      }
    };

    if (isServicesOpen) {
      // Use click event instead of mousedown to allow link clicks to register first
      document.addEventListener('click', handleClickOutside, true);

      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isServicesOpen]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }

      // Close mobile menu if clicking outside both the menu and the hamburger button
      // Check if click is on hamburger button or inside it
      const isHamburgerClick = target.closest('[data-hamburger-button]') !== null;

      if (isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !isHamburgerClick) {
        setIsMobileMenuOpen(false);
      }
    };

    if (showSearchResults || isMobileMenuOpen) {
      // Use click event with capture phase to fire after button onClick
      document.addEventListener("click", handleClickOutside, true);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [showSearchResults, isMobileMenuOpen]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchLabsAndTests(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchResultClick = () => {
    setShowSearchResults(false);
    setSearchQuery("");
  };


  return (
    <>
      <header className="sticky top-0 z-[100] h-16 bg-primary/10 backdrop-blur-md border-b border-border/40 transition-all duration-300">
        <div className="mx-auto flex h-16 w-full items-center gap-4 px-4 sm:px-6">
          {/* Back Button - Show when not on home page */}
          {!isHomePage && (
            <Link
              to="/"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-primary/30 hover:bg-white/20 transition-all flex-shrink-0"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}

          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="rounded-lg" aria-hidden>
              <img
                src="/zunf.png"
                height={20}
                width={100}
                alt="ZUNF logo"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              to="/services/labs"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <TestTube className="h-4 w-4" />
              Labs
            </Link>

            <Link
              to="/about"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Users className="h-4 w-4" />
              About Us
            </Link>

            <Link
              to="/contact"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <LogOut className="h-4 w-4 rotate-180" /> {/* Using logout icon rotated as entrance/contact substitute or just Mail */}
              Contact Us
            </Link>

            {/* Services Dropdown */}
            <div
              ref={desktopDropdownRef}
              className="relative z-[100]"
            >
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${isServicesOpen ? 'text-primary' : 'text-foreground hover:text-primary'}`}
              >
                Services
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 rounded-lg bg-background/95 backdrop-blur-md border border-border/40 shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-1">
                    <Link
                      to="/services/health-program"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors block"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesOpen(false);
                      }}
                    >
                      <Heart className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">Health Program</span>
                    </Link>
                    <Link
                      to="/services/school-health-program"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors block"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesOpen(false);
                      }}
                    >
                      <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">School Health Program</span>
                    </Link>
                    <Link
                      to="/services/corporate-health-screening"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors block"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesOpen(false);
                      }}
                    >
                      <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">Corporate Health Screening</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Cart and Book Button */}
          <div className="ml-auto hidden md:flex items-center gap-3 flex-shrink-0">
            {isAuthenticated ? (
              <Link to="/account">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <Link to="/cart">
              <Button
                size="sm"
                variant="outline"
                className="relative bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Link to="/booking">Book a service</Link>
            </Button>
          </div>

          {/* Mobile Cart, Menu and Login Buttons in Header */}
          <div className="ml-auto flex md:hidden items-center gap-2 flex-shrink-0">
            <Link to="/cart">
              <Button
                size="sm"
                variant="outline"
                className="relative h-9 w-9 p-0 bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/account">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0 bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 px-2 text-xs bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-9 px-2 text-xs bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
            <Button
              ref={hamburgerButtonRef}
              data-hamburger-button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 bg-white/10 backdrop-blur-md border-primary/30 hover:bg-white/20 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Collapsible */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-background/95 backdrop-blur-md border-b border-border/40 animate-in slide-in-from-top-2 duration-200"
        >
          {/* Mobile Search Bar - Only on home page */}
          {isHomePage && (
            <div className="border-b border-border/40 px-4 py-3">
              <div className="relative" ref={searchRef}>
                <div className="relative group flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-primary z-10" />
                    <Input
                      type="search"
                      placeholder="Search for labs, tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setShowSearchResults(true)}
                      className="pl-10 pr-10 h-10 bg-white/15 backdrop-blur-md border-2 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-white/20 transition-all duration-300 w-full text-sm shadow-lg shadow-primary/10"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 h-4 w-4 text-primary animate-spin" />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-background/95 backdrop-blur-md border border-border/40 shadow-xl z-50">
                      <div className="p-2">
                        {searchResults.map((result, index) => (
                          <Link
                            key={`${result.type}-${result.labId}-${result.testId || index}`}
                            to={result.type === 'lab' ? `/lab/${result.labId}` : `/lab/${result.labId}`}
                            onClick={handleSearchResultClick}
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
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <TestTube className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Search className="h-4 w-4" />
                                  </div>
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
                                    {(result.price || result.discountedPrice) && (
                                      <p className="text-xs text-primary font-medium mt-1">
                                        Rs. {result.discountedPrice && result.discountedPrice < (result.price || 0)
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
              </div>
            </div>
          )}

          {/* Mobile Menu Items - Shown on all pages */}
          <div className="border-b border-border/40">
            <div className="px-4 py-3 space-y-2">
              {/* Home - First */}
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                <span>My Account</span>
              </Link>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Home</span>
              </Link>

              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                <span>About Us</span>
              </Link>

              {/* Labs */}
              <Link
                to="/services/labs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <TestTube className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Labs</span>
              </Link>

              {/* Health Card - Second */}
              <Link
                to="/health-card"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Health Card</span>
              </Link>

              {/* History */}
              <Link
                to={(() => {
                  // If logged in, always use logged-in email; otherwise use localStorage
                  const email = isAuthenticated && user?.email ? user.email : localStorage.getItem('lastOrderEmail');
                  return email ? `/history?email=${encodeURIComponent(email)}` : '/history';
                })()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <History className="h-4 w-4 text-primary flex-shrink-0" />
                <span>History</span>
              </Link>

              {/* EHR */}
              <Link
                to="/ehr"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <span>EHR</span>
              </Link>

              {/* Services Dropdown */}
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsServicesOpen(!isServicesOpen);
                  }}
                  className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Services</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isServicesOpen && (
                  <div className="pl-6 mt-2 space-y-2">
                    <Link
                      to="/services/health-program"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Heart className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>Health Program</span>
                    </Link>
                    <Link
                      to="/services/school-health-program"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <GraduationCap className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>School Health Program</span>
                    </Link>
                    <Link
                      to="/services/corporate-health-screening"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Briefcase className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>Corporate Health Screening</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
