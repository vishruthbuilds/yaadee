import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { fetchTimeCapsule } from '../api';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // This represents the right-side page
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const reelRef = useRef(null);
  
  // Rotating Wheel Logic
  const wheelRotate = useMotionValue(0);
  const springRotate = useSpring(wheelRotate, { stiffness: 100, damping: 30 });
  
  useEffect(() => {
    const loadData = async () => {
      const tcData = await fetchTimeCapsule();
      setData(tcData);
    };
    loadData();
  }, []);

  // Update reel scroll when wheel rotates
  useEffect(() => {
    const unsubscribe = springRotate.on("change", (latest) => {
      if (reelRef.current) {
        const maxScroll = reelRef.current.scrollWidth - window.innerWidth;
        // Map rotation to scroll position (linear)
        const scrollPos = (latest * 2) % maxScroll; 
        reelRef.current.scrollLeft = Math.abs(scrollPos);
      }
    });
    return () => unsubscribe();
  }, [springRotate]);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = data.reel_images || [];
  const finalVideo = data.final_video;

  const nextSection = () => {
    if (section === 'book') setSection('reel');
    else if (section === 'reel') setSection('video');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-hidden selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: -20 }}
            className="h-screen flex flex-col items-center justify-center p-4 relative"
          >
            {/* Background Decorations */}
            <div className="absolute top-10 left-10 w-32 h-32 opacity-40 pointer-events-none rotate-[-15deg]">
              <img src="/decorations.png" className="w-full h-full object-contain" alt="" />
            </div>
            <div className="absolute bottom-10 right-10 w-48 h-48 opacity-30 pointer-events-none rotate-[20deg] flip-x">
              <img src="/decorations.png" className="w-full h-full object-contain" alt="" />
            </div>

            <div className="text-center mb-8 z-10">
              <span className="text-accent uppercase tracking-[0.5em] text-[10px] mb-2 block italic font-bold">The Archive</span>
              <h1 className="text-5xl md:text-7xl font-serif italic text-ink">Book of Memories</h1>
            </div>

            {/* 3D BOOK CONTAINER */}
            <div className="relative perspective-2000 w-full max-w-4xl aspect-[1.4/1] flex items-center justify-center">
              <div className="relative w-[85%] h-[85%] flex shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-stone-100 rounded-md">
                
                {/* Left Page (Fixed/Back) - Shows the PREVIOUS page */}
                <div className="w-1/2 h-full bg-[#faf7f2] border-r border-stone-200 shadow-inner relative overflow-hidden rounded-l-md">
                   <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                   {currentPage > 0 ? (
                     <img 
                        src={bookImages[currentPage - 1]} 
                        className="w-full h-full object-cover p-6 grayscale-[0.2]" 
                        alt=""
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center p-12 text-center">
                        <p className="font-serif italic text-stone-300 text-lg leading-relaxed">Turn the page to begin the journey.</p>
                     </div>
                   )}
                </div>

                {/* Right Page (Fixed/Base) - Shows the CURRENT page */}
                <div className="w-1/2 h-full bg-[#faf7f2] shadow-inner relative overflow-hidden rounded-r-md">
                   <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                   <img 
                      src={bookImages[currentPage]} 
                      className="w-full h-full object-cover p-6 grayscale-[0.2]" 
                      alt=""
                   />
                </div>

                {/* FLIPPING PAGE LEAF */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPage}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ transformOrigin: "left center", left: "50%" }}
                    className="absolute top-0 w-1/2 h-full preserve-3d z-20 pointer-events-none"
                  >
                    {/* Front of flipping page (facing right, shows old right image) */}
                    <div className="absolute inset-0 backface-hidden bg-[#faf7f2] border-l border-stone-100 shadow-xl overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                      <img src={bookImages[currentPage - 1]} className="w-full h-full object-cover p-6" alt="" />
                    </div>
                    
                    {/* Back of flipping page (facing left, shows the image that just moved to left) */}
                    <div className="absolute inset-0 bg-[#faf7f2] border-r border-stone-100 shadow-xl overflow-hidden" style={{ transform: "rotateY(180deg)" }}>
                      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                      <img src={bookImages[currentPage - 1]} className="w-full h-full object-cover p-6" alt="" />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Book Spine Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 z-30 pointer-events-none"></div>
              </div>

              {/* Navigation Controls */}
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 border border-stone-100 shadow-lg text-stone-400 hover:text-accent transition-all z-40 group"
              >
                <span className="text-2xl group-hover:-translate-x-1 inline-block transition-transform">&larr;</span>
              </button>
              <button 
                onClick={() => {
                  if (currentPage < bookImages.length - 1) setCurrentPage(p => p + 1);
                  else nextSection();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/80 border border-stone-100 shadow-lg text-stone-400 hover:text-accent transition-all z-40 group"
              >
                <span className="text-2xl group-hover:translate-x-1 inline-block transition-transform">
                  {currentPage === bookImages.length - 1 ? '↓' : '→'}
                </span>
              </button>
            </div>

            <div className="mt-8 flex gap-4">
              {bookImages.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === currentPage ? 'bg-accent w-6' : 'bg-stone-200'}`} />
              ))}
            </div>
          </motion.section>
        )}

        {section === 'reel' && (
          <motion.section 
            key="reel"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden"
          >
            <div className="text-center mb-12 z-10">
              <span className="text-stone-600 uppercase tracking-[0.6em] text-[10px] mb-2 block font-bold">The Projection</span>
              <h1 className="text-5xl md:text-7xl font-serif italic text-white/90">Cinematic Reel</h1>
            </div>

            {/* Reel Container */}
            <div className="w-full relative flex items-center">
              
              {/* FIXED REEL WHEEL (Left Side) */}
              <div className="absolute left-10 md:left-24 z-20 flex flex-col items-center">
                <motion.div 
                  drag="x"
                  onDrag={(e, info) => wheelRotate.set(wheelRotate.get() + info.delta.x * 2)}
                  style={{ rotate: springRotate }}
                  className="w-64 h-64 md:w-80 md:h-80 cursor-grab active:cursor-grabbing group relative"
                >
                  <img src="/reel_wheel.png" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" alt="Film Reel" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-accent/20 transition-colors pointer-events-none" />
                </motion.div>
                <p className="text-stone-600 text-[10px] uppercase tracking-[0.4em] mt-8 font-bold">Turn to relive</p>
              </div>

              {/* The Scrolling Strip */}
              <div 
                ref={reelRef}
                className="w-full flex gap-12 pl-[40%] md:pl-[35%] pr-20 overflow-x-hidden py-20"
              >
                {reelImages.map((img, i) => (
                  <motion.div 
                    key={i} 
                    className="flex-shrink-0 w-[400px] md:w-[600px] aspect-video bg-stone-900 border-y-[20px] border-dashed border-stone-800 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] group overflow-hidden"
                  >
                    <img src={img} alt={`Frame ${i}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                    <div className="absolute top-4 left-4 text-[10px] text-stone-700 font-mono tracking-tighter uppercase">SAFETY FILM • {i + 1990}</div>
                  </motion.div>
                ))}
              </div>

              {/* Gradient Mask to make film look like it's coming out of the reel */}
              <div className="absolute left-[30%] top-0 bottom-0 w-40 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
            </div>

            <button 
              onClick={nextSection}
              className="mt-16 btn-primary border-white text-white hover:bg-white hover:text-black px-12 z-20"
            >
              Relive More &darr;
            </button>

            {/* Film Dust & Scratches Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1] mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </motion.section>
        )}

        {section === 'video' && ( section === 'video' && (
          <motion.section 
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen bg-black flex items-center justify-center relative overflow-hidden"
          >
            {finalVideo ? (
              <div className="relative w-full h-full max-w-6xl aspect-video rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                <video 
                  src={finalVideo} 
                  autoPlay 
                  loop
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {/* Vignette & Gradients */}
                <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"></div>
              </div>
            ) : (
              <div className="text-center space-y-8">
                 <h2 className="text-3xl md:text-5xl font-serif italic text-stone-700">The end of the archive.</h2>
                 <button onClick={() => setSection('book')} className="btn-primary border-stone-800 text-stone-800">Restart Journey</button>
              </div>
            )}
          </motion.section>
        ))}
      </AnimatePresence>

      <style jsx>{`
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .flip-x { transform: scaleX(-1); }
      `}</style>
    </div>
  );
};

export default TimeCapsule;
