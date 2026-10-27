// src/components/Contact.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Phone, MessageCircle, Copy, Check, ClipboardCheck } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(null);
  
  // Available WhatsApp Numbers
  const whatsappNumbers = [
    { number: "+1 (212) 555-1234", country: "USA", flag: "🇺🇸", available: true, operator: "Verizon" },
    { number: "+44 20 7946 0123", country: "UK", flag: "🇬🇧", available: true, operator: "Vodafone" },
    { number: "+61 2 3456 7890", country: "Australia", flag: "🇦🇺", available: true, operator: "Telstra" },
    { number: "+81 3 1234 5678", country: "Japan", flag: "🇯🇵", available: true, operator: "NTT" },
    { number: "+49 30 1234567", country: "Germany", flag: "🇩🇪", available: true, operator: "Deutsche Telekom" },
    { number: "+33 1 2345 6789", country: "France", flag: "🇫🇷", available: false, operator: "Orange" },
    { number: "+86 10 1234 5678", country: "China", flag: "🇨🇳", available: true, operator: "China Mobile" },
    { number: "+91 98765 43210", country: "India", flag: "🇮🇳", available: true, operator: "Jio" },
  ];


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  const copyToClipboard = (number) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <section className="py-24 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get In <span className="text-brand-text">Touch</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Have questions? We're here to help you 24/7
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-muted mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-brand rounded-lg focus:outline-none focus:border-brand text-heading"
                />
              </div>
              <div>
                <label className="block text-muted mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-brand rounded-lg focus:outline-none focus:border-brand text-heading"
                />
              </div>
              <div>
                <label className="block text-muted mb-2">Message</label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-brand rounded-lg focus:outline-none focus:border-brand text-heading"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand to-brand-hover rounded-lg font-semibold text-on-brand flex items-center justify-center gap-2"
              >
                Send Message <Send size={18} />
              </motion.button>
              {submitted && (
                <p className="text-success text-center">Message sent successfully!</p>
              )}
            </form>
          </motion.div>

          {/* Email Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center"
          >
            <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mb-6 text-on-brand">
              <Mail className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Email Us Directly</h3>
            <p className="text-muted mb-2">Our support team responds within 24 hours</p>
            <a href="mailto:wowwin96@gmail.com" className="text-2xl font-bold text-brand-text hover:text-brand-text transition-colors">
              wowwin96@gmail.com
            </a>
            <div className="mt-8 p-4 bg-brand rounded-lg border border-brand text-on-brand">
              <p className="text-sm">📧 Enterprise Email Support Available</p>
              <p className="text-sm">⏱️ 24/7 Email Response Team</p>
              <p className="text-sm">🔒 End-to-end Email Encryption</p>
            </div>
          </motion.div>
        </div>

        {/* WhatsApp Numbers Section */}
        <div className="grid lg:grid-cols-1 gap-8 mt-12">
          {/* Available WhatsApp Numbers */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-success-soft rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Available WhatsApp Numbers</h3>
                <p className="text-muted text-sm">Click any number to copy & chat</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {whatsappNumbers.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => copyToClipboard(item.number)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    item.available 
                      ? 'bg-success-soft hover:bg-success-soft border border-success' 
                      : 'bg-brand text-on-brand opacity-50 cursor-not-allowed border border-brand'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.flag}</span>
                    <div>
                      <p className={`font-medium ${item.available ? "text-heading" : "text-on-brand"}`}>{item.number}</p>
                      <p className={`text-xs ${item.available ? "text-muted" : "text-on-brand"}`}>{item.country} - {item.operator}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.available ? (
                      <>
                        {copiedNumber === item.number ? (
                          <Check className="w-5 h-5 text-success" />
                        ) : (
                          <Copy className="w-5 h-5 text-muted hover:text-success transition-colors" />
                        )}
                        <span className="text-xs px-2 py-1 bg-success-soft text-success rounded-full">Available</span>
                      </>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-brand text-on-brand rounded-full">Busy</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-success-soft rounded-lg border border-success text-center">
              <p className="text-xs flex item-center justify-center gap-1 text-muted"><ClipboardCheck size={16} classname='bg-surface'/> <span>Click any number to copy to clipboard and start chatting on WhatsApp</span></p>
            </div>
          </motion.div>

        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: color-mix(in srgb, var(--surface-raised) 70%, transparent);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--brand) 55%, transparent);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--brand);
        }
      `}</style>
    </section>
  );
};

export default Contact;
