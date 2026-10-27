// src/components/Hero3DPhone.jsx - Fixed Advanced Version
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Box, Ring, Sphere, Cylinder, Torus, Stars, Sparkles, Plane } from "@react-three/drei";
import * as THREE from "three";

const tokenColor = (name, fallback) =>
  typeof window === "undefined"
    ? fallback
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const brandColor = () => tokenColor("--brand", "blueviolet");
const brandHoverColor = () => tokenColor("--brand-hover", "mediumpurple");
const brandSoftColor = () => tokenColor("--brand-text", "plum");
const surfaceColor = () => tokenColor("--surface-raised", "dimgray");
const bgColor = () => tokenColor("--bg", "black");
const headingColor = () => tokenColor("--text-heading", "white");

function AdvancedRotatingRings() {
  const groupRef = useRef();
  const ringColors = [brandColor(), brandHoverColor(), brandSoftColor(), brandColor()];
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.1;
      groupRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Ring args={[1.5, 1.7, 128]} rotation-x={Math.PI / 2}>
        <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={1} transparent opacity={0.6} />
      </Ring>
      
      <Ring args={[1.1, 1.25, 96]} rotation-x={Math.PI / 2}>
        <meshStandardMaterial color={brandHoverColor()} emissive={brandHoverColor()} emissiveIntensity={0.8} transparent opacity={0.7} />
      </Ring>
      
      {[1.3, 1.6, 1.9].map((radius, i) => (
        <Torus key={i} args={[radius, 0.02, 64, 200]} rotation-x={Math.PI / 2 + i * 0.5}>
          <meshStandardMaterial color={ringColors[i]} emissive={ringColors[i]} emissiveIntensity={0.6} />
        </Torus>
      ))}
      
      <Torus args={[1.4, 0.015, 64, 200]} rotation-x={Math.PI / 3}>
        <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} />
      </Torus>
      <Torus args={[1.4, 0.015, 64, 200]} rotation-x={-Math.PI / 3}>
        <meshStandardMaterial color={brandHoverColor()} emissive={brandHoverColor()} emissiveIntensity={0.5} />
      </Torus>
    </group>
  );
}

function EnergyParticles() {
  const pointsRef = useRef();
  const count = 500;
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const color = new THREE.Color().setHSL(0.05, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.1;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function DataStream() {
  const pointsRef = useRef();
  const lineCount = 12;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      for (let t = 0; t <= 1; t += 0.05) {
        const r = 0.8 + t;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        pos.push(x, t * 2 - 1, z);
      }
    }
    return pos;
  }, [lineCount]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={new Float32Array(positions)} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={brandColor()} size={0.02} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function ProfessionalPhoneModel() {
  const phoneGroupRef = useRef();
  const screenGlowRef = useRef();
  const notificationRef = useRef();
  const [notificationActive, setNotificationActive] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificationActive(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  useFrame((state) => {
    if (phoneGroupRef.current) {
      phoneGroupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.1;
      phoneGroupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.08;
      phoneGroupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05;
    }
    if (screenGlowRef.current) {
      const intensity = 0.4 + Math.sin(state.clock.getElapsedTime() * 4) * 0.2;
      screenGlowRef.current.material.emissiveIntensity = intensity;
    }
    if (notificationRef.current) {
      notificationRef.current.scale.setScalar(notificationActive ? 1 : 0.8);
    }
  });

  return (
    <group ref={phoneGroupRef}>
      {/* Ground reflection glow */}
      <mesh position={[0, -0.95, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      
      {/* Premium metallic body */}
      <Box args={[0.85, 1.65, 0.12]} position={[0, 0, 0]}>
        <meshStandardMaterial color={surfaceColor()} metalness={0.95} roughness={0.08} emissive={brandColor()} emissiveIntensity={0.08} />
      </Box>
      
      {/* Chrome frame */}
      <Box args={[0.88, 1.68, 0.08]} position={[0, 0, 0]}>
        <meshStandardMaterial color={surfaceColor()} metalness={0.98} roughness={0.05} />
      </Box>
      
      {/* Display with gradient effect */}
      <Box args={[0.76, 1.46, 0.05]} position={[0, 0, 0.07]}>
        <meshStandardMaterial color={bgColor()} metalness={0.2} roughness={0.1} emissive={brandColor()} emissiveIntensity={0.3} />
      </Box>
      
      {/* Animated screen content */}
      <Box ref={screenGlowRef} args={[0.74, 1.44, 0.03]} position={[0, 0, 0.09]}>
        <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} transparent opacity={0.25} />
      </Box>
      
      {/* Notification indicator */}
      <Float speed={3} floatIntensity={0.3}>
        <Sphere ref={notificationRef} args={[0.05, 16, 16]} position={[0.32, 0.65, 0.1]}>
          <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={1} />
        </Sphere>
      </Float>
      
      {/* Premium camera array */}
      <group position={[0.28, 0.68, 0.095]}>
        <Cylinder args={[0.09, 0.09, 0.02, 48]} rotation-x={Math.PI / 2}>
          <meshStandardMaterial color={surfaceColor()} metalness={0.9} />
        </Cylinder>
        <Cylinder args={[0.05, 0.05, 0.03, 32]} rotation-x={Math.PI / 2} position={[0, 0, 0.01]}>
          <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={1} />
        </Cylinder>
        <Sphere args={[0.02, 16, 16]} position={[0.1, 0.05, 0.02]}>
          <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.5} />
        </Sphere>
      </group>
      
      {/* Side buttons with glow */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <Box key={i} args={[0.06, 0.08, 0.05]} position={[0.45, y, 0]}>
          <meshStandardMaterial color={surfaceColor()} metalness={0.8} emissive={brandColor()} emissiveIntensity={0.2} />
        </Box>
      ))}
    </group>
  );
}

function FloatingTechElements() {
  const groupRef = useRef();
  const elements = [
    { color: brandColor(), position: [1.3, 0.6, 0.8], size: 0.2, type: "box", pulseSpeed: 2 },
    { color: brandHoverColor(), position: [-1.2, 0.9, 1.0], size: 0.18, type: "sphere", pulseSpeed: 2.5 },
    { color: brandSoftColor(), position: [0.6, -0.7, 1.4], size: 0.15, type: "torus", pulseSpeed: 3 },
    { color: brandColor(), position: [-0.9, -0.4, 1.3], size: 0.22, type: "box", pulseSpeed: 1.8 },
    { color: brandHoverColor(), position: [1.4, -0.3, 0.9], size: 0.16, type: "sphere", pulseSpeed: 2.2 },
    { color: brandColor(), position: [0, 1.1, 1.1], size: 0.14, type: "torus", pulseSpeed: 2.8 },
    { color: brandSoftColor(), position: [-1.3, -0.1, 1.2], size: 0.19, type: "box", pulseSpeed: 2.1 },
  ];
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });
  
  return (
    <group ref={groupRef}>
      {elements.map((el, i) => {
        let GeometryComponent;
        const args = el.type === "torus" 
          ? [el.size * 0.8, el.size * 0.2, 32, 64]
          : el.type === "sphere"
          ? [el.size, 32, 32]
          : [el.size, el.size, el.size];
        
        return (
          <Float key={i} speed={el.pulseSpeed} rotationIntensity={0.8} floatIntensity={0.7}>
            <mesh position={el.position}>
              {el.type === "box" && <boxGeometry args={args} />}
              {el.type === "sphere" && <sphereGeometry args={args} />}
              {el.type === "torus" && <torusGeometry args={args} />}
              <meshStandardMaterial color={el.color} emissive={el.color} emissiveIntensity={0.6} metalness={0.7} transparent opacity={0.9} />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

function LightBeams() {
  const groupRef = useRef();
  const beamCount = 8;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: beamCount }).map((_, i) => {
        const angle = (i / beamCount) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 2.2, Math.sin(angle) * 0.5, Math.sin(angle) * 1.5]}>
            <Cylinder args={[0.03, 0.08, 0.8, 8]} rotation-x={Math.PI / 2}>
              <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.8} transparent opacity={0.4} />
            </Cylinder>
          </group>
        );
      })}
    </group>
  );
}

function EnergyOrb() {
  const orbRef = useRef();
  
  useFrame((state) => {
    if (orbRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
      orbRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <Sphere ref={orbRef} args={[2.1, 64, 64]}>
      <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.1} transparent opacity={0.05} wireframe />
    </Sphere>
  );
}

function GlowEffect() {
  const glowRef = useRef();
  
  useFrame((state) => {
    if (glowRef.current) {
      const intensity = 0.15 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      glowRef.current.material.emissiveIntensity = intensity;
    }
  });
  
  return (
    <Sphere ref={glowRef} args={[1.85, 48, 48]}>
      <meshStandardMaterial color={brandColor()} emissive={brandColor()} emissiveIntensity={0.12} transparent opacity={0.06} />
    </Sphere>
  );
}

export default function Hero3DPhone() {
  return (
    <div className="w-full h-full relative">
      {/* CSS overlay for extra glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-brand via-transparent to-transparent" />
      
      <Canvas
        className="h-full w-full bg-transparent"
        camera={{ position: [0, 0, 5.2], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onContextCreated={(state) => {
          // Handle context loss prevention
          state.gl.getContext().getExtension('WEBGL_lose_context');
        }}
      >
        {/* Advanced Lighting System */}
        <ambientLight intensity={0.3} />
        <pointLight position={[4, 3, 4]} intensity={1.2} color={headingColor()} />
        <pointLight position={[-3, 2, 5]} intensity={0.8} color={brandColor()} />
        <pointLight position={[2, -2, 3]} intensity={0.6} color={brandHoverColor()} />
        <pointLight position={[0, 3, 2]} intensity={0.5} color={brandSoftColor()} />
        <directionalLight position={[2, 3, 2]} intensity={0.7} />
        <spotLight position={[0, 3, 3]} intensity={0.4} angle={0.3} penumbra={0.5} color={brandColor()} />
        
        {/* Background Stars */}
        <Stars radius={10} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
        
        {/* Core Visual Elements */}
        <EnergyOrb />
        <GlowEffect />
        <AdvancedRotatingRings />
        
        {/* Main Phone */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <ProfessionalPhoneModel />
        </Float>
        
        {/* Atmospheric Effects */}
        <EnergyParticles />
        <DataStream />
        <FloatingTechElements />
        <LightBeams />
        <Sparkles count={100} scale={4} size={0.05} color={brandColor()} />
        
        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}