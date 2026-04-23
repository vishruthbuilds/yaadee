import React from 'react';
import { motion } from 'framer-motion';

const DecorationLayer = () => {
  // Define colorful paper flowers with distinct elegant colors
  const colorfulFlowers = [
    { top: '12%', left: '15%', color: '#ffadad', size: 60, delay: 0 },   // Soft Pink
    { top: '48%', left: '10%', color: '#ffd6a5', size: 45, delay: 2 },   // Peach
    { top: '78%', left: '18%', color: '#fdffb6', size: 55, delay: 4 },   // Soft Yellow
    { top: '22%', left: '85%', color: '#caffbf', size: 50, delay: 1 },   // Mint
    { top: '62%', left: '90%', color: '#9bf6ff', size: 40, delay: 3 },   // Sky Blue
    { top: '88%', left: '78%', color: '#a0c4ff', size: 65, delay: 5 },   // Lavender Blue
    { top: '35%', left: '5%', color: '#bdb2ff', size: 35, delay: 7 },    // Purple
  ];

  // Define elegant dark maroon hearts
  const maroonHearts = [
    { top: '8%', left: '30%', size: 48, delay: 1 },
    { top: '32%', left: '22%', size: 56, delay: 3 },
    { top: '68%', left: '12%', size: 52, delay: 5 },
    { top: '18%', left: '70%', size: 64, delay: 2 },
    { top: '55%', left: '82%', size: 42, delay: 4 },
    { top: '92%', left: '65%', size: 50, delay: 6 },
  ];

  // Define the new 3D-style paper flowers from the image
  const hibiscusFlowers = [
    { top: '5%', left: '45%', color: '#ff7b54', size: 120, delay: 0 },   // Vibrant Orange
    { top: '30%', left: '75%', color: '#ffd31d', size: 100, delay: 2 },  // Vibrant Yellow
    { top: '65%', left: '25%', color: '#1a95ff', size: 110, delay: 4 },  // Vibrant Blue
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* --- 3D HIBISCUS STYLE PAPER FLOWERS --- */}
      {hibiscusFlowers.map((flower, i) => (
        <motion.div
          key={`hibiscus-${i}`}
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 0.45, scale: 1, rotate: 10 }}
          transition={{ duration: 2, ease: "easeOut", delay: flower.delay }}
          className="absolute drop-shadow-xl"
          style={{ top: flower.top, left: flower.left }}
        >
          <svg width={flower.size} height={flower.size} viewBox="0 0 100 100" fill="none">
            {/* 5 Petals with 3D Fold Effect */}
            {[0, 72, 144, 216, 288].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 50 50)`}>
                {/* Full Petal Base */}
                <path 
                  d="M50 50 C35 45, 30 15, 50 5 C70 15, 65 45, 50 50 Z" 
                  fill={flower.color} 
                  fillOpacity="0.9" 
                />
                {/* Lighter Highlight side for 3D fold look */}
                <path 
                  d="M50 50 C57 47, 60 30, 50 5 L 50 50 Z" 
                  fill="white" 
                  fillOpacity="0.2" 
                />
                {/* Center fold line */}
                <path d="M50 50 L 50 5" stroke="black" strokeOpacity="0.1" strokeWidth="0.5" />
              </g>
            ))}
            {/* Center Fringed Stamen */}
            <circle cx="50" cy="50" r="10" fill="#f9d423" />
            {[...Array(12)].map((_, j) => (
              <line 
                key={j} 
                x1="50" y1="50" 
                x2={50 + 12 * Math.cos((j * 30 * Math.PI) / 180)} 
                y2={50 + 12 * Math.sin((j * 30 * Math.PI) / 180)} 
                stroke="#d4af37" 
                strokeWidth="1.5" 
              />
            ))}
            <circle cx="50" cy="50" r="4" fill="#6ab04c" fillOpacity="0.7" />
          </svg>
        </motion.div>
      ))}

      {/* --- ELEGANT DARK MAROON HEARTS --- */}
      {maroonHearts.map((heart, i) => (
        <motion.div
          key={`heart-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5, delay: heart.delay }}
          className="absolute text-[#4a0404] drop-shadow-lg"
          style={{ top: heart.top, left: heart.left }}
        >
          <svg width={heart.size} height={heart.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}

      {/* --- COLORFUL PAPER FLOWERS --- */}
      {colorfulFlowers.map((flower, i) => (
        <motion.div
          key={`flower-${i}`}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 0.5, scale: 1, rotate: 360 }}
          transition={{ 
            duration: 30 + i * 5, 
            repeat: Infinity, 
            ease: "linear", 
            delay: flower.delay 
          }}
          className="absolute drop-shadow-lg"
          style={{ 
            top: flower.top, 
            left: flower.left, 
            color: flower.color,
            filter: 'saturate(0.9)' 
          }}
        >
          <svg width={flower.size} height={flower.size} viewBox="0 0 100 100" fill="none">
            {/* Petals with folded appearance */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 50 50)`}>
                <path 
                  d="M50 50C50 50 65 20 80 20C95 20 95 40 80 50C65 60 50 50 50 50Z" 
                  fill="currentColor" 
                  fillOpacity="0.6" 
                  stroke="currentColor" 
                  strokeWidth="0.5"
                />
                <line x1="50" y1="50" x2="80" y2="35" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" />
              </g>
            ))}
            <circle cx="50" cy="50" r="10" fill="white" fillOpacity="0.4" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="4" fill="currentColor" fillOpacity="0.8" />
          </svg>
        </motion.div>
      ))}

      {/* --- ELEGANT SPARKLES --- */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ 
            duration: 3 + i, 
            repeat: Infinity, 
            delay: i * 0.5 
          }}
          className="absolute text-soft-yellow"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%` 
          }}
        >
          <svg width="8" height="8" viewBox="0 0 10 10">
            <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" fill="currentColor" />
          </svg>
        </motion.div>
      ))}

      {/* --- ORIGAMI BUTTERFLY --- */}
      <motion.div 
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ 
          opacity: 0.15,
          x: [0, 10, 0],
          y: [0, -15, 0],
          rotate: [15, 25, 15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 hidden md:block"
      >
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent drop-shadow-sm">
          <path d="M50 50L20 20L50 40L80 20L50 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 50L30 80L50 60L70 80L50 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 40L50 60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* --- ORIGAMI CRANES --- */}
      
      {/* Top Left Crane */}
      <motion.div 
        initial={{ opacity: 0, x: -50, rotate: -30 }}
        animate={{ opacity: 0.2, x: 0, rotate: -15 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute top-12 left-12 md:top-20 md:left-24"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-warm-brown drop-shadow-sm">
          {/* Main Body */}
          <path d="M60 20L30 50L60 100L90 50L60 20Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.75" />
          {/* Wings */}
          <path d="M60 50L10 30L30 50L60 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.75" />
          <path d="M60 50L110 30L90 50L60 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.75" />
          {/* Head/Tail */}
          <path d="M60 100L50 80L20 90L60 100Z" stroke="currentColor" strokeWidth="0.5" />
          <path d="M60 100L70 80L100 90L60 100Z" stroke="currentColor" strokeWidth="0.5" />
          {/* Folds */}
          <path d="M60 20L60 100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      </motion.div>

      {/* Bottom Right Crane */}
      <motion.div 
        initial={{ opacity: 0, x: 50, rotate: 45 }}
        animate={{ opacity: 0.15, x: 0, rotate: 30 }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
        className="absolute bottom-20 right-10 md:bottom-32 md:right-32"
      >
        <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-accent drop-shadow-sm rotate-180">
          <path d="M60 20L30 50L60 100L90 50L60 20Z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="0.75" />
          <path d="M60 50L10 40L30 50L60 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.75" />
          <path d="M60 50L110 40L90 50L60 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.75" />
          <path d="M60 100L60 20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" />
        </svg>
      </motion.div>

      {/* --- ORIGAMI PAPER PLANE --- */}
      <motion.div 
        initial={{ opacity: 0, x: -100, y: 100 }}
        animate={{ 
          opacity: 0.1,
          x: [0, 50, 0],
          y: [0, -30, 0],
          rotate: [-10, 0, -10]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/3 left-1/4 hidden md:block"
      >
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-warm-brown/60">
          <path d="M10 50L90 20L40 60L10 50Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
          <path d="M40 60L90 20L60 90L40 60Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
          <path d="M40 60L50 75L60 60" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* --- PAPER FLOWERS --- */}
      
      {/* Top Right Flower */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{ opacity: 0.12, scale: 1, rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 right-10 md:top-24 md:right-48"
      >
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-soft-yellow">
          {/* Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <path 
              key={angle}
              d="M50 50C50 50 60 20 70 20C80 20 80 35 70 50C60 65 50 50 50 50Z" 
              fill="currentColor" 
              fillOpacity="0.1" 
              stroke="currentColor" 
              strokeWidth="0.5"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.5" />
          {/* Fold lines on petals */}
          {[0, 90, 180, 270].map((angle) => (
            <line key={`line-${angle}`} x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" transform={`rotate(${angle} 50 50)`} />
          ))}
        </svg>
      </motion.div>

      {/* Bottom Left Small Flower Group */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className="absolute bottom-1/4 left-10 hidden md:block"
      >
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-warm-brown/40">
           <path d="M50 50L70 30M50 50L30 30M50 50L30 70M50 50L70 70" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
           <rect x="40" y="40" width="20" height="20" stroke="currentColor" strokeWidth="0.75" rotate="45" />
           <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </motion.div>

      {/* --- SCATTERED PAPER BITS --- */}
      
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.03, 0.08, 0.03],
            y: [0, i % 2 === 0 ? -15 : 15, 0],
            rotate: [i * 10, i * 10 + 5, i * 10]
          }}
          transition={{ 
            duration: 12 + i * 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bg-white/10 border border-white/20 shadow-sm"
          style={{ 
            width: `${30 + i * 20}px`,
            height: `${20 + i * 15}px`,
            top: `${15 + i * 14}%`, 
            left: i % 2 === 0 ? `${5 + i * 2}%` : `${85 - i * 2}%`,
            borderRadius: '1px',
            clipPath: 'polygon(5% 0, 95% 10%, 100% 90%, 0 100%)',
            backdropFilter: 'blur(1px)'
          }}
        />
      ))}

      {/* --- DASHED FOLD MARKS --- */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeDasharray="10 15" />
        <line x1="90%" y1="0" x2="90%" y2="100%" stroke="currentColor" strokeDasharray="10 15" />
        <path d="M0 20% Q 50% 25% 100% 20%" fill="none" stroke="currentColor" strokeDasharray="5 10" />
      </svg>

      {/* --- CORNER FOLD ACCENT --- */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-warm-brown rotate-45 shadow-2xl"></div>
      </div>
    </div>
  );
};

export default DecorationLayer;

