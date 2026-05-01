"use client";

import { useState, useEffect } from "react";
import createAPI from "@/lib/api";
import Link from "next/link";

export default function DevEmails() {
  const API = createAPI();
  const [email, setEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmail = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/dev/last-email");
      setEmail(res.data);
    } catch (err) {
      console.error("Failed to fetch dev email:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmail();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dev Email Inbox</h1>
            <p className="text-gray-400 text-sm">Preview system-generated emails in real-time during development.</p>
          </div>
          <button 
            onClick={fetchEmail}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Refresh Inbox
          </button>
        </div>

        {!email ? (
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-3xl p-16 text-center border border-white/5">
            <div className="bg-indigo-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">No emails captured yet</h3>
            <p className="text-gray-400 mt-3 max-w-sm mx-auto">
              Once you trigger an email action (like "Forgot Password"), the content will appear here instantly.
            </p>
            <Link 
              href="/forgot-password" 
              target="_blank" 
              className="mt-8 inline-flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              Test Forgot Password Flow
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="bg-[#1e293b] rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                  Live Preview
                </span>
                <span className="text-gray-500 text-xs font-medium">
                  Captured at {new Date(email.sentAt).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Recipient</p>
                  <p className="text-white font-mono text-sm">{email.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Subject Line</p>
                  <p className="text-white font-semibold">{email.subject}</p>
                </div>
              </div>
            </div>
            
            {/* The Email Content Container */}
            <div className="p-8 bg-white min-h-[400px] flex items-center justify-center">
              <div 
                className="w-full max-w-[600px] bg-white rounded-xl shadow-inner overflow-hidden"
                dangerouslySetInnerHTML={{ __html: email.html }}
              />
            </div>
          </div>
        )}

        <div className="mt-12 p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
          </div>
          <h4 className="text-indigo-400 font-bold text-lg mb-3">Portfolio Insight</h4>
          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Building local development tools like this "Mock Inbox" proves you understand full-cycle software development. It demonstrates that you don't just build features, you build **environments** that make testing and scaling possible.
          </p>
        </div>
      </div>
    </div>
  );
}
