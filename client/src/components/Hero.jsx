// src/components/Hero.jsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Hero3DPhone from "./Hero3DPhone";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-brand to-bg" />
      <div className="absolute inset-0 theme-radial from-brand via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span> Own Premium Virtual Numbers</span>
              <br />
              <span
                className="
  bg-gradient-to-r
  from-brand
  via-brand
  to-brand-hover
  bg-clip-text
  text-transparent
  
"
              >
                & Google Voice Platform
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xl text-muted"
            >
              Get reliable virtual numbers for social media activation, SMS
              verification, Google Voice registration, and online account setup
              with a secure and fast platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-brand to-brand-hover rounded-lg font-semibold text-on-brand border-border border shadow-lg shadow-glow flex items-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </motion.button>{" "}
              </Link>

              <Link to="#services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 glass-card rounded-lg font-semibold text-heading border border-brand flex items-center gap-2"
                >
                  <Play size={20} /> View Services
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex gap-8"
            >
              <div>
                <span className="text-3xl font-bold text-brand-text">99.9%</span>
                <p className="text-muted">Uptime</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-brand-text">24/7</span>
                <p className="text-muted">Support</p>
              </div>
              <div>
                <span className="text-3xl font-bold text-brand-text">150+</span>
                <p className="text-muted">Countries</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right 3D Phone Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px]"
          >
            <Hero3DPhone />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
