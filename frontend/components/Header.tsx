"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import createAPI from "@/lib/api";

export default function Header() {
  const API = createAPI();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllMenu, setShowAllMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (
        (allMenuRef.current && !allMenuRef.current.contains(e.target as Node)) &&
        (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node))
      ) {
        setShowAllMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch suggestions as user types (debounced)
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        API.get(`/products?q=${searchQuery}&limit=6`).then((res: any) => {
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        }).catch(() => setSuggestions([]));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const fetchCartCount = useCallback(() => {
    if (isAuthenticated) {
      API.get("/cart").then((res: any) => {
        if (res.data && res.data.items) {
          const count = res.data.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      }).catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [fetchCartCount]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const cat = searchCategory === "All" ? "" : searchCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (cat) params.append("category", cat);
    
    setShowSuggestions(false);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="mm-header">
      {/* Main Header Row */}
      <div className="mm-header-main">
        <div className="mm-header-left" ref={mobileMenuRef} style={{ position: "relative" }}>
          <button 
            className="mm-menu-toggle mobile-only" 
            aria-label="Menu"
            onClick={() => setShowAllMenu(v => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Logo */}
          <Link href="/" className="mm-logo" onClick={() => setShowAllMenu(false)}>
            <span className="mm-logo-text">
              Nex<span className="mm-logo-accent">cart</span>
            </span>
          </Link>
          
          {/* Mobile All Menu */}
          {showAllMenu && (
            <div className="mm-all-menu mobile-only" style={{ top: "100%", left: "-14px", flexDirection: "column", alignItems: "stretch" }}>
              <div className="mm-all-menu-header">Shop by Category</div>
              {[
                { label: "Electronics", href: "/search?category=electronics" },
                { label: "Fashion", href: "/search?category=fashion" },
                { label: "Home & Kitchen", href: "/search?category=home-kitchen" },
                { label: "Books", href: "/search?category=books" },
                { label: "Sports", href: "/search?category=sports" },
                { label: "Beauty", href: "/search?category=beauty" },
                { label: "Toys & Games", href: "/search?category=toys-games" },
                { label: "All Products", href: "/search" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="mm-all-menu-item"
                  onClick={() => setShowAllMenu(false)}
                  prefetch={false}
                >
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Deliver To */}
        <div className="mm-deliver-to desktop-only">
          <span className="mm-deliver-label">Deliver to</span>
          <span className="mm-deliver-location">
            📍 India
          </span>
        </div>

        {/* Search Bar Container */}
        <div className="mm-search-container" ref={searchRef}>
          <form className="mm-search" onSubmit={handleSearch}>
            <select 
              className="mm-search-category desktop-only" 
              id="search-category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option>All</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home & Kitchen</option>
              <option>Books</option>
              <option>Sports</option>
              <option>Beauty</option>
              <option>Toys & Games</option>
            </select>
            <input
              className="mm-search-input"
              type="text"
              id="search-input"
              placeholder="Search Nexcart"
              value={searchQuery}
              autoComplete="off"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            <button className="mm-search-btn" type="submit" id="search-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1028" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mm-search-suggestions">
              {suggestions.map((product) => (
                <div 
                  key={product._id} 
                  className="mm-suggestion-item"
                  onClick={() => {
                    setSearchQuery(product.name);
                    setShowSuggestions(false);
                    router.push(`/search?q=${product.name}`);
                  }}
                >
                  <div className="mm-suggestion-img">
                    <img src={product.images[0]} alt={product.name} />
                  </div>
                  <div className="mm-suggestion-info">
                    <div className="mm-suggestion-name">{product.name}</div>
                    <div className="mm-suggestion-cat">{product.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div className="mm-header-nav">
          {/* Account */}
          <div className="mm-dropdown" ref={dropdownRef}>
            <div
              className="mm-nav-item"
              id="account-nav"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="mm-nav-label desktop-only">
                Hello, {isAuthenticated ? user?.name?.split(" ")[0] : "Sign in"}
              </span>
              <div className="mm-mobile-account-row mobile-only">
                <span className="mm-nav-label">{isAuthenticated ? user?.name?.split(" ")[0] : "Sign in"} ›</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="mm-nav-value desktop-only">Account & Lists ▾</span>
            </div>

            {showDropdown && (
              <div className="mm-dropdown-menu">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
                      Sign In
                    </Link>
                    <div className="mm-dropdown-divider" />
                    <Link href="/register" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
                      Create Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/account" className="mm-dropdown-item" onClick={() => setShowDropdown(false)} prefetch={false}>
                      Your Account
                    </Link>
                    <Link href="/orders" className="mm-dropdown-item" onClick={() => setShowDropdown(false)} prefetch={false}>
                      Your Orders
                    </Link>
                    {user?.role === "vendor" && (
                      <Link href="/vendor/dashboard" className="mm-dropdown-item" onClick={() => setShowDropdown(false)} prefetch={false}>
                        Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link href="/admin" className="mm-dropdown-item" onClick={() => setShowDropdown(false)} prefetch={false}>
                        Admin Panel
                      </Link>
                    )}
                    <div className="mm-dropdown-divider" />
                    <button
                      className="mm-dropdown-item"
                      onClick={async () => {
                        await logout();
                        setShowDropdown(false);
                        router.push("/");
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <Link href="/orders" className="mm-nav-item desktop-only" id="orders-nav" prefetch={false}>
            <span className="mm-nav-label">Returns</span>
            <span className="mm-nav-value">& Orders</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="mm-cart-btn" id="cart-nav" prefetch={false}>
            <span className="mm-cart-count">{cartCount}</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="mm-cart-text desktop-only">Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub-header / Category Navigation */}
      <nav className="mm-subheader">
        <span className="mm-subheader-item mobile-only" style={{ fontWeight: 700 }}>Shop By Category</span>
        <div className="mm-all-menu-wrapper desktop-only" ref={allMenuRef}>
          <button
            className={`mm-subheader-item mm-all-btn${showAllMenu ? " active" : ""}`}
            onClick={() => setShowAllMenu(v => !v)}
            aria-expanded={showAllMenu}
            aria-label="All categories menu"
          >
            ☰ All
          </button>
          {showAllMenu && (
            <div className="mm-all-menu">
              <div className="mm-all-menu-header">Shop by Category</div>
              {[
                { label: "Electronics", href: "/search?category=electronics" },
                { label: "Fashion", href: "/search?category=fashion" },
                { label: "Home & Kitchen", href: "/search?category=home-kitchen" },
                { label: "Books", href: "/search?category=books" },
                { label: "Sports", href: "/search?category=sports" },
                { label: "Beauty", href: "/search?category=beauty" },
                { label: "Toys & Games", href: "/search?category=toys-games" },
                { label: "All Products", href: "/search" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="mm-all-menu-item"
                  onClick={() => setShowAllMenu(false)}
                  prefetch={false}
                >
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link href="/" className="mm-subheader-item" prefetch={false}>Home</Link>
        <Link href="/search?category=electronics" className="mm-subheader-item" prefetch={false}>Electronics</Link>
        <Link href="/search?category=fashion" className="mm-subheader-item" prefetch={false}>Fashion</Link>
        <Link href="/search?category=home-kitchen" className="mm-subheader-item desktop-only" prefetch={false}>Home & Kitchen</Link>
        <Link href="/search?category=books" className="mm-subheader-item desktop-only" prefetch={false}>Books</Link>
        <Link href="/vendor/dashboard" className="mm-subheader-item" prefetch={false}>Sell</Link>
        <span className="mm-subheader-item" style={{ color: "#FBBF24" }}>Today&apos;s Deals</span>
      </nav>

      {/* Location Row (Mobile Only) */}
      <div className="mm-location-row mobile-only">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>Delivering to India - Update location</span>
      </div>
    </header>
  );
}
