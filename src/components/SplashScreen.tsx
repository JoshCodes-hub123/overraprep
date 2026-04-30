import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Two-beat luxury splash:
 *   Beat 1 — gold gradient background, logo scales in with glow halo.
 *   Beat 2 — "Read with Ease" tagline slides DOWN from above the logo (Playfair).
 *   Beat 3 — fade out, app appears.
 *
 * Respects prefers-reduced-motion.
 */
const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showTagline, setShowTagline] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const taglineDelay = reduce ? 200 : 1100;
    const exitDelay = reduce ? 900 : 2400;
    const doneDelay = reduce ? 1200 : 2900;

    const t1 = setTimeout(() => setShowTagline(true), taglineDelay);
    const t2 = setTimeout(() => setExiting(true), exitDelay);
    const t3 = setTimeout(onComplete, doneDelay);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            // Gold luxury gradient — warm gold to soft champagne
            background:
              "radial-gradient(ellipse at 50% 35%, hsl(45 90% 65%) 0%, hsl(43 75% 55%) 35%, hsl(40 60% 42%) 100%)",
          }}
          aria-label="OverraPrep is loading"
        >
          {/* Drifting champagne particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white/40"
                style={{
                  width: 4 + (i % 4) * 2,
                  height: 4 + (i % 4) * 2,
                  left: `${(i * 73) % 100}%`,
                  top: `${(i * 41) % 100}%`,
                  filter: "blur(1px)",
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Tagline — slides DOWN from above the logo */}
          <div className="relative z-10 mb-6 h-12 flex items-end justify-center w-full px-6">
            <AnimatePresence>
              {showTagline && (
                <motion.h2
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display italic text-2xl sm:text-3xl text-white tracking-wide drop-shadow-md"
                  style={{ textShadow: "0 2px 12px rgba(120,80,0,0.35)" }}
                >
                  Read with Ease
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          {/* Logo with glow */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-white/40 blur-2xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transform: "scale(1.5)" }}
            />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-white/40">
              <motion.img
                src={logo}
                alt="OverraPrep AI"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* Brand name under logo */}
          <motion.div
            className="relative z-10 mt-6 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              OverraPrep
            </h1>
            <p className="text-white/85 mt-1 text-xs sm:text-sm">AI-Powered Exam Preparation</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
