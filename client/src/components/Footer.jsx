// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <footer className="bg-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-heading mb-4">
              Smswinners
            </h2>
            <p className="text-muted text-sm">
              Premium virtual numbers & SMS verification platform for global users.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted">
              <li><a href="#" className="hover:text-brand-text transition">Home</a></li>
              <li><a href="#" className="hover:text-brand-text transition">About</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Services</a></li>
              <li><a href="#" className="hover:text-brand-text transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-muted">
              <li><Link to="/terms" className="hover:text-brand-text transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-text transition">Privacy Policy</Link></li>
            </ul>
          </div>
          
          
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted text-sm">
            © 2026 Smswinners. All rights reserved.
          </p>
          <motion.button
            whileHover={{ y: -3 }}
            onClick={scrollToTop}
            className="mt-4 md:mt-0 p-2 bg-brand text-on-brand rounded-full hover:bg-brand transition"
          >
            <ChevronUp size={20} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
