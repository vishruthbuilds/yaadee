import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { fetchTimeCapsule } from '../api';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [pageIndex, setPageIndex] = useState(0); 
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const [isFlipping, setIsFlipping] = useState(false);
  
  const reelRef = useRef(null);
  const crankRef = useRef(null);
  const crankRotate = useMotionValue(0);
  const springRotate = useSpring(crankRotate, { stiffness: 60, damping: 25 });
  
  // Infinite rotation tracking
  const lastAngle = useRef(null);
  const totalRotation = useRef(0);

  useEffect(() => {
    const loadData = async () => {
      const tcData = await fetchTimeCapsule();
      setData(tcData);
    };
    loadData();
  }, []);

  const handleCrankDrag = (event, info) => {
    if (!crankRef.current) return;
    const rect = crankRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate current raw angle (-180 to 180)
    let currentAngle = Math.atan2(info.point.y - centerY, info.point.x - centerX) * (180 / Math.PI);
    
    if (lastAngle.current !== null) {
      let delta = currentAngle - lastAngle.current;
      
      // Handle the 180 to -180 jump
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      totalRotation.current += delta;
      crankRotate.set(totalRotation.current);
    }
    
    lastAngle.current = currentAngle;
  };

  const handleDragEnd = () => {
    lastAngle.current = null;
  };

  // Recalibrated Crank Logic: 360 deg = 1 image width (~45vw)
  useEffect(() => {
    const unsubscribe = springRotate.on("change", (latest) => {
      if (reelRef.current && section === 'reel') {
        const reel = reelRef.current;
        const frameWidth = window.innerWidth * 0.45 + 32;
        // Map rotation to scroll position (positive only for reel)
        const scrollPos = (latest / 360) * frameWidth;
        reel.scrollLeft = Math.abs(scrollPos);
      }
    });
    return () => unsubscribe();
  }, [springRotate, section]);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = [...(data.reel_images || []), ...(data.reel_images || []), ...(data.reel_images || [])];
  const finalVideo = data.final_video;

  // Group images into pairs for the spread layout
  const imageSpreads = [];
  for (let i = 0; i < bookImages.length; i += 2) {
    imageSpreads.push([bookImages[i], bookImages[i + 1] || null]);
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center py-20 px-4"
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-accent uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Memory Collection</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-ink mb-6">Volume I: The Archive</h1>
              <p className="text-stone-500 font-serif italic">Scroll down to revisit the journey, one sheet at a time.</p>
            </div>

            <div className="w-full max-w-6xl space-y-12 md:space-y-24">
              {imageSpreads.map((spread, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 bg-white/50 p-2 md:p-4 shadow-xl border border-stone-200/50 rounded-sm"
                >
                  {/* Left Page */}
                  <div className="relative aspect-[1/1.414] bg-[#faf7f2] overflow-hidden border-r border-stone-200/30">
                    <div className="absolute inset-0 page-texture opacity-[0.03]"></div>
                    {spread[0] && (
                      <img src={spread[0]} className="w-full h-full object-cover" alt={`Memory ${idx * 2 + 1}`} />
                    )}
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none"></div>
                  </div>

                  {/* Right Page */}
                  <div className="relative aspect-[1/1.414] bg-[#faf7f2] overflow-hidden">
                    <div className="absolute inset-0 page-texture opacity-[0.03]"></div>
                    {spread[1] && (
                      <img src={spread[1]} className="w-full h-full object-cover" alt={`Memory ${idx * 2 + 2}`} />
                    )}
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mt-32 mb-20 text-center"
            >
              <p className="text-stone-400 font-serif italic mb-8 italic text-lg">The story continues...</p>
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setSection('reel');
                }}
                className="btn-primary px-16 py-4 text-xl"
              >
                Go to Projection Room &rarr;
              </button>
            </motion.div>
          </motion.section>
        )}

        {section === 'reel' && (
          <motion.section 
            key="reel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen flex flex-col items-center justify-center bg-[#0d0d0c] relative overflow-hidden"
          >
            <div className="text-center mb-16 z-10">
              <span className="text-stone-700 uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Projection Room</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white/80">Cinematic Stream</h1>
            </div>

            <div className="w-full relative py-12 flex flex-col items-center">
              <div 
                ref={reelRef}
                className="w-full flex gap-8 px-[25%] overflow-x-hidden"
              >
                {reelImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-[45vw] aspect-video bg-stone-900 border-y-[15px] border-dashed border-stone-800 relative shadow-2xl overflow-hidden">
                    <img src={img} className="w-full h-full object-cover opacity-60" alt="" />
                  </div>
                ))}
              </div>

              <div className="mt-24 relative flex flex-col items-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold">Spin indefinitely to project</p>
                
                <div ref={crankRef} className="relative w-48 h-48 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full bg-stone-900 border-4 border-stone-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
                  
                  <motion.div 
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0}
                    onDrag={handleCrankDrag}
                    onDragEnd={handleDragEnd}
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
          </motion.section>
        )}

        {section === 'video' && (
          <motion.section 
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen w-full bg-black flex items-center justify-center overflow-hidden"
          >
            {finalVideo ? (
              <video src={finalVideo} autoPlay loop className="landscape-video opacity-80" />
            ) : (
              <div className="text-center p-8 text-stone-700 font-serif italic text-2xl">Finishing the reel...</div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsule;
