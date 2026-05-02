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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="mm-header">
      {/* Main Header Row */}
      <div className="mm-header-main">
        {/* Logo */}
        <Link href="/" className="mm-logo">
          <span className="mm-logo-text">
            Nex<span className="mm-logo-accent">cart</span>
          </span>
        </Link>

        {/* Deliver To */}
        <div className="mm-deliver-to">
          <span className="mm-deliver-label">Deliver to</span>
          <span className="mm-deliver-location">
            📍 India
          </span>
        </div>

        {/* Search Bar */}
        <form className="mm-search" onSubmit={handleSearch}>
          <select 
            className="mm-search-category" 
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="mm-search-btn" type="submit" id="search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1028" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Nav Items */}
        <div className="mm-header-nav">
          {/* Account */}
          <div className="mm-dropdown" ref={dropdownRef}>
            <div
              className="mm-nav-item"
              id="account-nav"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="mm-nav-label">
                Hello, {isAuthenticated ? user?.name?.split(" ")[0] : "Sign in"}
              </span>
              <span className="mm-nav-value">Account & Lists ▾</span>
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
          <Link href="/orders" className="mm-nav-item" id="orders-nav" prefetch={false}>
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
            <span className="mm-cart-text">Cart</span>
          </Link>
        </div>
      </div>

      {/* Sub-header / Category Navigation */}
      <nav className="mm-subheader">
        <Link href="/" className="mm-subheader-item" prefetch={false}>☰ All</Link>
        <Link href="/search?category=electronics" className="mm-subheader-item" prefetch={false}>Electronics</Link>
        <Link href="/search?category=fashion" className="mm-subheader-item" prefetch={false}>Fashion</Link>
        <Link href="/search?category=home-kitchen" className="mm-subheader-item" prefetch={false}>Home & Kitchen</Link>
        <Link href="/search?category=books" className="mm-subheader-item" prefetch={false}>Books</Link>
        <Link href="/search?category=sports" className="mm-subheader-item" prefetch={false}>Sports</Link>
        <Link href="/search?category=beauty" className="mm-subheader-item" prefetch={false}>Beauty</Link>
        <Link href="/search?category=toys-games" className="mm-subheader-item" prefetch={false}>Toys & Games</Link>
        <Link href="/vendor/dashboard" className="mm-subheader-item" prefetch={false}>Sell on Nexcart</Link>
        <span className="mm-subheader-item" style={{ color: "#FBBF24" }}>Today&apos;s Deals</span>
      </nav>
    </header>
  );
}
