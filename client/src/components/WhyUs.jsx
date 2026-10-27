// src/components/WhyUs.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Shield, Wallet, Zap, Globe as GlobeIcon, Headphones } from 'lucide-react';

const features = [
  { icon: Rocket, title: 'Fast Delivery', description: 'Instant SMS delivery within seconds' },
  { icon: Shield, title: 'Secure Platform', description: 'Bank-grade encryption & privacy' },
  { icon: Wallet, title: 'Affordable Pricing', description: 'Competitive rates for all plans' },
  { icon: Zap, title: 'Real-time OTP', description: 'Live OTP tracking dashboard' },
  { icon: GlobeIcon, title: 'Global Access', description: 'Numbers from 150+ countries' },
  { icon: Headphones, title: '24/7 Support', description: 'Professional customer support' },
];

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="glass-card rounded-2xl p-6 text-center glow-border"
  >
    <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-brand-text" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted">{description}</p>
  </motion.div>
);

const WhyUs = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-bg to-brand-hover">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose <span className="text-brand-text">Smswinners</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            We deliver excellence through speed, security, and reliability
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;