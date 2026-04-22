import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { fetchTimeCapsule } from '../api';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Index of image on the RIGHT
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const [isFlipping, setIsFlipping] = useState(false);
  
  const reelRef = useRef(null);
  const crankRotate = useMotionValue(0);
  const springRotate = useSpring(crankRotate, { stiffness: 50, damping: 20 });
  
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
        // Rotation driving scroll (360 degrees = 500px scroll)
        const scrollPos = (latest / 360) * 800; 
        reelRef.current.scrollLeft = scrollPos % (maxScroll + 1);
      }
    });
    return () => unsubscribe();
  }, [springRotate, section]);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = data.reel_images || [];
  const finalVideo = data.final_video;

  const turnPage = () => {
    if (isFlipping || currentIndex >= bookImages.length - 1) {
       if (currentIndex >= bookImages.length - 1) setSection('reel');
       return;
    }
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsFlipping(false);
    }, 800);
  };

  const prevPage = () => {
    if (isFlipping || currentIndex <= 0) return;
    setIsFlipping(true);
    // Reverse animation logic would go here, for now simple jump
    setCurrentIndex(prev => prev - 1);
    setIsFlipping(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-hidden selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            className="h-screen flex flex-col items-center justify-center p-4 relative"
          >
            {/* Decorations */}
            <img src="/decorations.png" className="absolute top-10 left-10 w-32 opacity-20 pointer-events-none -rotate-12" alt="" />
            <img src="/decorations.png" className="absolute bottom-10 right-10 w-48 opacity-20 pointer-events-none rotate-12 scale-x-[-1]" alt="" />

            <div className="text-center mb-10 z-10">
              <span className="text-accent uppercase tracking-[0.5em] text-[10px] mb-2 block font-bold">Volume I</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-ink">The Memory Album</h1>
            </div>

            {/* 3D BOOK - A4 PROPORTIONS */}
            <div className="relative perspective-2000 w-full max-w-5xl aspect-[1.414/1] flex items-center justify-center">
              <div className="relative w-full h-full flex bg-[#ede9e1] rounded shadow-[0_50px_100px_rgba(0,0,0,0.2)] overflow-hidden">
                
                {/* LEFT SIDE (Static Base) */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden border-r border-stone-200/50">
                  <div className="absolute inset-0 page-texture"></div>
                  {currentIndex > 0 && (
                    <img 
                      src={bookImages[currentIndex - 1]} 
                      className="w-full h-full object-cover" 
                      alt="Left Page" 
                    />
                  )}
                </div>

                {/* RIGHT SIDE (Static Base) */}
                <div className="w-1/2 h-full bg-[#faf7f2] relative overflow-hidden">
                  <div className="absolute inset-0 page-texture"></div>
                  {currentIndex + 1 < bookImages.length && (
                    <img 
                      src={bookImages[currentIndex + 1]} 
                      className="w-full h-full object-cover" 
                      alt="Next Page" 
                    />
                  )}
                </div>

                {/* THE FLIPPING PAGE */}
                <motion.div 
                  key={currentIndex}
                  initial={{ rotateY: 0 }}
                  animate={isFlipping ? { rotateY: -180 } : { rotateY: 0 }}
                  transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
                  style={{ transformOrigin: "left center", left: "50%" }}
                  className="absolute top-0 w-1/2 h-full preserve-3d z-20 pointer-events-none"
                >
                  {/* Front of flipping page (Current Image) */}
                  <div className="absolute inset-0 backface-hidden bg-[#faf7f2] shadow-2xl overflow-hidden border-l border-stone-100">
                    <div className="absolute inset-0 page-texture"></div>
                    <img src={bookImages[currentIndex]} className="w-full h-full object-cover" alt="Flipping Front" />
                  </div>
                  
                  {/* Back of flipping page (Current Image - but it's the 'back' side) */}
                  {/* In a real book, the back of Page 1 is Page 2. 
                      User said: "image in left side is just a flipped image of right side... this is a bug".
                      So we show the SAME image on the back, but properly aligned. 
                      Wait, if we flip Page N, the back of that physical sheet is still Page N.
                  */}
                  <div className="absolute inset-0 bg-[#faf7f2] shadow-2xl overflow-hidden border-r border-stone-100" style={{ transform: "rotateY(180deg)" }}>
                    <div className="absolute inset-0 page-texture"></div>
                    <img src={bookImages[currentIndex]} className="w-full h-full object-cover grayscale-[0.1]" alt="Flipping Back" />
                  </div>
                </motion.div>

                {/* Spine Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 bg-gradient-to-r from-black/5 via-transparent to-black/5 z-30 pointer-events-none"></div>
              </div>

              {/* Interaction Overlay */}
              <div className="absolute inset-0 z-40 flex">
                <div onClick={prevPage} className="w-1/2 h-full cursor-pointer group flex items-center justify-start p-8">
                   <div className="w-12 h-12 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">&larr;</div>
                </div>
                <div onClick={turnPage} className="w-1/2 h-full cursor-pointer group flex items-center justify-end p-8">
                   <div className="w-12 h-12 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">&rarr;</div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
               <p className="text-stone-400 font-serif italic text-sm">Click either side of the album to turn pages.</p>
               <div className="flex gap-2">
                 {bookImages.map((_, i) => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-accent w-4' : 'bg-stone-200'}`} />
                 ))}
               </div>
            </div>
          </motion.section>
        )}

        {section === 'reel' && (
          <motion.section 
            key="reel"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="h-screen flex flex-col items-center justify-center bg-[#0d0d0c] relative overflow-hidden"
          >
            <div className="text-center mb-20 z-10">
              <span className="text-stone-700 uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">Chapter II</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white/80">The Film Reel</h1>
            </div>

            {/* Reel Container */}
            <div className="w-full relative py-12 flex flex-col items-center">
              <div 
                ref={reelRef}
                className="w-full flex gap-4 px-[10%] overflow-x-hidden"
              >
                {reelImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-[45vw] aspect-video bg-stone-900 border-y-[15px] border-dashed border-stone-800 relative shadow-2xl overflow-hidden">
                    <img src={img} className="w-full h-full object-cover opacity-70" alt={`Reel ${i}`} />
                    <div className="absolute top-2 left-2 text-[8px] text-stone-600 font-mono">FRAME {i + 1}</div>
                  </div>
                ))}
              </div>

              {/* CRANK HANDLE CONTROL */}
              <div className="mt-24 relative flex flex-col items-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-[0.4em] mb-8 font-bold">Rotate the crank to shoot</p>
                
                <div className="relative w-40 h-40">
                  {/* Crank Base */}
                  <div className="absolute inset-0 rounded-full bg-stone-900 border-4 border-stone-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                  
                  {/* Rotating Handle */}
                  <motion.div 
                    drag="x"
                    onDrag={(e, info) => crankRotate.set(crankRotate.get() + info.delta.x * 2)}
                    style={{ rotate: springRotate }}
                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                       {/* The Stick */}
                       <div className="w-1 h-20 bg-gradient-to-b from-stone-400 to-stone-700 origin-bottom translate-y-[-50%] rounded-full shadow-lg"></div>
                       {/* The Brass Handle Asset */}
                       <img 
                          src="/crank.png" 
                          className="w-16 h-16 absolute top-0 -translate-y-1/2 hover:scale-110 transition-transform" 
                          style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}
                          alt="Crank Handle" 
                       />
                    </div>
                  </motion.div>

                  {/* Center Bolt */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-700 border-2 border-stone-600 shadow-inner"></div>
                </div>
                
                <button 
                  onClick={() => setSection('video')}
                  className="mt-16 btn-primary border-white text-white hover:bg-white hover:text-black px-12 transition-all duration-700"
                >
                  Final Memory &darr;
                </button>
              </div>
            </div>

            {/* Grain Overlay */}
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
              <div className="w-full h-full">
                 <video src={finalVideo} autoPlay loop className="w-full h-full object-cover grayscale-[0.3] contrast-125" />
                 <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)]"></div>
              </div>
            ) : (
              <div className="text-center p-8 space-y-4">
                 <h2 className="text-3xl font-serif italic text-stone-700">Memory processing...</h2>
                 <button onClick={() => setSection('book')} className="btn-primary border-stone-800 text-stone-800">Return to Archive</button>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsule;
