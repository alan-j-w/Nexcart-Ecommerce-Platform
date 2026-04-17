"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import API from "@/lib/api";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      API.get("/cart").then(res => {
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
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
          <select className="mm-search-category" id="search-category">
            <option>All</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home</option>
            <option>Books</option>
            <option>Sports</option>
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
                    <Link href="/account" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
                      Your Account
                    </Link>
                    <Link href="/orders" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
                      Your Orders
                    </Link>
                    {user?.role === "vendor" && (
                      <Link href="/vendor/dashboard" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
                        Vendor Dashboard
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link href="/admin" className="mm-dropdown-item" onClick={() => setShowDropdown(false)}>
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
          <Link href="/orders" className="mm-nav-item" id="orders-nav">
            <span className="mm-nav-label">Returns</span>
            <span className="mm-nav-value">& Orders</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="mm-cart-btn" id="cart-nav">
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
        <Link href="/" className="mm-subheader-item">☰ All</Link>
        <Link href="/search?q=electronics" className="mm-subheader-item">Electronics</Link>
        <Link href="/search?q=fashion" className="mm-subheader-item">Fashion</Link>
        <Link href="/search?q=home" className="mm-subheader-item">Home & Kitchen</Link>
        <Link href="/search?q=books" className="mm-subheader-item">Books</Link>
        <Link href="/search?q=sports" className="mm-subheader-item">Sports</Link>
        <Link href="/search?q=beauty" className="mm-subheader-item">Beauty</Link>
        <Link href="/search?q=toys" className="mm-subheader-item">Toys & Games</Link>
        <Link href="/vendor/dashboard" className="mm-subheader-item">Sell on Nexcart</Link>
        <span className="mm-subheader-item" style={{ color: "#FBBF24" }}>Today&apos;s Deals</span>
      </nav>
    </header>
  );
}
