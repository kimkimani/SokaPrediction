import React, { useState } from 'react';
import { FaqAccordion } from './FaqAccordion';
import { MarkdownPageManager } from '../services/markdownManager';

export const ContactView: React.FC = () => {
  const pageData = MarkdownPageManager.getPageByPath('/contact');
  const faqs = pageData?.faqs || [];
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="py-4 max-w-4xl mx-auto">
      <div className="mb-6 bg-[#8D0E83] text-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl md:text-3xl font-black m-0 mb-2">
          Contact SOKA PREDICTIONS Support
        </h1>
        <p className="text-xs md:text-sm text-purple-100 leading-relaxed">
          Need help with your VIP activation, M-Pesa transaction confirmation, or custom jackpot slips? Our Nairobi team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Contact channels */}
        <div className="space-y-4">
          <a
            href="https://wa.me/254740841375?text=Hello%20Soka%20Predictions%2C%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-4 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shadow-sm">
              <i className="fab fa-whatsapp"></i>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-emerald-800">Direct WhatsApp Chat</div>
              <div className="text-sm font-extrabold text-gray-900">+254 740 841 375</div>
              <div className="text-[11px] text-gray-500">Fastest response (~2 mins)</div>
            </div>
            <i className="fas fa-arrow-right ml-auto text-emerald-700 opacity-60 group-hover:translate-x-1 transition-transform"></i>
          </a>

          <a
            href="https://t.me/sokapredictions"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl flex items-center gap-4 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-xl shadow-sm">
              <i className="fab fa-telegram"></i>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-sky-800">Telegram VIP Channel</div>
              <div className="text-sm font-extrabold text-gray-900">@sokapredictions</div>
              <div className="text-[11px] text-gray-500">Daily free slips &amp; winner proofs</div>
            </div>
            <i className="fas fa-arrow-right ml-auto text-sky-700 opacity-60 group-hover:translate-x-1 transition-transform"></i>
          </a>

          <a
            href="tel:+254740841375"
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center gap-4 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-full bg-[#8D0E83] text-white flex items-center justify-center text-xl shadow-sm">
              <i className="fas fa-phone-alt"></i>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-[#8D0E83]">Customer Helpline</div>
              <div className="text-sm font-extrabold text-gray-900">+254 740 841 375</div>
              <div className="text-[11px] text-gray-500">Available 08:00 - 23:00 EAT</div>
            </div>
            <i className="fas fa-arrow-right ml-auto text-[#8D0E83] opacity-60 group-hover:translate-x-1 transition-transform"></i>
          </a>
        </div>

        {/* Support inquiry form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-envelope-open-text text-[#8D0E83]"></i>
            <span>Send Us an Inquiry</span>
          </h2>

          {sent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-900">
              <i className="fas fa-check-circle text-2xl text-emerald-600 mb-2"></i>
              <h3 className="font-bold text-sm mb-1">Message Sent!</h3>
              <p className="text-xs text-gray-600">
                Thank you! Our support team will reach out to your phone via SMS or WhatsApp shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Samuel Kiprotich"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="07XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Your Message or Transaction ID</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="e.g. I made an M-Pesa payment for the Two Weeks VIP package..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8D0E83] focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-[#8D0E83] hover:bg-[#630A5C] text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
              >
                {sending ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Contact FAQs from contact.md */}
      {faqs.length > 0 && (
        <FaqAccordion
          faqs={faqs}
          title={pageData?.frontmatter.faqTitle || "Customer Support - FAQs"}
          subtitle="Quick answers regarding response times, payment inquiries, and custom slip requests."
        />
      )}
    </div>
  );
};
