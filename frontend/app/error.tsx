"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        An unexpected error occurred. Our team has been notified. You can try refreshing the page or head back home.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
