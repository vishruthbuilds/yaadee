import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { fetchTimeCapsule } from '../api';
import PageWrapper from '../components/PageWrapper';

const TimeCapsule = () => {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [section, setSection] = useState('book'); // 'book', 'reel', 'video'
  const reelRef = useRef(null);
  
  useEffect(() => {
    const loadData = async () => {
      const tcData = await fetchTimeCapsule();
      setData(tcData);
    };
    loadData();
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-serif italic text-stone-400">Opening the archive...</div>;

  const bookImages = data.book_images || [];
  const reelImages = data.reel_images || [];
  const finalVideo = data.final_video;

  const nextSection = () => {
    if (section === 'book') setSection('reel');
    else if (section === 'reel') setSection('video');
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] overflow-hidden">
      <AnimatePresence mode="wait">
        {section === 'book' && (
          <motion.section 
            key="book"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-screen flex flex-col items-center justify-center p-4"
          >
            <div className="text-center mb-12">
              <span className="text-accent uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium">Chapter I</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-ink">The Book of Memories</h1>
            </div>

            <div className="relative perspective-1000 w-full max-w-2xl aspect-[4/3] group">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPage}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden border border-stone-100 flex items-center justify-center relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Page texture overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                  
                  {bookImages[currentPage] ? (
                    <img src={bookImages[currentPage]} alt={`Page ${currentPage}`} className="w-full h-full object-cover p-8 md:p-12" />
                  ) : (
                    <div className="text-stone-300 font-serif italic text-xl">A blank page for a quiet thought.</div>
                  )}

                  {/* Page number */}
                  <div className="absolute bottom-4 right-8 font-serif italic text-stone-300 text-sm">{currentPage + 1} / {Math.max(bookImages.length, 1)}</div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="absolute top-1/2 -left-12 -translate-y-1/2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 text-stone-300 hover:text-ink transition-colors ${currentPage === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                  &larr;
                </button>
              </div>
              <div className="absolute top-1/2 -right-12 -translate-y-1/2">
                <button 
                  onClick={() => {
                    if (currentPage < bookImages.length - 1) setCurrentPage(prev => prev + 1);
                    else nextSection();
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 text-stone-300 hover:text-ink transition-colors"
                >
                  {currentPage === bookImages.length - 1 ? '↓' : '→'}
                </button>
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-stone-400 text-[10px] uppercase tracking-widest italic"
            >
              Swipe or use arrows to flip through time.
            </motion.p>
          </motion.section>
        )}

        {section === 'reel' && (
          <motion.section 
            key="reel"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="h-screen flex flex-col items-center justify-center bg-[#1a1917] relative overflow-hidden"
          >
            <div className="text-center mb-16 z-10">
              <span className="text-stone-500 uppercase tracking-[0.4em] text-[10px] mb-4 block italic font-medium">Chapter II</span>
              <h1 className="text-4xl md:text-6xl font-serif italic text-white">The Cinematic Reel</h1>
            </div>

            {/* Reel Container */}
            <div className="w-full relative py-12">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#1a1917] to-transparent z-10"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#1a1917] to-transparent z-10"></div>
              
              <motion.div 
                ref={reelRef}
                drag="x"
                dragConstraints={{ left: -((reelImages.length || 1) * 350), right: 0 }}
                className="flex gap-4 px-32 cursor-grab active:cursor-grabbing"
              >
                {reelImages.length > 0 ? reelImages.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-[300px] md:w-[400px] aspect-video bg-stone-900 border-y-8 border-dashed border-stone-800 relative overflow-hidden group">
                    <img src={img} alt={`Reel ${i}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale group-hover:grayscale-0" />
                    <div className="absolute top-2 left-2 text-[8px] text-stone-600 font-mono">FRAME {i + 1024}</div>
                  </div>
                )) : (
                  [1,2,3,4].map(i => (
                    <div key={i} className="flex-shrink-0 w-[300px] md:w-[400px] aspect-video bg-stone-900 border-y-8 border-dashed border-stone-800 flex items-center justify-center">
                      <div className="w-12 h-12 border border-stone-800 rounded-full animate-pulse"></div>
                    </div>
                  ))
                )}
              </motion.div>
            </div>

            <div className="mt-20 z-10">
              <button 
                onClick={nextSection}
                className="group flex flex-col items-center gap-4"
              >
                <p className="text-stone-500 italic font-serif text-xl group-hover:text-white transition-colors duration-500">"But this isn't everything..."</p>
                <div className="btn-primary border-white text-white hover:bg-white hover:text-black">Relive More &darr;</div>
              </button>
            </div>

            {/* Film grain effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
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
              <div className="relative w-full h-full">
                <video 
                  src={finalVideo} 
                  autoPlay 
                  muted={false} 
                  playsInline 
                  className="w-full h-full object-cover"
                  onEnded={() => setSection('book')} // Optional: loop back or show finish
                />
                {/* Immersive overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60"></div>
                <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
              </div>
            ) : (
              <div className="text-center p-8">
                <h2 className="text-2xl md:text-4xl font-serif italic text-stone-600">Final memory will appear here.</h2>
                <button onClick={() => setSection('book')} className="mt-8 btn-primary border-stone-700 text-stone-700">Return to Archive</button>
              </div>
            )}

            {/* Grain & Noise */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.1] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeCapsule;
