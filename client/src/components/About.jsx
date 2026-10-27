// src/components/About.jsx
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import CountUp from './CountUp';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  const stats = [
    { label: 'Active Users', value: 250000, suffix: '+' },
    { label: 'Successful Activations', value: 1250000, suffix: '+' },
    { label: 'Countries Supported', value: 150, suffix: '+' },
    { label: 'SMS Deliveries', value: 5000000, suffix: '+' },
  ];
  
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
            About <span className="text-brand-text">Smswinners</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            We provide cutting-edge virtual number solutions, Google Voice assistance, 
            SMS activation, and fast OTP delivery systems for global users.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold mb-4">Trusted by Thousands Worldwide</h3>
            <p className="text-muted mb-6 leading-relaxed">
              Smswinners is a leading provider of virtual phone numbers and SMS verification services. 
              Our platform enables users to receive SMS online for various services including Google Voice, 
              WhatsApp, Telegram, and hundreds of other platforms.
            </p>
            <ul className="space-y-3 fineFont">
              {['✓ Virtual Numbers for Any Service', '✓ Google Voice Registration Assistance', '✓ Fast OTP Delivery System', '✓ Social Media Account Activation'].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-muted  flex items-center gap-2"
                >
                  <span className="text-brand-text fineFont  text-xl">✓</span> {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 text-center glow-border">
                <div className="sm:text-4xl text-2xl font-bold text-brand-text mb-2">
                  {isInView ? <CountUp end={stat.value} duration={2} /> : 0}{stat.suffix}
                </div>
                <p className="text-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;