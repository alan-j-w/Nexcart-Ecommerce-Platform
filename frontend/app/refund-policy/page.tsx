"use client";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund & Shipping Policy</h1>
      <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
        
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Shipping Policy</h2>
          <p>Orders are typically processed within 1-2 business days. Shipping times vary by vendor and location, but most deliveries arrive within 5-7 business days across India.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Returns & Refunds</h2>
          <p>We offer a 7-day return policy for most items. If you are not satisfied with your purchase, you can request a return via your Account dashboard.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Eligibility for Refunds</h2>
          <p>To be eligible for a refund, the item must be unused, in the same condition that you received it, and in its original packaging.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Process</h2>
          <p>Once your return is received and inspected by the vendor, we will notify you of the approval or rejection of your refund. Approved refunds will be processed via Razorpay to your original payment method within 5-10 business days.</p>
        </section>
      </div>
    </div>
  );
}
