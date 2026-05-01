"use client";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        <p className="text-lg">Welcome to Nexcart. By using our website, you agree to the following terms.</p>
        
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p>By accessing or using Nexcart, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Vendor Obligations</h2>
          <p>Vendors are responsible for the accuracy of their product listings and for fulfilling orders in a timely manner. Nexcart reserves the right to suspend any vendor account that violates our quality standards.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Payments & Fees</h2>
          <p>All transactions are processed in INR. Nexcart may charge a commission on vendor sales, which will be disclosed during the vendor registration process.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Limitation of Liability</h2>
          <p>Nexcart is a marketplace platform. We are not liable for the quality of products sold by independent vendors, though we will assist in resolving any disputes.</p>
        </section>
      </div>
    </div>
  );
}
