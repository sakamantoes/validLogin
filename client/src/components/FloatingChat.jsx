// src/components/FloatingChat.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { FaTelegramPlane, FaHeadset } from "react-icons/fa";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const STORAGE_KEY = "waveverify:chat-pos";
const SIZE = 64; // w-16 = 64px
const MARGIN = 24;

/* Compute the starting position synchronously (runs on client only) */
const getInitialPos = () => {
  if (typeof window === "undefined") {
    return { x: MARGIN, y: MARGIN };
  }

  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  })();

  if (saved && typeof saved.x === "number" && typeof saved.y === "number") {
    return {
      x: Math.min(Math.max(saved.x, MARGIN), window.innerWidth - SIZE - MARGIN),
      y: Math.min(Math.max(saved.y, MARGIN), window.innerHeight - SIZE - MARGIN),
    };
  }

  // Default: bottom-right
  return {
    x: window.innerWidth - SIZE - MARGIN,
    y: window.innerHeight - SIZE - MARGIN - 8,
  };
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Compute position ONCE before first paint
  const initialPosRef = useRef(null);
  if (initialPosRef.current === null) {
    initialPosRef.current = getInitialPos();
  }
  const initialPos = initialPosRef.current;

  const [pos, setPos] = useState(initialPos);

  // Motion values start at the correct position — no animation from (0,0)
  const x = useMotionValue(initialPos.x);
  const y = useMotionValue(initialPos.y);
  const springX = useSpring(x, { stiffness: 380, damping: 30, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 380, damping: 30, mass: 0.6 });

  const wrapRef = useRef(null);

  // Telegram Configuration
  const telegramUsername = "test"; // Replace with your Telegram username later
  const telegramUrl = `https://t.me/${telegramUsername}`;

  const handleTelegram = () => {
    window.open(telegramUrl, "_blank");
    setIsOpen(false);
  };

  /* ---------- re-clamp on resize ---------- */
  useEffect(() => {
    const onResize = () => {
      setPos((p) => {
        const nx = Math.min(Math.max(p.x, MARGIN), window.innerWidth - SIZE - MARGIN);
        const ny = Math.min(Math.max(p.y, MARGIN), window.innerHeight - SIZE - MARGIN);
        x.set(nx);
        y.set(ny);
        return { x: nx, y: ny };
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- drag handling ---------- */
  const onDragStart = () => setDragging(true);

  const onDrag = (_e, info) => {
    const nx = Math.min(
      Math.max(pos.x + info.offset.x, MARGIN),
      window.innerWidth - SIZE - MARGIN
    );
    const ny = Math.min(
      Math.max(pos.y + info.offset.y, MARGIN),
      window.innerHeight - SIZE - MARGIN
    );
    x.set(nx);
    y.set(ny);
  };

  const onDragEnd = (_e, info) => {
    setDragging(false);

    const currentX = pos.x + info.offset.x;
    const currentY = pos.y + info.offset.y;

    const targetX = Math.min(
      Math.max(currentX, MARGIN),
      window.innerWidth - SIZE - MARGIN
    );
    const targetY = Math.min(
      Math.max(currentY, MARGIN),
      window.innerHeight - SIZE - MARGIN
    );

    const isTap = Math.abs(info.offset.x) < 4 && Math.abs(info.offset.y) < 4;

    x.set(targetX);
    y.set(targetY);
    setPos({ x: targetX, y: targetY });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: targetX, y: targetY })
      );
    } catch {
      /* ignore */
    }

    if (isTap) setIsOpen((v) => !v);
  };

  // Panel anchor side
  const onRight = pos.x + SIZE / 2 > window.innerWidth / 2;

  return (
    <>
      {/* The draggable floating button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        style={{
          x: springX,
          y: springY,
          touchAction: "none",
        }}
        className="fixed left-0 top-0 z-50 select-none"
        whileTap={{ scale: dragging ? 1 : 0.95 }}
      >
        {/* Pulsing Ring Effect */}
        {!isOpen && !dragging && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 blur-xl"
          />
        )}

        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? "Close chat menu" : "Open chat menu"}
          className="
            relative
            flex
            items-center
            justify-center
            w-16
            h-16
            rounded-full
            bg-gradient-to-br
            from-blue-500
            via-blue-600
            to-indigo-700
            shadow-2xl
            shadow-blue-500/50
            border
            border-white/20
            backdrop-blur-md
            group
            focus:outline-none
            focus-visible:ring-4
            focus-visible:ring-blue-400/40
          "
          style={{ cursor: dragging ? "grabbing" : "grab" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="text-white text-3xl"
                style={FONT_DISPLAY}
              >
                ✕
              </motion.span>
            ) : (
              <motion.span
                key="headset"
                initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="text-white"
              >
                <FaHeadset className="text-3xl" />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Customer Support Badge */}
          <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-0.5 shadow-lg">
            <span
              className="text-xs font-bold text-blue-600"
              style={FONT_MONO}
            >
              CS
            </span>
          </div>

          {/* Online dot */}
          <span className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
          </span>
        </motion.button>
      </motion.div>

      {/* Chat Options Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Options Modal */}
            <motion.div
              ref={wrapRef}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 220,
              }}
              className="
                fixed
                bottom-28
                right-6
                z-50
                w-[90vw]
                max-w-md
                sm:h-[490px]
                h-auto
                rounded-3xl
                overflow-hidden
                border
                border-blue-500/30
                bg-gradient-to-br
                from-gray-900
                to-black
                shadow-2xl
              "
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 p-5 flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <FaHeadset className="text-blue-600 text-2xl" />
                  </div>
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div>
                  <h3
                    className="text-white font-bold text-lg"
                    style={FONT_DISPLAY}
                  >
                    Customer Support
                  </h3>
                  <p
                    className="text-blue-100 text-sm"
                    style={FONT_MONO}
                  >
                    Choose your preferred platform
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="ml-auto text-white/70 hover:text-white text-xl transition-colors"
                  style={FONT_DISPLAY}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 text-center leading-relaxed mb-4">
                  👋 Welcome to Wave Verify Support!
                  <br />
                  How would you like to connect with us? Click the button below 👇
                </p>

                {/* Telegram Option */}
                <div className="space-y-4">
                  <motion.button
                    onClick={handleTelegram}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      p-4
                      rounded-xl
                      flex
                      items-center
                      gap-4
                      bg-gradient-to-r
                      from-blue-500/10
                      to-cyan-500/10
                      border
                      border-blue-500/30
                      hover:border-blue-500
                      transition-all
                      group
                    "
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaTelegramPlane className="text-blue-500 text-2xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4
                        className="text-white font-semibold"
                        style={FONT_DISPLAY}
                      >
                        Telegram
                      </h4>
                      <p
                        className="text-gray-400 text-sm"
                        style={FONT_MONO}
                      >
                        Instant messaging & updates
                      </p>
                    </div>
                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="flex items-center gap-2 text-xs text-gray-400"
                      style={FONT_MONO}
                    >
                      <span className="text-green-500">✓</span>
                      24/7 Availability
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs text-gray-400"
                      style={FONT_MONO}
                    >
                      <span className="text-green-500">✓</span>
                      Instant Responses
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs text-gray-400"
                      style={FONT_MONO}
                    >
                      <span className="text-green-500">✓</span>
                      Secure Chat
                    </div>
                    <div
                      className="flex items-center gap-2 text-xs text-gray-400"
                      style={FONT_MONO}
                    >
                      <span className="text-green-500">✓</span>
                      Free Support
                    </div>
                  </div>
                </div>

                <p
                  className="text-xs text-gray-500 text-center mt-5"
                  style={FONT_MONO}
                >
                  Your privacy is important. All chats are encrypted and secure.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;