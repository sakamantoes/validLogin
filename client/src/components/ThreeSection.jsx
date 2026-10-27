// src/components/ThreeSection.jsx
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Text3D, Torus, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const tokenColor = (name, fallback) =>
  typeof window === 'undefined'
    ? fallback
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const brandColor = () => tokenColor('--brand', 'blueviolet');
const brandHoverColor = () => tokenColor('--brand-hover', 'mediumpurple');
const surfaceColor = () => tokenColor('--surface-raised', 'dimgray');

function RotatingGlobe() {
  const globeRef = useRef();
  const particlesRef = useRef();
  
  useFrame((state) => {
    globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    globeRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });
  
  const particlesCount = 2000;
  const particlesPosition = Array.from({ length: particlesCount }, () => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.5;
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  });
  
  return (
    <group>
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial color={surfaceColor()} metalness={0.8} roughness={0.2} emissive={brandColor()} emissiveIntensity={0.2} />
      </Sphere>
      <Sphere args={[1.02, 64, 64]}>
        <meshStandardMaterial wireframe color={brandColor()} transparent opacity={0.15} />
      </Sphere>
      
      {/* Particles */}
      <points ref={particlesRef}>
        {particlesPosition.map((pos, i) => (
          <mesh key={i} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color={brandColor()} emissive={brandColor()} />
          </mesh>
        ))}
      </points>
      
      {/* Floating SMS Cubes */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
        <Box args={[0.15, 0.15, 0.15]} position={[1.2, 0.8, 1]}>
          <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} />
        </Box>
      </Float>
      <Float speed={2} rotationIntensity={1} floatIntensity={1.2}>
        <Box args={[0.12, 0.12, 0.12]} position={[-1, -0.5, 1.3]}>
          <meshStandardMaterial color={brandHoverColor()} emissive={brandHoverColor()} emissiveIntensity={0.4} />
        </Box>
      </Float>
      <Float speed={1.8} rotationIntensity={1} floatIntensity={0.8}>
        <Box args={[0.1, 0.1, 0.1]} position={[0.5, -1.2, 1.1]}>
          <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.6} />
        </Box>
      </Float>
    </group>
  );
}

function FloatingRing() {
  const ringRef = useRef();
  useFrame((state) => {
    ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.3;
  });
  return (
    <Torus ref={ringRef} args={[1.8, 0.05, 64, 200]}>
      <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} />
    </Torus>
  );
}

export default function ThreeSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-bg to-brand-hover relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Global <span className="text-brand-text">Connectivity</span> Visualized
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted mt-4 max-w-2xl mx-auto"
        >
          Our network spans across continents, delivering SMS and verification services in real-time
        </motion.p>
      </div>
      
      <div className="h-[500px] w-full">
        <Suspense fallback={<div className="text-center text-muted">Loading 3D Experience...</div>}>
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-5, 5, 5]} color={brandColor()} intensity={0.8} />
            <RotatingGlobe />
            <FloatingRing />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
          </Canvas>
        </Suspense>
      </div>
    </section>
  );
}