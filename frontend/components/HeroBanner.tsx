"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Banner } from "@/lib/types";

const defaultSlides: any[] = [];

export default function HeroBanner({ banners = [] }: { banners?: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const slides = banners.map(b => ({
    imageUrl: b.imageUrl,
    title: b.title,
    subtitle: "",
    cta: "Shop Now",
    link: b.link || "/",
  }));

  const next = useCallback(() => {
    if (slides.length > 0) {
      setCurrent((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length > 0) {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(next, 5000);
      return () => clearInterval(timer);
    }
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="mm-hero">
      {slides.map((slide: any, i) => (
        <div
          key={i}
          className="mm-hero-slide"
          style={{
            background: slide.bg || "none",
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          {slide.imageUrl && (
            <img 
              src={slide.imageUrl} 
              alt={slide.title} 
              className="mm-hero-image"
            />
          )}
          <div className="mm-hero-content">
            <h2 className="mm-hero-title">{slide.title}</h2>
            {slide.subtitle && <p className="mm-hero-subtitle">{slide.subtitle}</p>}
            <Link href={slide.link} className="mm-hero-cta" prefetch={false}>
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button className="mm-hero-nav prev" onClick={prev} aria-label="Previous slide">
        ‹
      </button>
      <button className="mm-hero-nav next" onClick={next} aria-label="Next slide">
        ›
      </button>

      {/* Bottom Fade */}
      <div className="mm-hero-fade-bottom" />
    </div>
  );
}
