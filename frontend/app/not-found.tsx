import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-9xl font-extrabold text-indigo-100 relative">
        404
        <span className="absolute inset-0 flex items-center justify-center text-3xl text-indigo-600 font-bold">
          Oops!
        </span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Search Products
        </Link>
      </div>
    </div>
  );
}
