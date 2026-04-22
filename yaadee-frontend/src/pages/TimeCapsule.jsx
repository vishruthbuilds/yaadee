import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { fetchTimeCapsule } from '../api';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [spreadIndex, setSpreadIndex] = useState(0); 
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const [isFlipping, setIsFlipping] = useState(false);
  
  const reelRef = useRef(null);
  const crankRef = useRef(null);
  const crankRotate = useMotionValue(0);
  const springRotate = useSpring(crankRotate, { stiffness: 60, damping: 25 });
  
  useEffect(() => {
    const loadData = async () => {
      const tcData = await fetchTimeCapsule();
      setData(tcData);
    };
    loadData();
  }, []);

  // Natural 360 rotation logic
  const handleCrankDrag = (event, info) => {
    if (!crankRef.current) return;
    const rect = crankRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center to pointer
    const angle = Math.atan2(info.point.y - centerY, info.point.x - centerX) * (180 / Math.PI);
    crankRotate.set(angle + 90); // Offset to start at top
  };

  useEffect(() => {
    const unsubscribe = springRotate.on("change", (latest) => {
      if (reelRef.current && section === 'reel') {
        const maxScroll = reelRef.current.scrollWidth - window.innerWidth;
        // Map rotation to scroll
        const scrollPos = (latest % 360 + 360) % 360 / 360 * maxScroll;
        reelRef.current.scrollLeft = scrollPos;
      }
    });
    return () => unsubscribe();
  }, [springRotate, section]);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = data.reel_images || [];
  const finalVideo = data.final_video;

  // Book Logic:
  // Spread 0: Left=None, Right=Img 0
  // Spread 1: Left=Img 1, Right=Img 2
  // Spread 2: Left=Img 3, Right=Img 4
  const turnPage = () => {
    if (isFlipping) return;
    const nextIdx = spreadIndex + 1;
    if (nextIdx * 2 - 1 >= bookImages.length) {
       setSection('reel');
       return;
    }
    setIsFlipping(true);
    setTimeout(() => {
      setSpreadIndex(nextIdx);
      setIsFlipping(false);
    }, 800);
  };

  const prevPage = () => {
    if (isFlipping || spreadIndex === 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      setSpreadIndex(prev => prev - 1);
      setIsFlipping(false);
    }, 800);
  };

  const getLeftImg = () => {
    if (spreadIndex === 0) return null;
    return bookImages[spreadIndex * 2 - 1];
  };

  const getRightImg = () => {
    return bookImages[spreadIndex * 2];
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-hidden selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className="h-screen flex flex-col items-center justify-center p-4 relative"
          >
            <div className="text-center mb-10 z-10">
              <span className="text-accent uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Volume I</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-ink">The Memory Album</h1>
            </div>

            {/* 3D BOOK */}
            <div className="relative perspective-2000 w-full max-w-5xl aspect-[1.414/1] flex items-center justify-center">
              <div className="relative w-full h-full flex bg-[#f5f2eb] rounded shadow-2xl overflow-hidden border border-stone-200/50">
                
                {/* LEFT PAGE */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden border-r border-stone-200/30">
                  <div className="absolute inset-0 page-texture"></div>
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={spreadIndex}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={getLeftImg()} 
                      className="w-full h-full object-cover" 
                    />
                  </AnimatePresence>
                </div>

                {/* RIGHT PAGE */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden">
                  <div className="absolute inset-0 page-texture"></div>
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={spreadIndex}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      src={getRightImg()} 
                      className="w-full h-full object-cover" 
                    />
                  </AnimatePresence>
                </div>

                {/* FLIPPING MASK (Visual only) */}
                {isFlipping && (
                  <motion.div 
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ transformOrigin: "left center", left: "50%" }}
                    className="absolute top-0 w-1/2 h-full preserve-3d z-20 pointer-events-none"
                  >
                     <div className="absolute inset-0 backface-hidden bg-[#faf7f2] shadow-2xl overflow-hidden border-l border-stone-100">
                        <div className="absolute inset-0 page-texture"></div>
                        <img src={getRightImg()} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="absolute inset-0 bg-[#faf7f2] shadow-2xl overflow-hidden border-r border-stone-100" style={{ transform: "rotateY(180deg)" }}>
                        <div className="absolute inset-0 page-texture"></div>
                        <img src={bookImages[(spreadIndex + 1) * 2 - 1]} className="w-full h-full object-cover" alt="" />
                     </div>
                  </motion.div>
                )}

                <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 z-30 pointer-events-none"></div>
              </div>

              {/* Controls */}
              <div className="absolute inset-0 z-40 flex">
                <div onClick={prevPage} className="w-1/2 h-full cursor-pointer" />
                <div onClick={turnPage} className="w-1/2 h-full cursor-pointer" />
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
               <p className="text-stone-400 font-serif italic text-sm">Spread {spreadIndex + 1}</p>
            </div>
          </motion.section>
        )}

        {section === 'reel' && (
          <motion.section 
            key="reel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col items-center justify-center bg-[#0d0d0c] relative overflow-hidden"
          >
            <div className="text-center mb-20 z-10">
              <span className="text-stone-700 uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Projection Hall</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white/80">Cinematic Stream</h1>
            </div>

            <div className="w-full relative py-12 flex flex-col items-center">
              <div 
                ref={reelRef}
                className="w-full flex gap-8 px-[20%] overflow-x-hidden"
              >
                {reelImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-[50vw] md:w-[40vw] aspect-video bg-stone-900 border-y-[15px] border-dashed border-stone-800 relative shadow-2xl overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000" alt={`Reel ${i}`} />
                  </div>
                ))}
              </div>

              {/* MECHANICAL CRANK - PERFECT ROTATION */}
              <div className="mt-24 relative flex flex-col items-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold">Spin the crank to shoot</p>
                
                <div ref={crankRef} className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full bg-stone-900 border-4 border-stone-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
                  
                  <motion.div 
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0}
                    onDrag={handleCrankDrag}
                    style={{ rotate: springRotate }}
                    className="absolute w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                  >
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-2xl">
                       <rect x="48" y="10" width="4" height="40" fill="url(#brass-grad)" rx="2" />
                       <circle cx="50" cy="15" r="8" fill="url(#knob-grad)" stroke="#1a1a1a" strokeWidth="1" />
                       <defs>
                         <linearGradient id="brass-grad" x1="0" y1="0" x2="1" y2="0">
                           <stop offset="0%" stopColor="#b8860b" />
                           <stop offset="50%" stopColor="#ffd700" />
                           <stop offset="100%" stopColor="#b8860b" />
                         </linearGradient>
                         <linearGradient id="knob-grad" x1="0" y1="0" x2="1" y2="1">
                           <stop offset="0%" stopColor="#4a4a4a" />
                           <stop offset="100%" stopColor="#1a1a1a" />
                         </linearGradient>
                       </defs>
                    </svg>
                  </motion.div>

                  <div className="w-10 h-10 rounded-full bg-stone-800 border-4 border-stone-700 shadow-xl z-30 pointer-events-none" />
                </div>
                
                <button 
                  onClick={() => setSection('video')}
                  className="mt-16 btn-primary border-white text-white hover:bg-white hover:text-black px-12"
                >
                  Watch Final Movie &rarr;
                </button>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.05] grain-overlay"></div>
          </motion.section>
        )}

        {section === 'video' && (
          <motion.section 
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-black flex items-center justify-center relative overflow-hidden"
          >
            {finalVideo ? (
              <video src={finalVideo} autoPlay loop className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="text-center p-8 text-stone-700 font-serif italic text-2xl">Finishing the reel...</div>
            )}
            <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,1)] pointer-events-none"></div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsule;
