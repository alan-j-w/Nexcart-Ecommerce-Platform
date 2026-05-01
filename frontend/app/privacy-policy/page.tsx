"use client";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, list a product, or make a purchase. This includes your name, email address, shipping address, and payment information.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your orders and promotional offers.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Sharing of Information</h2>
          <p>We do not sell your personal information. We only share information with vendors (to fulfill your orders) and third-party services like Razorpay and Cloudinary to process payments and store images securely.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Security</h2>
          <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All payments are processed through secure, industry-standard gateways.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@nexcart.com.</p>
        </section>
      </div>
    </div>
  );
}
