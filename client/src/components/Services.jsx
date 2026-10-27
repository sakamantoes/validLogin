// src/components/Services.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Mic, 
  MessageSquare, 
  LayoutDashboard, 
  Share2, 
  Zap, 
  Shield, 
  Globe 
} from 'lucide-react';

const services = [
  { icon: Smartphone, title: 'Virtual Numbers', description: 'Get temporary or permanent virtual numbers from 150+ countries.' },
  { icon: Mic, title: 'Google Voice Setup', description: 'Complete assistance with Google Voice number registration.' },
  { icon: MessageSquare, title: 'SMS Verification', description: 'Fast and reliable SMS verification for any platform.' },
  { icon: LayoutDashboard, title: 'OTP Dashboard', description: 'Real-time OTP tracking and management dashboard.' },
  { icon: Share2, title: 'Social Media Activation', description: 'Activate WhatsApp, Telegram, Facebook, and more.' },
  { icon: Zap, title: 'Fast SMS Delivery', description: 'Instant SMS delivery with 99.9% uptime guarantee.' },
  { icon: Shield, title: 'Secure Activation', description: 'Privacy-focused secure account activation.' },
  { icon: Globe, title: 'Multi-country Numbers', description: 'Access numbers from USA, UK, Canada, and worldwide.' },
];

const ServiceCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="glass-card rounded-2xl p-6 cursor-pointer group glow-border"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-hover rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-on-brand" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted">{description}</p>
    </motion.div>
  );
};

const Services = () => {
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
            Our <span className="text-brand-text">Services</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Comprehensive virtual number solutions for all your verification needs
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
