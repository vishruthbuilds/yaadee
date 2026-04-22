import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { fetchTimeCapsule } from '../api';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [sheetIndex, setSheetIndex] = useState(0); // Which sheet is currently on the RIGHT
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const [isFlipping, setIsFlipping] = useState(false);
  
  const reelRef = useRef(null);
  const crankRotate = useMotionValue(0);
  const springRotate = useSpring(crankRotate, { stiffness: 40, damping: 20 });
  
  useEffect(() => {
    const loadData = async () => {
      const tcData = await fetchTimeCapsule();
      setData(tcData);
    };
    loadData();
  }, []);

  // Crank rotation driving reel scroll
  useEffect(() => {
    const unsubscribe = springRotate.on("change", (latest) => {
      if (reelRef.current && section === 'reel') {
        const maxScroll = reelRef.current.scrollWidth - window.innerWidth;
        const scrollPos = (latest / 360) * 1200; // Drive speed
        reelRef.current.scrollLeft = Math.abs(scrollPos % (maxScroll + 1));
      }
    });
    return () => unsubscribe();
  }, [springRotate, section]);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = data.reel_images || [];
  const finalVideo = data.final_video;

  const turnPage = () => {
    if (isFlipping) return;
    const nextIdx = sheetIndex + 1;
    if (nextIdx * 2 >= bookImages.length) {
       setSection('reel');
       return;
    }
    setIsFlipping(true);
    setTimeout(() => {
      setSheetIndex(nextIdx);
      setIsFlipping(false);
    }, 800);
  };

  const prevPage = () => {
    if (isFlipping || sheetIndex === 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      setSheetIndex(prev => prev - 1);
      setIsFlipping(false);
    }, 800);
  };

  // Logic for page images:
  // Sheet N: Front = images[2N], Back = images[2N + 1]
  const currentFront = bookImages[sheetIndex * 2];
  const currentBack = bookImages[sheetIndex * 2 + 1];
  const nextFront = bookImages[(sheetIndex + 1) * 2];
  const prevBack = bookImages[(sheetIndex - 1) * 2 + 1];

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-hidden selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-screen flex flex-col items-center justify-center p-4 relative"
          >
            {/* Decorations */}
            <img src="/decorations.png" className="absolute top-10 left-10 w-32 opacity-20 pointer-events-none -rotate-12" alt="" />
            <img src="/decorations.png" className="absolute bottom-10 right-10 w-48 opacity-20 pointer-events-none rotate-12 scale-x-[-1]" alt="" />

            <div className="text-center mb-8 z-10">
              <span className="text-accent uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Album Archive</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-ink">Volume {sheetIndex + 1}</h1>
            </div>

            {/* 3D BOOK - A4 PROPORTIONS */}
            <div className="relative perspective-2000 w-full max-w-5xl aspect-[1.414/1] flex items-center justify-center">
              <div className="relative w-full h-full flex bg-[#f5f2eb] rounded shadow-2xl overflow-hidden border border-stone-200/50">
                
                {/* LEFT BASE (Previous Sheet Back) */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden border-r border-stone-200/30">
                  <div className="absolute inset-0 page-texture"></div>
                  {sheetIndex > 0 && (
                    <img 
                      src={prevBack} 
                      className="w-full h-full object-cover" 
                      alt="Prev Back" 
                    />
                  )}
                </div>

                {/* RIGHT BASE (Next Sheet Front) */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden">
                  <div className="absolute inset-0 page-texture"></div>
                  {nextFront && (
                    <img 
                      src={nextFront} 
                      className="w-full h-full object-cover" 
                      alt="Next Front" 
                    />
                  )}
                </div>

                {/* THE FLIPPING SHEET */}
                <motion.div 
                  key={sheetIndex}
                  initial={{ rotateY: 0 }}
                  animate={isFlipping ? { rotateY: -180 } : { rotateY: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{ transformOrigin: "left center", left: "50%" }}
                  className="absolute top-0 w-1/2 h-full preserve-3d z-20 pointer-events-none"
                >
                  {/* Front of flipping sheet (Current Front) */}
                  <div className="absolute inset-0 backface-hidden bg-[#faf7f2] shadow-xl overflow-hidden border-l border-stone-100">
                    <div className="absolute inset-0 page-texture"></div>
                    {currentFront && <img src={currentFront} className="w-full h-full object-cover" alt="Front" />}
                  </div>
                  
                  {/* Back of flipping sheet (Current Back) */}
                  <div className="absolute inset-0 bg-[#faf7f2] shadow-xl overflow-hidden border-r border-stone-100" style={{ transform: "rotateY(180deg)" }}>
                    <div className="absolute inset-0 page-texture"></div>
                    {currentBack ? (
                      <img src={currentBack} className="w-full h-full object-cover" alt="Back" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-12 text-stone-200 italic font-serif">The story continues...</div>
                    )}
                  </div>
                </motion.div>

                {/* Spine Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 z-30 pointer-events-none"></div>
              </div>

              {/* Navigation Overlay */}
              <div className="absolute inset-0 z-40 flex">
                <div onClick={prevPage} className="w-1/2 h-full cursor-pointer group flex items-center justify-start p-8">
                   <div className="w-12 h-12 rounded-full bg-white/60 shadow-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100">&larr;</div>
                </div>
                <div onClick={turnPage} className="w-1/2 h-full cursor-pointer group flex items-center justify-end p-8">
                   <div className="w-12 h-12 rounded-full bg-white/60 shadow-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100">&rarr;</div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
               <p className="text-stone-400 font-serif italic text-sm">Turning page {sheetIndex + 1} of {Math.ceil(bookImages.length / 2)}</p>
               <div className="flex gap-2">
                 {Array.from({ length: Math.ceil(bookImages.length / 2) }).map((_, i) => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === sheetIndex ? 'bg-accent w-4' : 'bg-stone-200'}`} />
                 ))}
               </div>
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
                className="w-full flex gap-6 px-[15%] overflow-x-hidden"
              >
                {reelImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-[50vw] md:w-[40vw] aspect-video bg-stone-900 border-y-[15px] border-dashed border-stone-800 relative shadow-2xl overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000" alt={`Reel ${i}`} />
                  </div>
                ))}
              </div>

              {/* CUSTOM SVG CRANK HANDLE - ROTATES IN PLACE */}
              <div className="mt-24 relative flex flex-col items-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold">Spin the handle to project</p>
                
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* The Base Circle */}
                  <div className="absolute w-full h-full rounded-full bg-stone-900 border-4 border-stone-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
                  
                  {/* The Rotating Object */}
                  <motion.div 
                    drag="x"
                    onDrag={(e, info) => crankRotate.set(crankRotate.get() + info.delta.x * 3)}
                    style={{ rotate: springRotate }}
                    className="absolute w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                  >
                    {/* The Arm (SVG Stick) */}
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-2xl">
                       {/* The Arm Stick */}
                       <rect x="48" y="10" width="4" height="40" fill="url(#brass-grad)" rx="2" />
                       {/* The Handle Knob at the end */}
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

                  {/* The Static Center Pin */}
                  <div className="w-10 h-10 rounded-full bg-stone-800 border-4 border-stone-700 shadow-xl z-30" />
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
