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
            <li>About Nexcart</li>
            <li>Careers</li>
            <li>Press Releases</li>
            <li>Nexcart Science</li>
          </ul>
        </div>

        <div className="mm-footer-col">
          <h4>Connect with Us</h4>
          <ul>
            <li>Facebook</li>
            <li>Twitter</li>
            <li>Instagram</li>
          </ul>
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
          Nex<span style={{ color: "#FBBF24" }}>cart</span>
        </div>
        <div className="mm-footer-copyright">
          © {new Date().getFullYear()} Nexcart All rights reserved. Multi-Vendor E-Commerce Platform Developed By <a href="https://www.linkedin.com/in/alan-joy-wilson" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "inherit" }}>Alan Joy Wilson</a>.
        </div>
      </div>
    </footer>
  );
}
