"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mm-footer">
      {/* Back to Top */}
      <div
        className="mm-footer-back-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
      </div>

      {/* Footer Links */}
      <div className="mm-footer-main">
        <div className="mm-footer-col">
          <h4>Get to Know Us</h4>
          <ul>
            <li><Link href="#">About Nexcart</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Press Releases</Link></li>
            <li>Nexcart Science</li>
          </ul>
        </div>

        <div className="mm-footer-col">
          <h4>Connect with Us</h4>
          <div className="mm-footer-socials">
            <a href="#" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>

        <div className="mm-footer-col">
          <h4>Make Money with Us</h4>
          <ul>
            <li><Link href="/vendor/dashboard">Sell on Nexcart</Link></li>
            <li>Sell under New Brand</li>
            <li>Become an Affiliate</li>
            <li>Advertise Your Products</li>
          </ul>
        </div>

        <div className="mm-footer-col">
          <h4>Let Us Help You</h4>
          <ul>
            <li><Link href="/account">Your Account</Link></li>
            <li><Link href="/refund-policy">Returns & Refund Policy</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
            <li>Help</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mm-footer-bottom">
        <div className="mm-footer-logo">
          Nex<span className="mm-logo-accent">cart</span>
        </div>
        <div className="mm-footer-copyright">
          © {new Date().getFullYear()} Nexcart All rights reserved. 
          <div style={{ marginTop: "8px", opacity: 0.8 }}>
            Multi-Vendor E-Commerce Platform Developed By 
            <a href="https://www.linkedin.com/in/alan-joy-wilson" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "5px", textDecoration: "underline", color: "var(--mm-gold-400)" }}>
              Alan Joy Wilson
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
