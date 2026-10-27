// src/components/Testimonials.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Digital Marketer',
    content: 'Smswinners has been a game-changer for my business. The virtual numbers work perfectly for all my social media verifications.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Startup Founder',
    content: 'Fast, reliable, and affordable. The OTP delivery is instant and customer support is outstanding.',
    rating: 5,
  },
  {
    name: 'Emma Williams',
    role: 'E-commerce Manager',
    content: 'Best Google Voice activation service I\'ve used. Highly recommended for international businesses.',
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="glass-card rounded-2xl p-6 glow-border"
  >
    <Quote className="w-8 h-8 text-brand-text mb-4 opacity-50" />
    <p className="text-muted mb-4">{testimonial.content}</p>
    <div className="flex items-center gap-2 mb-3">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-brand text-brand-text" />
      ))}
    </div>
    <h4 className="font-bold">{testimonial.name}</h4>
    <p className="text-sm text-muted">{testimonial.role}</p>
  </motion.div>
);

const Testimonials = () => {
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
            What Our <span className="text-brand-text">Clients Say</span>
          </h2>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Trusted by thousands of satisfied customers worldwide
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;